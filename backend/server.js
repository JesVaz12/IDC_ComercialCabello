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

// --- CONFIGURACIÓN CORS ---
const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ["http://localhost:8082", "http://localhost:5173", "http://localhost:5174"];

app.use(cors({
    origin: corsOrigins,
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cookieParser());

// --- CONEXIÓN DB ---
const db = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database pool: ' + err.stack);
        return;
    }
    console.log('Connected to the database pool as ID ' + connection.threadId);
    connection.release();
});

// --- RUTAS DE USUARIOS ---

app.post('/register_user', (req, res) => {
    const sql = "INSERT INTO Trabajadores(`nombre`,`apellido_paterno`,`apellido_materno`,`usuario`,`contrasena`,`texto_plano`,`rol`) VALUES (?)";
    const sql_select = "SELECT * from Trabajadores where usuario=?";
    const values = [req.body.usuario.toLowerCase()];
    db.query(sql_select, values, (err, data) => {
        if (err) return res.json({ Error: "Error al buscar el usuario" });
        if (data.length > 0) {
            return res.json({ Error: "El USUARIO ya está REGISTRADO" })
        }
        bcrypt.hash(req.body.contrasena, salt, (err, hash) => {
            if (err) return res.json({ Error: "Error al encriptar la contraseña" });
            const values = [req.body.nombre.toLowerCase().replace(/(^|\s)\S/gu, c => c.toUpperCase()),
            req.body.apellido_paterno.toLowerCase().replace(/(^|\s)\S/gu, c => c.toUpperCase()),
            req.body.apellido_materno.toLowerCase().replace(/(^|\s)\S/gu, c => c.toUpperCase()),
            req.body.usuario.toLowerCase(), hash, '', req.body.rol];
            db.query(sql, [values], (err, result) => {
                if (err) return res.json({ Error: "Error al registrar el usuario" });
                if (result.affectedRows > 0) {
                    return res.status(200).json({ message: 'Usuario registrado exitosamente' });
                } else {
                    console.log(err);
                }
            })
        })
    })
})

app.post('/update_user', (req, res) => {
    const sql = "UPDATE Trabajadores SET nombre=?, apellido_paterno=?, apellido_materno=?, contrasena=?, texto_plano=?, rol=? WHERE usuario=?";
    bcrypt.hash(req.body.contrasena, salt, (err, hash) => {
        if (err) return res.json({ Error: "Error al encriptar la contraseña" });
        const values = [req.body.nombre.toLowerCase().replace(/(^|\s)\S/gu, c => c.toUpperCase()),
        req.body.apellido_paterno.toLowerCase().replace(/(^|\s)\S/gu, c => c.toUpperCase()),
        req.body.apellido_materno.toLowerCase().replace(/(^|\s)\S/gu, c => c.toUpperCase()),
            hash, '', req.body.rol, req.body.usuario];
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ Error: "Error updating user data" });
            }
            if (result.affectedRows > 0) {
                return res.status(200).json({ message: 'User updated successfully' });
            } else {
                console.log("No user updated");
            }
        });
    })
});

app.post('/login', (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        if (!username || !password) {
            return res.status(400).json({ Error: "Falta usuario o contraseña." });
        }

        const sql = "SELECT * FROM Trabajadores WHERE usuario = ?";

        db.query(sql, [username], (err, data) => {
            if (err) {
                return res.status(500).json({ Error: "Error en la consulta de la base de datos." });
            }

            if (data.length === 0) {
                return res.json({ Error: "Usuario no registrado" });
            }

            const user = data[0];

            bcrypt.compare(password.toString(), user.contrasena, (bcryptErr, response) => {
                if (bcryptErr) {
                    return res.status(500).json({ Error: "Error en el servidor al verificar contraseña." });
                }

                if (response) {
                    const name = user.usuario;
                    const rol = user.rol; // 🚀 Guardamos el rol en el token
                    const token = jwt.sign({ name, rol }, process.env.JWT_SECRET, { expiresIn: '1d' });
                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                        maxAge: 24 * 60 * 60 * 1000,
                    });
                    return res.json({ Status: "Exito" });
                } else {
                    return res.json({ Error: "Contraseña incorrecta" });
                }
            });
        });
    } catch (e) {
        console.error("Error catastrófico:", e);
        res.status(500).json({ Error: "Un error inesperado ocurrió en el servidor." });
    }
});

