import express from 'express';
import mysql2 from 'mysql2';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import PdfPrinter from "pdfmake";
const salt = 10;
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// --- CORRECCIÓN 1: Un solo bloque CORS para ambos ambientes ---
app.use(cors({
    origin: ["http://localhost:8082", "http://localhost:5173"], // Permite staging y desarrollo
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cookieParser());

// --- CORRECCIÓN 2: Usar variables de entorno para la conexión ---
const db = mysql2.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
  }
    console.log('Connected to the database as ID ' + db.threadId);
});

// ... (El resto de tu código de rutas, app.listen, etc., va aquí) ...
app.post('/register_user', (req, res) => {
    const sql = "INSERT INTO Trabajadores(`nombre`,`apellido_paterno`,`apellido_materno`,`usuario`,`contrasena`,`rol`) VALUES (?)";
    const sql_select = "SELECT * from Trabajadores where usuario=?";
    const sql_password = "INSERT INTO contrasenas(`encriptada`,`texto_plano`) VALUES (?,?)";
    const values = [req.body.usuario.toLowerCase()];
    db.query(sql_select, values, (err, data) => {
        if(err) return res.json({Error: "Error al buscar el usuario"});
        if(data.length>0){
            return res.json({Error: "El USUARIO ya está REGISTRADO"})
        }
        bcrypt.hash(req.body.contrasena, salt, (err, hash) => {
            if(err)return res.json({Error: "Error al encriptar la contraseña"});
            const values = [req.body.nombre.toLowerCase().replace(/(^|\s)\S/gu, c => c.toUpperCase()),
                req.body.apellido_paterno.toLowerCase().replace(/(^|\s)\S/gu, c => c.toUpperCase()),
                req.body.apellido_materno.toLowerCase().replace(/(^|\s)\S/gu, c => c.toUpperCase()),
                req.body.usuario.toLowerCase(), hash, req.body.rol];
            db.query(sql, [values], (err, result) => {
                if(err) return res.json({Error: "Error al registrar el usuario"});
                db.query(sql_password, [hash, req.body.contrasena], (err, result) => {
                    if(err) return res.json({Error: "Error al registrar la contraseña"});
                    if(result.affectedRows > 0){
                        return res.status(200).json({ message: 'Usuario registrado exitosamente' });
                    }else{
                        console.log(err);
                    }
                })
            })
        })
    }
    )
})


app.post('/update_user', (req, res) => {
    const sql = "UPDATE Trabajadores SET nombre=?, apellido_paterno=?, apellido_materno=?, contrasena=?, rol=? WHERE usuario=?";
    const password_replace = "UPDATE  contrasenas SET encriptada=?, texto_plano=? WHERE encriptada=(SELECT contrasena from Trabajadores WHERE usuario=?)";
    bcrypt.hash(req.body.contrasena, salt, (err, hash) => {
        if(err)return res.json({Error: "Error al encriptar la contraseña"});
        const values = [req.body.nombre.toLowerCase().replace(/(^|\s)\S/gu, c => c.toUpperCase()),
            req.body.apellido_paterno.toLowerCase().replace(/(^|\s)\S/gu, c => c.toUpperCase()),
            req.body.apellido_materno.toLowerCase().replace(/(^|\s)\S/gu, c => c.toUpperCase()),
            hash,req.body.rol, req.body.usuario];
        db.query(password_replace,[hash,req.body.contrasena,req.body.usuario] , (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ Error: "Error updating user data" });
            }
            db.query(sql, values, (err, result) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ Error: "Error updating password" });
                }
                if (result.affectedRows > 0) {
                    return res.status(200).json({ message: 'User updated successfully' });
                } else {
                    console.log("No user updated");
                }
            });
        });
        })
 });

