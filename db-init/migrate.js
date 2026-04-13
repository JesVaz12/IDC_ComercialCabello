const fs = require('fs');
const path = require('path');

const userMapping = {
  'andrade': 1,
  'arboilito': 2,
  'chosina': 3,
  'crepusculobra': 4,
  'danone': 5,
  'jcamaney': 6,
  'koreanite': 7,
  'miniona': 8,
  'nemo12': 9,
  'ponchalo': 10,
  'rnata': 11
};

const hashToPlain = {
  '$2b$10$n2TX9TtudzDP8lniHpFhXeoa/.nesXPtLwrjr5Zt30AAYNlyUo7KW': '1',
  '$2b$10$nBAFdUOMEK5litSyVEg/UOvcBFdCcxTxp9ctbNQ5eRazTeNDrdwGi': '1234',
  '$2b$10$JHWyY0UiBIN23YE7Vn8wkOqheV.iSCpvvX38HvYwSsZ7AFnyQun/S': '123',
  '$2b$10$vH/3cNMiAl5fpK8zjFfvPO6V1naNqO33TQ4.yJz5m.q7ZfSq5MgKC': '123',
  '$2b$10$cpRu/Lx561rVy6EQft2i7OW8bnPZLIG2xPYyPc6piFPBxK9gh07Py': '1234',
  '$2b$10$e3ltDmY4jX0UWGU.rr/HF.NCkZwqcVr1QjOAIpzpNC93iJ4/8ZzUS': '1234',
  '$2b$10$lyEQpSRipZBmN3OBNEPWa.e9h8ToyLRF4gSXq3qVWYyZ7a5JMiBBy': 'miamors',
  '$2b$10$PX9g.GBUo6RoOb/EwuLnOO6kvtPt8yMhsO.AgR66V8xNe1EjgMOPC': '1234',
  '$2b$10$sFcQ4YGOaIGWio9XRYWD4eqdZ/h4b9CkIpawcsHzp0xun6EXWyOoa': 'renata',
  '$2b$10$bE.ceZevG5jcHv09fXXPxOSGkT6lN7Cq1f7yY0QXnil6pwSDIEmHm': '123',
  '$2b$10$EG5FCjIwX6eqgMlsQ.Tzie47IaPTyIqA8coX4cOqp2yxO0H6qfmxe': 'llanas'
};