// --- RUTAS DE PRODUCTOS ---

app.post('/insertarProducto', (req, res) => {
    if (!req.body.codigo || req.body.codigo.trim() === '') return res.json({ Error: "Rechazado: El código de producto no puede estar vacío" });
    const sql = "INSERT INTO productos(codigo,nombre,precio,cantidad,cantidad_minima) VALUES(?,?,?,?,?)";
    const sql_select_codigo = "SELECT * from productos where codigo=?";
    const sql_select_nombre = "SELECT * from productos where nombre=?";

    const num_values = [Number(req.body.cantidad), Number(req.body.cantidad_minima)];

    const values = [req.body.codigo, req.body.nombre.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()), req.body.precio, req.body.cantidad, req.body.cantidad_minima];

    db.query(sql_select_codigo, [req.body.codigo], (err, data) => {
        if (data.length > 0) {
            return res.json({ Error: "El CÓDIGO del producto YA está REGISTRADO" })
        } else {
            db.query(sql_select_nombre, [req.body.nombre], (err, data) => {
                if (data.length > 0) {
                    return res.json({ Error: "El NOMBRE del producto YA está REGISTRADO" });
                } else {
                    if (Number.isInteger(num_values[0]) && Number.isInteger(num_values[1])) {
                        db.query(sql, values, (err, data) => {
                            if (err) return res.json({ Error: "Ha habido un error al insertar el producto" });
                            return res.json({ Status: "Exito" });
                        })
                    } else {
                        return res.json({ Error: "Por favor, ingrese cantidades ENTERAS (Cantidad y Mínima)" });
                    }
                }
            })
        }
    })
})

app.post('/modificarProducto', (req, res) => {
    const sql = " UPDATE productos set nombre=?, precio = ? , cantidad = ? , cantidad_minima = ? WHERE codigo = ?";
    const sql_select_codigo = "SELECT * from productos where codigo=?";
    const sql_select_nombre = "SELECT * from productos where nombre=?";
    const num_values = [Number(req.body.cantidad), Number(req.body.cantidad_minima)];
    const values = [req.body.nombre.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()), req.body.precio, req.body.cantidad, req.body.cantidad_minima, req.body.codigo];
    db.query(sql_select_codigo, [req.body.codigo], (err, data) => {
        if (data.length > 1) {
            return res.json({ Error: "El CÓDIGO del producto YA está REGISTRADO" })
        } else {
            const nombre_original = data[0].nombre;
            db.query(sql_select_nombre, [req.body.nombre], (err, data) => {
                if (data.length > 0 && nombre_original != req.body.nombre) {
                    return res.json({ Error: "El NOMBRE del producto YA está REGISTRADO" });
                } else {
                    if (Number.isInteger(num_values[0]) && Number.isInteger(num_values[1])) {
                        db.query(sql, values, (err, data) => {
                            if (err) return res.json({ Error: "Ha habido un error al insertar el producto" });
                            return res.json({ Status: "Exito" });
                        })
                    } else {
                        return res.json({ Error: "Por favor, ingrese cantidades ENTERAS" });
                    }
                }
            })
        }
    })
})

// --- MIDDLEWARE ---

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({ Error: "No estás autenticado" });
    } else {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.json({ Error: "Token inválido" });
            req.name = decoded.name;
            req.rol = decoded.rol; // 🚀 Extraemos el rol desde el payload sin tocar la DB
            next();
        })
    }
}

app.get('/', verifyUser, (req, res) => {
    return res.json({ Status: "Exito", name: req.name, rol: req.rol });
})

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ Status: "Exito" });
})