app.post('/login', (req, res) => {
    try {
        console.log("PISTA 1: Entrando en la ruta /login.");
        const username = req.body.username;
        const password = req.body.password;

        if (!username || !password) {
            console.log("ERROR: Usuario o contraseña no recibidos en la petición.");
            return res.status(400).json({ Error: "Falta usuario o contraseña." });
        }

        console.log(`PISTA 2: Buscando usuario '${username}' en la base de datos.`);
        const sql = "SELECT * FROM Trabajadores WHERE usuario = ?";

        db.query(sql, [username], (err, data) => {
            if (err) {
                console.error("PISTA 3: ERROR de base de datos.", err);
                return res.status(500).json({ Error: "Error en la consulta de la base de datos." });
            }

            if (data.length === 0) {
                console.log("PISTA 4: Usuario no encontrado en la base de datos.");
                return res.json({ Error: "Usuario no registrado" });
            }

            console.log("PISTA 5: Usuario encontrado. Procediendo a comparar contraseñas.");
            const user = data[0];

            bcrypt.compare(password.toString(), user.contrasena, (bcryptErr, response) => {
                if (bcryptErr) {
                    console.error("PISTA 6: ERROR en la función bcrypt.compare.", bcryptErr);
                    return res.status(500).json({ Error: "Error en el servidor al verificar contraseña." });
                }

                if (response) {
                    console.log("PISTA 7: Contraseña CORRECTA. Login exitoso.");
                    const name = user.usuario;
                    const token = jwt.sign({ name }, "jwt-secret-key", { expiresIn: '1d' });
                    res.cookie('token', token);
                    return res.json({ Status: "Exito" });
                } else {
                    console.log("PISTA 8: Contraseña INCORRECTA.");
                    return res.json({ Error: "Contraseña incorrecta" });
                }
            });
        });
    } catch (e) {
        console.error("PISTA 9: ¡ERROR CATASTRÓFICO ATRAPADO!", e);
        res.status(500).json({ Error: "Un error inesperado ocurrió en el servidor." });
    }
});

app.post('/insertarProducto',(req, res) => {
    const sql = "INSERT INTO productos(codigo,nombre,precio,cantidad,cantidad_minima) VALUES(?,?,?,?,?)";
    const sql_select_codigo = "SELECT * from productos where codigo=?";
    const sql_select_nombre = "SELECT * from productos where nombre=?";

    const num_values = [Number(req.body.codigo), Number(req.body.cantidad), Number(req.body.cantidad_minima), Number(req.body.precio)];
    const values = [req.body.codigo,req.body.nombre.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()),req.body.precio,req.body.cantidad, req.body.cantidad_minima];
    db.query(sql_select_codigo, [req.body.codigo], (err,data) => {
        console.log(data.sql);
        if(data.length>0){
            return res.json({Error: "El CÓDIGO del producto YA está REGISTRADO"})
        }else{
            db.query(sql_select_nombre, [req.body.nombre], (err, data) => {
                if(data.length>0){
                    console.log(data.sql);
                    return res.json({Error: "El NOMBRE del producto YA está REGISTRADO"});
                }else{
                    if(Number.isInteger(num_values[0]) && Number.isInteger(num_values[1]) && Number.isInteger(num_values[2])){
                        db.query(sql, values, (err,data) => {
                            if(err) return res.json({Error: "Ha habido un error al insertar el producto"});
                            return res.json({Status: "Exito"});
                        })
                    }else{
                        return res.json({Error: "Por favor, ingrese cantidades ENTERAS"});
                    }
                }
            })
        }
    })
})

app.post('/modificarProducto',(req, res) => {
    const sql =" UPDATE productos set nombre=?, precio = ? , cantidad = ? , cantidad_minima = ? WHERE codigo = ?";
    const sql_select_codigo = "SELECT * from productos where codigo=?";
    const sql_select_nombre = "SELECT * from productos where nombre=?";
    const num_values = [Number(req.body.codigo), Number(req.body.cantidad), Number(req.body.cantidad_minima), Number(req.body.precio)];
    const values = [req.body.nombre.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()),req.body.precio,req.body.cantidad, req.body.cantidad_minima, req.body.codigo];
    db.query(sql_select_codigo, [req.body.codigo], (err,data) => {
        console.log(data.sql);
        if(data.length>1){
            return res.json({Error: "El CÓDIGO del producto YA está REGISTRADO"})
        }else{
            const nombre_original = data[0].nombre;
            db.query(sql_select_nombre, [req.body.nombre], (err, data) => {
                if(data.length>0 && nombre_original != req.body.nombre){
                    console.log(data.sql);
                    return res.json({Error: "El NOMBRE del producto YA está REGISTRADO"});
                }else{
                    if(Number.isInteger(num_values[0]) && Number.isInteger(num_values[1]) && Number.isInteger(num_values[2])){
                        db.query(sql, values, (err,data) => {
                            if(err) return res.json({Error: "Ha habido un error al insertar el producto"});
                            return res.json({Status: "Exito"});
                        })
                    }else{
                        return res.json({Error: "Por favor, ingrese cantidades ENTERAS"});
                    }
                }
            })
        }
    })
})


