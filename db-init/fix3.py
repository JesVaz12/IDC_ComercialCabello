import os

def replace_schema(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # We will find the exact create table string index
    start_str = "CREATE TABLE `Trabajadores` ("
    end_str = " ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;"

    start_idx = content.find(start_str)
    if start_idx != -1:
        end_idx = content.find(end_str, start_idx)
        if end_idx != -1:
            full_end_idx = end_idx + len(end_str)
            old_table = content[start_idx:full_end_idx]
            print(f"[{filename}] Found table. Length: {len(old_table)}")
            
            new_table = """CREATE TABLE `Trabajadores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario` varchar(20) NOT NULL,
  `contrasena` varchar(128) NOT NULL,
  `texto_plano` varchar(25) DEFAULT NULL,
  `rol` varchar(15) NOT NULL,
  `Nombre` varchar(30) NOT NULL,
  `apellido_paterno` varchar(20) NOT NULL,
  `apellido_materno` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario` (`usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;"""
            
            content = content[:start_idx] + new_table + content[full_end_idx:]
            
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"[{filename}] Replaced.")
        else:
            print(f"[{filename}] End string not found!")
    else:
        print(f"[{filename}] Start string not found!")

dir_path = '/Users/braulio/Desktop/IDC_ComercialCabello/db-init'
replace_schema(os.path.join(dir_path, 'init.sql'))
replace_schema(os.path.join(dir_path, 'dump.sql'))
