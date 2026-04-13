import re
import os

def fix_schema(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # The issue was that the schema did not get replaced.
    old_schema = re.compile(r'CREATE TABLE `Trabajadores` \([\s\S]*?PRIMARY KEY \(`usuario`\)\s*\) ENGINE=InnoDB.*?;', re.DOTALL)
    
    new_schema = """CREATE TABLE `Trabajadores` (
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
    
    content = old_schema.sub(new_schema, content)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

dir_path = '/Users/braulio/Desktop/IDC_ComercialCabello/db-init'
fix_schema(os.path.join(dir_path, 'init.sql'))
fix_schema(os.path.join(dir_path, 'dump.sql'))
print('Schema fix applied.')