// ✅ CORRECCIÓN APLICADA: Filtramos los productos que tengan 0 en cantidad Y 0 en cantidad_minima (los eliminados lógicamente)
app.get('/data', (req, res) => {
    // Solo traemos los que tienen inventario o tienen un mínimo configurado.
    const sql = 'SELECT * FROM productos WHERE cantidad > 0 OR cantidad_minima > 0';
    db.query(sql, (error, results, fields) => {
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
    db.query('SELECT id, usuario, nombre, apellido_paterno, apellido_materno, rol FROM Trabajadores', (error, results, fields) => {
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

// ✅ CORRECCIÓN APLICADA: Borrado lógico para evitar conflictos de llaves foráneas y retornar Status "Exito"
app.delete('/deleteProducto/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    const sql = 'UPDATE productos SET cantidad = 0, cantidad_minima = 0 WHERE codigo = ?';

    db.query(sql, [codigo], (err, result) => {
        if (err) {
            console.error("Error en DB al intentar eliminar producto:", err);
            return res.status(500).json({ Error: "Error interno al procesar la eliminación del producto" });
        }
        if (result.affectedRows > 0) {
            res.status(200).json({ Status: "Exito", message: 'Se eliminó el inventario del producto exitosamente' });
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
            console.error("Error en DB al intentar eliminar user:", err);
            return res.status(500).json({ Error: "Error al eliminar el usuario" });
        }
        if (result.affectedRows > 0) {
            res.status(200).json({ Status: "Exito", message: 'Se eliminó el usuario éxitosamente' });
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
            return res.json({ name, rol, username });
        });

    } catch (error) {
        console.error("Token decoding error:", error);
        return res.status(400).json({ Error: "Invalid token format" });
    }
})

app.get('/GetUserData/:user', (req, res) => {
    const usuario_completo = req.params.user;
    const sql = 'SELECT * from Trabajadores WHERE usuario = ?';

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
    db.query('SELECT * FROM productos WHERE cantidad < cantidad_minima AND cantidad_minima > 0', (error, results, fields) => {
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
                    margin: [0, 0, 0, 20]
                },
                { text: 'Lista de Faltantes', style: 'header', alignment: 'center', margin: [0, 0, 0, 40] },
                {
                    style: 'tableExample',
                    table: {
                        widths: [95, 95, 95, 95, 95],
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
        
        // 🚀 Enviamos el stream directo a la red (memoria RAM) sin bloqueo I/O de disco
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=lista_de_faltantes.pdf');
        
        pdfDoc.pipe(res);
        pdfDoc.end();
        console.log('PDF generado en memoria y enviado al cliente');
    });
})

app.post('/realizarCobro', async (req, res) => {
    // 1. Obtener una conexión exclusiva para transacciones desde el pool
    const conn = await db.promise().getConnection();

    try {
        await conn.beginTransaction();

        const [userResult] = await conn.query("SELECT id FROM Trabajadores WHERE usuario = ?", [req.body.username]);
        if (userResult.length === 0) { await conn.rollback(); return res.status(400).json({ Error: "El usuario realizando la venta no existe en BD." }); }
        const trabajador_id = userResult[0].id;

        const [ventaResult] = await conn.query("SELECT MAX(num_venta) as max_venta FROM ventas;");
        let num_venta = ventaResult[0]["max_venta"] ? parseInt(ventaResult[0]["max_venta"]) + 1 : 1;

        const [fechaResult] = await conn.query("SELECT CURDATE() as cur_date");
        const fecha_query = fechaResult[0]['cur_date'];
        const fecha_obj = new Date(fecha_query);
        const fechaISO = fecha_obj.toISOString().slice(0, 10);

        let faltantes = [];
        let error = "";

        // Lista de códigos de productos comprados
        const codigos = req.body.data.map(p => p.codigo);
        if (codigos.length === 0) {
            await conn.rollback();
            return res.status(400).json({ Error: "El listado de productos a cobrar está vacío." });
        }

        // 2. Extraer de la Base de Datos los datos de esos productos de inmediato y retenerlos (bloqueo) durante la transacción
        const [dbProducts] = await conn.query("SELECT * FROM productos WHERE codigo IN (?) FOR UPDATE", [codigos]);
        
        let productMap = {};
        dbProducts.forEach(p => {
            productMap[p.codigo] = p;
        });

        // 3. Validar inventario de TODOS los artículos del carrito antes de aplicar cambios
        for (const producto of req.body.data) {
            const dbProd = productMap[producto.codigo];
            if (!dbProd) {
                error = `Producto con código ${producto.codigo} no encontrado en la base de datos.`;
                break; // Romper el loop de validación
            }
            if (dbProd.cantidad - producto.cantidad < 0) {
                error = `Producto "${producto.nombre}" sin existencias suficientes (Solo quedan: ${dbProd.cantidad}).`;
                break;
            }
        }

        if (error) {
            await conn.rollback();
            return res.json({ Error: error });
        }

        // 4. Todas las validaciones pasaron, aplicar los cambios a la Base de Datos
        const ventasUpdates = [];
        let queryCasosWhen = "";
        const queryParams = [];
        const codigosToUpdate = [];

        for (const producto of req.body.data) {
            const dbProd = productMap[producto.codigo];
            const nuevaCantidad = dbProd.cantidad - producto.cantidad;

            // 🚀 Preparamos la actualización para convertirla en 1 SOlo "Masivo"
            queryCasosWhen += "WHEN ? THEN ? ";
            queryParams.push(producto.codigo, nuevaCantidad);
            codigosToUpdate.push(producto.codigo);

            // Guardar para el Insert Masivo
            ventasUpdates.push([
                num_venta, 
                producto.codigo, 
                producto.cantidad, 
                req.body.costo, 
                fechaISO, 
                trabajador_id
            ]);

            // Comprobar faltantes para notificar
            if (nuevaCantidad < dbProd.cantidad_minima) {
                faltantes.push({
                    codigo: producto.codigo,
                    nombre: producto.nombre,
                    cantidad: nuevaCantidad,
                });
            }
        }

        // 🚀 Update Masivo (1 sola consulta para todo el carrito)
        if (codigosToUpdate.length > 0) {
            const sql_bulk_update = `UPDATE productos SET cantidad = CASE codigo ${queryCasosWhen} END WHERE codigo IN (?)`;
            queryParams.push(codigosToUpdate);
            await conn.query(sql_bulk_update, queryParams);
        }

        // Insert Masivo
        const sql_insert = "INSERT INTO ventas(num_venta, producto, cantidad, total, fecha, trabajador_id) VALUES ?";
        await conn.query(sql_insert, [ventasUpdates]);

        // Guardar permanente!
        await conn.commit();
        
        if (faltantes.length > 0) {
            console.log("Faltantes después del cobro:", faltantes);
        }

        return res.status(200).json({
            Status: "Exito",
            message: "Venta realizada con éxito, ticket emitido.",
            Faltantes: faltantes
        });

    } catch (err) {
        console.error("Error catastrófico procesando venta en la DB:", err);
        // Si la base de datos falla al insertar, actualizamos sin efecto (Rollback)
        await conn.rollback();
        return res.status(500).json({ Error: "Ocurrió un error interno en el proceso de venta." });
    } finally {
        conn.release(); // Libera la conexión para que otro usuario/petición la pueda usar inmediatamente.
    }
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
            { text: `Pagó: $${req.body.pago}`, style: 'header', alignment: 'center', margin: [0, 0, 0, 40] },
            { text: `Cambio: $${req.body.pago - req.body.costo}`, style: 'header', alignment: 'center', margin: [0, 0, 0, 40] },
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

// ✅ RUTA PARA GENERAR CÓDIGO (Ya estaba, se mantiene)
app.get('/api/productos/generar-codigo', (req, res) => {
    try {
        const codigo = Math.random().toString(36).substring(2, 10).toUpperCase();
        res.json({ codigo: codigo });
    } catch (error) {
        console.error("Error al generar código:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// --- HEALTH CHECK ---
app.get('/health', (req, res) => {
    db.query('SELECT 1', (err) => {
        if (err) {
            return res.status(503).json({ status: 'unhealthy', db: 'down' });
        }
        return res.status(200).json({ status: 'healthy', db: 'ok', uptime: process.uptime() });
    });
});

// --- INICIO SERVIDOR ---
app.listen(8080, () => {
    console.log('Conectado al backend!');
});