const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if(!token){
        return res.json({Error: "No estás autenticado"});
    }else{
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if(err) return res.json({Error: "Token inválido"});
            req.name = decoded.name;
            const sql_select = "SELECT * from Trabajadores where usuario=?";
            db.query(sql_select, [req.name], (err, data) => {
                if(err) return res.json({Error: "Error al buscar el usuario"});
                if(data.length>0){
                    req.rol = data[0].rol;
                    next();
                }else{
                    return res.json({Error: "Usuario no registrado"});
                }
            })
        })
    }
}

app.get('/', verifyUser, (req, res) => {
    return res.json({Status: "Exito", name: req.name, rol: req.rol});
})


app.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({Status: "Exito"});
})

app.get('/data', (req, res) => {
    db.query('SELECT * FROM productos', (error, results, fields) => {
      if (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(results);
    });
  });

  app.get('/dataPventa', (req, res) => {
    db.query('SELECT * FROM productos WHERE cantidad > 0', (error, results, fields) => {
      if (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(results);
    });
  });

  app.get('/dataFaltantes', (req, res) => {
    const sql = 'SELECT * FROM productos WHERE cantidad < cantidad_minima';
    db.query(sql, (error, results, fields) => {
      if (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(results);
    });
  });

  app.get('/data_usuarios', (req, res) => {
    db.query('SELECT usuario, nombre, apellido_paterno, apellido_materno, rol, texto_plano, contrasena FROM Trabajadores,contrasenas WHERE encriptada=contrasena', (error, results, fields) => {
      if (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(results);
    });
  });

app.get('/GetProducto/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    const sql = 'SELECT * FROM productos WHERE codigo = ?';

    db.query(sql, [codigo], (err, result) => {
        if (err) {
            return res.status(500).json({ Error: "Error al buscar el producto" });
        }
        if (result.length > 0) {
            return res.status(200).json({ Status: "Exito", Producto: result[0] });
        } else {
            res.status(404).json({ error: 'No se encontró el producto' });
        }
    });
});

  app.delete('/deleteProducto/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    const sql = 'DELETE FROM productos WHERE codigo = ?';

    db.query(sql, [codigo], (err, result) => {
        if (err) {
            return res.status(500).json({ Error: "Error al eliminar el producto" });
        }
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Se eliminó el producto éxitosamente' });
        } else {
            res.status(404).json({ error: 'No se encontró el producto' });
        }
    });
});

app.delete('/deleteUsuario/:usuario', (req, res) => {
    const usuario = req.params.usuario;
    const sql = 'DELETE FROM Trabajadores WHERE usuario = ?';

    db.query(sql, [usuario], (err, result) => {
        if (err) {
            return res.status(500).json({ Error: "Error al eliminar el usuario" });
        }
        if (result.affectedRows > 0) {
            res.json({ message: 'Se eliminó el usuario éxitosamente' });
        } else {
            res.status(404).json({ error: 'No se encontró el usuario' });
        }
    });
});

app.get('/GetUser', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ Error: "No token provided" });
    }

    try {
        const tokenDecoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const username = tokenDecoded.name;

        if (!username) {
          return res.status(400).json({ Error: "Username not found in token" });
        }

        const sql = 'SELECT usuario, nombre, apellido_paterno, rol FROM Trabajadores WHERE usuario = ?';

        db.query(sql, [username], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ Error: "Error fetching user data" });
            }

            if (results.length === 0) {
                return res.status(404).json({ Error: "User not found" });
            }

            const user = results[0];
            const fullName = user.nombre.split(" ");
            const firstName = fullName[0];
            const lastName = user.apellido_paterno;
            const name = firstName + " " + lastName;
            const rol = user.rol;
            const username = user.usuario;
            return res.json({ name,rol, username});
        });

    } catch (error) {
        console.error("Token decoding error:", error);
        return res.status(400).json({ Error: "Invalid token format" });
    }
})

