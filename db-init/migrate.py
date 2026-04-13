import re
import os

user_mapping = {
    'andrade': '1', 'arboilito': '2', 'chosina': '3', 'crepusculobra': '4',
    'danone': '5', 'jcamaney': '6', 'koreanite': '7', 'miniona': '8',
    'nemo12': '9', 'ponchalo': '10', 'rnata': '11'
}

hash_to_plain = {
    '$2b$10$n2TX9TtudzDP8lniHpFhXeoa/.nesXPtLwrjr5Zt30AAYNlyUo7KW': '1',
    '$2b$10$nBAFdUOMEK5litSyVEg/UOvcBFdCcxTxp9ctbNQ5eRazTeNDrdwGi': '1234',
    '$2b$10$JHWyY0UiBIN23YE7Vn8wkOqheV.iSCpvvX38HvYwSsZ7AFnyQun/S': '123',
    '$2b$10$vH/3cNMiAl5fpK8zjFfvPO6V1naNqO33TQ4.yJz5m.q7ZfSq5MgKC': '123',
    '$2b$10$cpRu/Lx561rVy6EQft2i7OW8bnPZLIG2xPYyPc6piFPBxK9gh07Py': '1234',
    '$2b$10$e3ltDmY4jX0UWGU.rr/HF.NCkZwqcVr1QjOAIpzpNC93iJ4/8ZzUS': '',
    '$2b$10$lyEQpSRipZBmN3OBNEPWa.e9h8ToyLRF4gSXq3qVWYyZ7a5JMiBBy': 'miamors',
    '$2b$10$PX9g.GBUo6RoOb/EwuLnOO6kvtPt8yMhsO.AgR66V8xNe1EjgMOPC': '1234',
    '$2b$10$sFcQ4YGOaIGWio9XRYWD4eqdZ/h4b9CkIpawcsHzp0xun6EXWyOoa': 'renata',
    '$2b$10$bE.ceZevG5jcHv09fXXPxOSGkT6lN7Cq1f7yY0QXnil6pwSDIEmHm': '123',
    '$2b$10$EG5FCjIwX6eqgMlsQ.Tzie47IaPTyIqA8coX4cOqp2yxO0H6qfmxe': 'llanas'
}

def process_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove contrasenas
    pattern_contrasenas = re.compile(r'DROP TABLE IF EXISTS `contrasenas`;.*?UNLOCK TABLES;\s*', re.DOTALL)
    content = pattern_contrasenas.sub('', content)

    # 2. Modify Trabajadores schema
    old_schema = re.compile(r'CREATE TABLE `Trabajadores` \([^)]*PRIMARY KEY \(`usuario`\)\s*\) ENGINE=InnoDB.*?;', re.DOTALL)
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

    # 3. Process Trabajadores Inserts
    def replacer_trabajadores(m):
        raw_vals = m.group(1)
        # Split by format ),( or ), (
        parts = re.split(r'\),\s*\(', raw_vals.strip('()'))
        new_parts = []
        for p in parts:
            p = p.strip("()")
            # Elements e.g. 'andrade','$2b$10$xxx','Operario','Andrade','Chehue','Hernández'
            elems = re.findall(r"'[^']*'", p)
            if len(elems) == 6:
                user = elems[0].strip("'")
                hash_val = elems[1].strip("'")
                uid = user_mapping.get(user, '99')
                plain = hash_to_plain.get(hash_val, '')
                new_p = f"{uid},{elems[0]},{elems[1]},'{plain}',{elems[2]},{elems[3]},{elems[4]},{elems[5]}"
                new_parts.append(f"({new_p})")
            else:
                new_parts.append(f"({p})")
        return "INSERT INTO `Trabajadores` VALUES " + ",".join(new_parts) + ";"

    content = re.sub(r'INSERT INTO `Trabajadores` VALUES (.*?);', replacer_trabajadores, content)

    # 4. Modify Ventas table logic
    content = re.sub(r'`usuario` varchar\(20\) DEFAULT NULL,', r'`trabajador_id` int DEFAULT NULL,', content)
    content = re.sub(r'KEY `usuario` \(`usuario`\),', r'KEY `trabajador_id` (`trabajador_id`),', content)
    content = re.sub(r'CONSTRAINT `ventas_ibfk_2` FOREIGN KEY \(`usuario`\) REFERENCES `trabajadores` \(`usuario`\)', 
                     r'CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`trabajador_id`) REFERENCES `Trabajadores` (`id`)', content, flags=re.IGNORECASE)

    # 5. Process Ventas Inserts
    def replacer_ventas(m):
        raw_vals = m.group(1)
        parts = re.split(r'\),\s*\(', raw_vals.strip('()'))
        new_parts = []
        for p in parts:
            p = p.strip("()")
            # split by comma, ignoring commas inside quotes
            # But the last value is always the user string e.g. 'danone'
            elems = p.split(',')
            user = elems[-1].strip("'")
            if user in user_mapping:
                elems[-1] = user_mapping[user]
            new_parts.append("(" + ",".join(elems) + ")")
        return "INSERT INTO `ventas` VALUES " + ",".join(new_parts) + ";"

    content = re.sub(r'INSERT INTO `ventas` VALUES (.*?);', replacer_ventas, content)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

dir_path = '/Users/braulio/Desktop/IDC_ComercialCabello/db-init'
process_file(os.path.join(dir_path, 'init.sql'))
process_file(os.path.join(dir_path, 'dump.sql'))
print('Migration Python OK')
