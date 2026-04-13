import os

# 1. Update server.js
server_file = '/Users/braulio/Desktop/IDC_ComercialCabello/backend/server.js'
with open(server_file, 'r', encoding='utf-8') as f:
    server_content = f.read()

# Fix /modificarProducto validations
old_mod_prod = """    const num_values = [Number(req.body.codigo), Number(req.body.cantidad), Number(req.body.cantidad_minima), Number(req.body.precio)];
    const values = [req.body.nombre.toLowerCase().replace(/\\b\\w/g, char => char.toUpperCase()), req.body.precio, req.body.cantidad, req.body.cantidad_minima, req.body.codigo];
    db.query(sql_select_codigo, [req.body.codigo], (err, data) => {
        if (data.length > 1) {
            return res.json({ Error: "El CÓDIGO del producto YA está REGISTRADO" })
        } else {
            const nombre_original = data[0].nombre;
            db.query(sql_select_nombre, [req.body.nombre], (err, data) => {
                if (data.length > 0 && nombre_original != req.body.nombre) {
                    return res.json({ Error: "El NOMBRE del producto YA está REGISTRADO" });
                } else {
                    if (Number.isInteger(num_values[0]) && Number.isInteger(num_values[1]) && Number.isInteger(num_values[2])) {
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
    })"""

new_mod_prod = """    const num_values = [Number(req.body.cantidad), Number(req.body.cantidad_minima)];
    const values = [req.body.nombre.toLowerCase().replace(/\\b\\w/g, char => char.toUpperCase()), req.body.precio, req.body.cantidad, req.body.cantidad_minima, req.body.codigo];
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
    })"""
server_content = server_content.replace(old_mod_prod, new_mod_prod)
with open(server_file, 'w', encoding='utf-8') as f:
    f.write(server_content)
print("Server.js patched for Integer check in ModificarProducto")

# 2. Update DataTableComponent.jsx
dt_file = '/Users/braulio/Desktop/IDC_ComercialCabello/client/ccabello_cliente/src/Usuarios/DataTableComponent.jsx'
with open(dt_file, 'r', encoding='utf-8') as f:
    dt_content = f.read()

old_mod_import = "import ModificacionUsuarioModal from './ModificacionUsuarioModal.jsx';"
new_mod_import = "import ModificacionUsuariosModal from './ModificacionUsuariosModal.jsx';"
dt_content = dt_content.replace(old_mod_import, new_mod_import)

old_mod_call = "{openModal && <ModificacionUsuarioModal closeModal={() => setOpenModal(false)} usuario={selectedUsuario} />}"
new_mod_call = "{openModal && <ModificacionUsuariosModal closeModal={() => setOpenModal(false)} usuario={selectedUsuario.usuario} />}"
dt_content = dt_content.replace(old_mod_call, new_mod_call)

with open(dt_file, 'w', encoding='utf-8') as f:
    f.write(dt_content)
print("DataTableComponent.jsx patched to use plural ModificacionUsuariosModal")

# 3. Fix any form submission 'not connected' by making sure cancel buttons are type="button"
mod_prod_modal = '/Users/braulio/Desktop/IDC_ComercialCabello/client/ccabello_cliente/src/Inventario/ModificacionProductosModal.jsx'
with open(mod_prod_modal, 'r', encoding='utf-8') as f:
    mod_prod_content = f.read()

mod_prod_content = mod_prod_content.replace("<button id='cancelButton' onClick={() => closeModal(false)}>Cancelar</button>", "<button type='button' id='cancelButton' onClick={() => closeModal(false)}>Cancelar</button>")
with open(mod_prod_modal, 'w', encoding='utf-8') as f:
    f.write(mod_prod_content)
print("ModificacionProductosModal.jsx cancel button type fixed")

alta_prod_modal = '/Users/braulio/Desktop/IDC_ComercialCabello/client/ccabello_cliente/src/Inventario/AltaProductosModal.jsx'
with open(alta_prod_modal, 'r', encoding='utf-8') as f:
    alta_prod_content = f.read()

alta_prod_content = alta_prod_content.replace("<button id='cancelButton' onClick={() => setOpenModal(false)}>Cancelar</button>", "<button type='button' id='cancelButton' onClick={() => setOpenModal(false)}>Cancelar</button>")
with open(alta_prod_modal, 'w', encoding='utf-8') as f:
    f.write(alta_prod_content)
print("AltaProductosModal.jsx cancel button type fixed")

eliminar_modal = '/Users/braulio/Desktop/IDC_ComercialCabello/client/ccabello_cliente/src/Inventario/EliminarModal.jsx'
with open(eliminar_modal, 'r', encoding='utf-8') as f:
    eliminar_content = f.read()

eliminar_content = eliminar_content.replace("<button id='cancelButton' onClick={() => closeModal(false)}>Cancelar</button>", "<button type='button' id='cancelButton' onClick={() => closeModal(false)}>Cancelar</button>")
with open(eliminar_modal, 'w', encoding='utf-8') as f:
    f.write(eliminar_content)
print("EliminarModal.jsx cancel button type fixed")