app.get('/GetUserData/:user', (req, res) => {
    const usuario_completo = req.params.user;
    const sql = 'SELECT * from Trabajadores, contrasenas WHERE contrasena=encriptada AND usuario = ?';

    db.query(sql, [usuario_completo], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ Error: "Error fetching user data" });
        }

        if (results.length === 0) {
            return res.status(404).json({ Error: "User not found" });
        }
        return res.status(200).json(results[0]);
    });
})



app.listen(8080, () => {
    console.log('Conectado al backend!');
})

app.get('/generar-pdf', (req, res) => {
    const fonts = {
        Roboto: {
            normal: 'fonts/JosefinSans-Regular.ttf',
            bold: 'fonts/JosefinSans-Medium.ttf',
            italics: 'fonts/JosefinSans-Italic.ttf',
            bolditalics: 'fonts/JosefinSans-MediumItalic.ttf'
        }
    };
    const body = [['Producto', 'Cantidad', 'Código', 'Precio', 'Cantidad Mínima']];
    db.query('SELECT * FROM productos WHERE cantidad < cantidad_minima ', (error, results, fields) => {
        if (error) {
          console.error('Database query error:', error);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        results.forEach(row => {
            body.push([
                row.nombre,
                row.cantidad.toString(),
                row.codigo,
                `$${row.precio}`,
                row.cantidad_minima.toString()
            ]);
        });
        var dd = {
            content: [
                {
                    image: './img/faltantes_header.png',
                    width: 530,
                    margin: [0, 0, 0, 20] //
                },
                {text: 'Lista de Faltantes', style: 'header', alignment: 'center', margin: [0, 0, 0, 40]},
                {
                    style: 'tableExample',
                    table: {
                        widths: [95, 95, 95, 95,95],
                        body
                    }
                }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true
                },
                subheader: {
                    fontSize: 14,
                    bold: true
                },
                tableExample: {
                    margin: [0, 5, 0, 15]
                }
            }
        };
        var printer = new PdfPrinter(fonts);
        var pdfDoc = printer.createPdfKitDocument(dd);
        pdfDoc.pipe(fs.createWriteStream('lista_de_faltantes.pdf')).on('finish', () => {
            res.download('lista_de_faltantes.pdf', 'lista_de_faltantes.pdf', (err) => {
                if (err) {
                    console.error('Error downloading the file:', err);
                }
            });
        });
        pdfDoc.end();
        console.log('PDF generated and ready for download');
      });
})

app.delete('/deleteUser/:usuario', (req, res) => {
    const codigo = req.params.usuario;
    const sql = 'DELETE FROM Trabajadores WHERE usuario = ?';

    db.query(sql, [codigo], (err, result) => {
        if (err) {
            return res.status(500).json({ Error: "Error al eliminar el usuario" });
        }
        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Se eliminó el usuario éxitosamente' });
        } else {
            res.status(404).json({ error: 'No se encontró el usuario' });
        }
    });
});

