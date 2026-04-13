import os
import re

def patch_server(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. /register_user
    old_register = """app.post('/register_user', (req, res) => {
    const sql = "INSERT INTO Trabajadores(`nombre`,`apellido_paterno`,`apellido_materno`,`usuario`,`contrasena`,`rol`) VALUES (?)";
    const sql_select = "SELECT * from Trabajadores where usuario=?";
    const sql_password = "INSERT INTO contrasenas(`encriptada`,`texto_plano`) VALUES (?,?)";
    const values = [req.body.usuario.toLowerCase()];
    db.query(sql_select, values, (err, data) => {
        if (err) return res.json({ Error: "Error al buscar el usuario" });
        if (data.length > 0) {
            return res.json({ Error: "El USUARIO ya está REGISTRADO" })
        }
        bcrypt.hash(req.body.contrasena, salt, (err, hash) => {
            if (err) return res.json({ Error: "Error al encriptar la contraseña" });
            const values = [req.body.nombre.toLowerCase().replace(/(^|\\s)\\S/gu, c => c.toUpperCase()),
            req.body.apellido_paterno.toLowerCase().replace(/(^|\\s)\\S/gu, c => c.toUpperCase()),
            req.body.apellido_materno.toLowerCase().replace(/(^|\\s)\\S/gu, c => c.toUpperCase()),
            req.body.usuario.toLowerCase(), hash, req.body.rol];
            db.query(sql, [values], (err, result) => {
                if (err) return res.json({ Error: "Error al registrar el usuario" });
                db.query(sql_password, [hash, req.body.contrasena], (err, result) => {
                    if (err) return res.json({ Error: "Error al registrar la contraseña" });
                    if (result.affectedRows > 0) {
                        return res.status(200).json({ message: 'Usuario registrado exitosamente' });
                    } else {
                        console.log(err);
                    }
                })
            })
        })
    })
})"""

    new_register = """app.post('/register_user', (req, res) => {
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
            const values = [req.body.nombre.toLowerCase().replace(/(^|\\s)\\S/gu, c => c.toUpperCase()),
            req.body.apellido_paterno.toLowerCase().replace(/(^|\\s)\\S/gu, c => c.toUpperCase()),
            req.body.apellido_materno.toLowerCase().replace(/(^|\\s)\\S/gu, c => c.toUpperCase()),
            req.body.usuario.toLowerCase(), hash, req.body.contrasena, req.body.rol];
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
})"""
    content = content.replace(old_register, new_register)

    # 2. /update_user
    old_update = """app.post('/update_user', (req, res) => {
    const sql = "UPDATE Trabajadores SET nombre=?, apellido_paterno=?, apellido_materno=?, contrasena=?, rol=? WHERE usuario=?";
    const password_replace = "UPDATE  contrasenas SET encriptada=?, texto_plano=? WHERE encriptada=(SELECT contrasena from Trabajadores WHERE usuario=?)";
    bcrypt.hash(req.body.contrasena, salt, (err, hash) => {
        if (err) return res.json({ Error: "Error al encriptar la contraseña" });
        const values = [req.body.nombre.toLowerCase().replace(/(^|\\s)\\S/gu, c => c.toUpperCase()),
        req.body.apellido_paterno.toLowerCase().replace(/(^|\\s)\\S/gu, c => c.toUpperCase()),
        req.body.apellido_materno.toLowerCase().replace(/(^|\\s)\\S/gu, c => c.toUpperCase()),
            hash, req.body.rol, req.body.usuario];
        db.query(password_replace, [hash, req.body.contrasena, req.body.usuario], (err, result) => {
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
});"""

    new_update = """app.post('/update_user', (req, res) => {
    const sql = "UPDATE Trabajadores SET nombre=?, apellido_paterno=?, apellido_materno=?, contrasena=?, texto_plano=?, rol=? WHERE usuario=?";
    bcrypt.hash(req.body.contrasena, salt, (err, hash) => {
        if (err) return res.json({ Error: "Error al encriptar la contraseña" });
        const values = [req.body.nombre.toLowerCase().replace(/(^|\\s)\\S/gu, c => c.toUpperCase()),
        req.body.apellido_paterno.toLowerCase().replace(/(^|\\s)\\S/gu, c => c.toUpperCase()),
        req.body.apellido_materno.toLowerCase().replace(/(^|\\s)\\S/gu, c => c.toUpperCase()),
            hash, req.body.contrasena, req.body.rol, req.body.usuario];
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
});"""
    content = content.replace(old_update, new_update)

    # 3. login jwt
    old_jwt = 'const token = jwt.sign({ name }, "jwt-secret-key", { expiresIn: \'1d\' });'
    new_jwt = """const id = user.id;
                    const rl = user.rol;
                    const token = jwt.sign({ id, name, rol: rl }, "jwt-secret-key", { expiresIn: '1d' });"""
    content = content.replace(old_jwt, new_jwt)

    # 4. middleware
    old_mid = """        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if (err) return res.json({ Error: "Token inválido" });
            req.name = decoded.name;
            const sql_select = "SELECT * from Trabajadores where usuario=?";
            db.query(sql_select, [req.name], (err, data) => {
                if (err) return res.json({ Error: "Error al buscar el usuario" });
                if (data.length > 0) {
                    req.rol = data[0].rol;
                    next();
                } else {
                    return res.json({ Error: "Usuario no registrado" });
                }
            })
        })"""
    new_mid = """        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if (err) return res.json({ Error: "Token inválido" });
            req.name = decoded.name;
            req.id = decoded.id;
            req.rol = decoded.rol;
            next();
        })"""
    content = content.replace(old_mid, new_mid)

    # 5. data usuarios
    old_data_users = 'SELECT usuario, nombre, apellido_paterno, apellido_materno, rol, texto_plano, contrasena FROM Trabajadores,contrasenas WHERE encriptada=contrasena'
    new_data_users = 'SELECT id, usuario, nombre, apellido_paterno, apellido_materno, rol, texto_plano, contrasena FROM Trabajadores'
    content = content.replace(old_data_users, new_data_users)

    # 6. get user data
    old_user_data = 'SELECT * from Trabajadores, contrasenas WHERE contrasena=encriptada AND usuario = ?'
    new_user_data = 'SELECT * from Trabajadores WHERE usuario = ?'
    content = content.replace(old_user_data, new_user_data)

    # 7. realizarCorbo
    # a) insert logic for check id
    content = content.replace("await conn.beginTransaction();\n\n        const [ventaResult]", """await conn.beginTransaction();\n\n        const [userResult] = await conn.query("SELECT id FROM Trabajadores WHERE usuario = ?", [req.body.username]);\n        if (userResult.length === 0) { await conn.rollback(); return res.status(400).json({ Error: "El usuario realizando la venta no existe en BD." }); }\n        const trabajador_id = userResult[0].id;\n\n        const [ventaResult]""")
    
    # b) insert query
    content = content.replace("INSERT INTO ventas(num_venta, producto, cantidad, total, fecha, usuario) VALUES ?", "INSERT INTO ventas(num_venta, producto, cantidad, total, fecha, trabajador_id) VALUES ?")
    
    # c) ventasUpdates array replacement
    content = content.replace("                req.body.username\n            ]);", "                trabajador_id\n            ]);")

    # 8. insertarProducto issue
    old_insert_prod = """app.post('/insertarProducto', (req, res) => {
    const sql = "INSERT INTO productos(codigo,nombre,precio,cantidad,cantidad_minima) VALUES(?,?,?,?,?)";"""
    new_insert_prod = """app.post('/insertarProducto', (req, res) => {
    if (!req.body.codigo || req.body.codigo.trim() === '') return res.json({ Error: "Rechazado: El código de producto no puede estar vacío" });
    const sql = "INSERT INTO productos(codigo,nombre,precio,cantidad,cantidad_minima) VALUES(?,?,?,?,?)";"""
    content = content.replace(old_insert_prod, new_insert_prod)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

patch_server('/Users/braulio/Desktop/IDC_ComercialCabello/backend/server.js')
print("Server patched!")