function processSql(filename) {
    let content = fs.readFileSync(filename, 'utf8');

    // 1. Remove contrasenas table and inserts
    const dropContrasenas = /DROP TABLE IF EXISTS `contrasenas`;\s*.*\s*.*\s*CREATE TABLE `contrasenas` \([\s\S]*?ENGINE=InnoDB.*?;[\s\S]*?UNLOCK TABLES;/g;
    content = content.replace(dropContrasenas, '');

    // 2. Modify Trabajadores table structure
    const createTrabajadoresRegex = /CREATE TABLE `Trabajadores` \(\s*`usuario` varchar\(20\) NOT NULL,\s*`contrasena` varchar\(128\) NOT NULL,\s*`rol` varchar\(15\) NOT NULL,\s*`Nombre` varchar\(30\) NOT NULL,\s*`apellido_paterno` varchar\(20\) NOT NULL,\s*`apellido_materno` varchar\(20\) NOT NULL,\s*PRIMARY KEY \(`usuario`\)\s*\) ENGINE=InnoDB/g;
    
    const newTrabajadores = `CREATE TABLE \`Trabajadores\` (
  \`id\` int NOT NULL AUTO_INCREMENT,
  \`usuario\` varchar(20) NOT NULL,
  \`contrasena\` varchar(128) NOT NULL,
  \`texto_plano\` varchar(25) DEFAULT NULL,
  \`rol\` varchar(15) NOT NULL,
  \`Nombre\` varchar(30) NOT NULL,
  \`apellido_paterno\` varchar(20) NOT NULL,
  \`apellido_materno\` varchar(20) NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`usuario\` (\`usuario\`)
) ENGINE=InnoDB AUTO_INCREMENT=20`;
    content = content.replace(createTrabajadoresRegex, newTrabajadores);

    // 3. Process Trabajadores INSERT
    const insertTrabajadoresRegex = /INSERT INTO `Trabajadores` VALUES (.*);/g;
    content = content.replace(insertTrabajadoresRegex, (match, p1) => {
        // extract the array of values inside parentheses: (...) , (...)
        let chunks = p1.split(/,\s*\(/);
        chunks = chunks.map(chunk => chunk.startsWith('(') ? chunk : '(' + chunk);
        
        let newChunks = chunks.map(chunk => {
            // chunk is like ('andrade','$2b$10$xxx','Operario','Andrade','Chehue','Hernández')
            // we need to insert id and texto_plano.
            const parts = chunk.match(/('[^']*')/g);
            if(parts && parts.length === 6) {
                const usuario = parts[0].replace(/'/g, "");
                const hash = parts[1].replace(/'/g, "");
                const id = userMapping[usuario] || 99;
                const plain = hashToPlain[hash] || '';
                
                return `(${id},${parts[0]},${parts[1]},'${plain}',${parts[2]},${parts[3]},${parts[4]},${parts[5]})`;
            }
            return chunk;
        });

        return `INSERT INTO \`Trabajadores\` VALUES ${newChunks.join(',')};`;
    });

    // 4. Modify ventas table foreign key logic
    const createVentasRegex = /CREATE TABLE `ventas` \([\s\S]*?`usuario` varchar\(20\) DEFAULT NULL,[\s\S]*?KEY `usuario` \(`usuario`\),[\s\S]*?CONSTRAINT `ventas_ibfk_2` FOREIGN KEY \(`usuario`\) REFERENCES `trabajadores` \(`usuario`\)[\s\S]*?\) ENGINE=InnoDB/;
    
    // Instead of completely matching the big chunk, let's just replace column and constraint:
    content = content.replace(/`usuario` varchar\(20\) DEFAULT NULL,/g, '`trabajador_id` int DEFAULT NULL,');
    content = content.replace(/KEY `usuario` \(`usuario`\)/g, 'KEY `trabajador_id` (`trabajador_id`)');
    content = content.replace(/CONSTRAINT `ventas_ibfk_2` FOREIGN KEY \(`usuario`\) REFERENCES `trabajadores` \(`usuario`\)/gi, 'CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`trabajador_id`) REFERENCES `Trabajadores` (`id`)');

    // 5. Update Ventas INSERTs where users are strings 'danone', 'miniona', etc...
    const insertVentasRegex = /INSERT INTO `ventas` VALUES (.*);/g;
    content = content.replace(insertVentasRegex, (match, p1) => {
        let chunks = p1.split(/,\s*\(/);
        chunks = chunks.map(chunk => chunk.startsWith('(') ? chunk : '(' + chunk);
        
        let newChunks = chunks.map(chunk => {
            // chunk e.g. (24,1,'2839843490393',1,27,'2025-05-28','danone')
            // last part is the user string
            const parts = chunk.split(',');
            const lastPart = parts[parts.length - 1]; // e.g. 'danone')
            const userMatch = lastPart.match(/'([^']+)'\)/);
            if(userMatch) {
                const user = userMatch[1];
                if(userMapping[user]) {
                    parts[parts.length - 1] = `${userMapping[user]})`;
                }
            }
            return parts.join(',');
        });
        return `INSERT INTO \`ventas\` VALUES ${newChunks.join(',')};`;
    });

    fs.writeFileSync(filename, content);
}

const dir = '/Users/braulio/Desktop/IDC_ComercialCabello/db-init';
processSql(path.join(dir, 'init.sql'));
processSql(path.join(dir, 'dump.sql'));
console.log('Migration OK');