app.post('/realizarCobro', async (req, res) => {
    try {
        const [ventaResult] = await db.promise().query("SELECT MAX(num_venta) FROM ventas;");
        let num_venta = ventaResult[0]["MAX(num_venta)"] ? parseInt(ventaResult[0]["MAX(num_venta)"]) + 1 : 1;

        const [fechaResult] = await db.promise().query("SELECT CURDATE()");
        const fecha_query = fechaResult[0]['CURDATE()'];
        const fecha_obj = new Date(fecha_query);
        const fechaISO = fecha_obj.toISOString().slice(0, 10);

        let faltantes = [];
        let error = "";

        await Promise.all(req.body.data.map(async (producto) => {
            const [productResult] = await db.promise().query("SELECT * FROM productos WHERE codigo = ?", [producto.codigo]);
            if (productResult.length > 0) {
                const cantidad_actual = productResult[0].cantidad;
                const cantidad_minima = productResult[0].cantidad_minima;
                if (cantidad_actual - producto.cantidad >= 0) {
                    const sql_insert = "INSERT INTO ventas(num_venta, producto, cantidad, total, fecha, usuario) VALUES(?,?,?,?,?,?)";
                    const valores = [num_venta, producto.codigo, producto.cantidad, req.body.costo, fechaISO, req.body.username];
                    await db.promise().query(sql_insert, valores);

                    const sql_update = "UPDATE productos SET cantidad = cantidad - ? WHERE codigo = ?";
                    await db.promise().query(sql_update, [producto.cantidad, producto.codigo]);

                    if (cantidad_actual - producto.cantidad < cantidad_minima) {
                        faltantes.push({
                            codigo: producto.codigo,
                            nombre: producto.nombre,
                            cantidad: cantidad_actual - producto.cantidad,
                        });
                    }
                }else{
                    error = `Producto ${producto.nombre} sin existencias`;
                }
            }else{
                return res.status(404).json({ Error: `Producto con código ${producto.codigo} no encontrado` });
            }
        }));
        if (error) {
            return res.json({ Error: error });
        }else{
            console.log(faltantes)
            return res.status(200).json({
                Status: "Exito",
                message: "Venta realizada con éxito",
                Faltantes: faltantes
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ Error: "Ocurrió un error en el proceso de venta" });
    }
});


app.get('/dataPventa', (req, res) => {
    db.query('SELECT * FROM productos WHERE cantidad>0', (error, results, fields) => {
      if (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(results);
    });
  });

  app.get('/dataPventa', (req, res) => {
    db.query('SELECT * FROM productos WHERE cantidad>0', (error, results, fields) => {
      if (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.json(results);
    });
  });


  app.post('/imprimir-ticket', (req, res) => {
    const fonts = {
        Roboto: {
            normal: path.join(__dirname, 'fonts', 'JosefinSans-Regular.ttf'),
            bold: path.join(__dirname, 'fonts', 'JosefinSans-Medium.ttf'),
            italics: path.join(__dirname, 'fonts', 'JosefinSans-Italic.ttf'),
            bolditalics: path.join(__dirname, 'fonts', 'JosefinSans-MediumItalic.ttf')
        }
    };

    const body = [['Producto', 'Cantidad', 'Precio', 'Subtotal']];
    req.body.data.forEach(row => {
        body.push([
            row.nombre,
            row.cantidad.toString(),
            `$${row.precio}`,
            `$${row.precio * row.cantidad}`,
        ]);
    });

    const dd = {
        content: [
            {
                image: path.join(__dirname, 'img', 'faltantes_header.png'),
                width: 530,
                margin: [0, 0, 0, 20]
            },
            { text: 'Ticket de venta', style: 'header', alignment: 'center', margin: [0, 0, 0, 40] },
            {
                style: 'tableExample',
                table: {
                    widths: ['*', '*', '*', '*'],
                    body
                }
            },
            { text: `Total: $${req.body.costo}`, style: 'header', alignment: 'center', margin: [0, 0, 0, 40] },
            { text: `Pagó: $${req.body.pago}`,style: 'header', alignment: 'center', margin: [0, 0, 0, 40] },
            { text: `Cambio: $${req.body.pago-req.body.costo}`, style: 'header', alignment: 'center', margin: [0, 0, 0, 40] },
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true
            },
            tableExample: {
                margin: [0, 5, 0, 15]
            }
        }
    };

    const printer = new PdfPrinter(fonts);
    const pdfDoc = printer.createPdfKitDocument(dd);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=ticket.pdf');

    pdfDoc.pipe(res);
    pdfDoc.end();
});