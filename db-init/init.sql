-- MySQL dump 10.13  Distrib 8.0.27, for macos11 (arm64)
--
-- Host: 127.0.0.1    Database: comercial_cabello
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `contrasenas`
--

DROP TABLE IF EXISTS `contrasenas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contrasenas` (
  `encriptada` varchar(128) NOT NULL,
  `texto_plano` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`encriptada`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contrasenas`
--

LOCK TABLES `contrasenas` WRITE;
/*!40000 ALTER TABLE `contrasenas` DISABLE KEYS */;
INSERT INTO `contrasenas` VALUES ('$2b$10$.XR1bTqDiqYeAh95mks/CuwmEO7zgLP3oBfs1xnzmgze6HHxWiF0m','1'),('$2b$10$5T5FmyOyyffolUY3fZeaNOxO6tWDTf/A0jlj77IfcBklYWqlwAFlm','a'),('$2b$10$7jjDyUJh.53f67.kyzclOea/57IGLF6ftfUB6A9luoTkjDjLlMgGa','1'),('$2b$10$AFYO1RO5bm6zwPgqh7NKEeJl4HCy/4dduyONo5alUG30iD7vGqQBC','a'),('$2b$10$bE.ceZevG5jcHv09fXXPxOSGkT6lN7Cq1f7yY0QXnil6pwSDIEmHm','123'),('$2b$10$cpRu/Lx561rVy6EQft2i7OW8bnPZLIG2xPYyPc6piFPBxK9gh07Py','1234'),('$2b$10$EG5FCjIwX6eqgMlsQ.Tzie47IaPTyIqA8coX4cOqp2yxO0H6qfmxe','llanas'),('$2b$10$JHWyY0UiBIN23YE7Vn8wkOqheV.iSCpvvX38HvYwSsZ7AFnyQun/S','123'),('$2b$10$jveBcdcLZhHqEvunwM.52uqbRGO5tIe6Y7J.1jMzcgAEo7EbTZ/yu','123'),('$2b$10$lyEQpSRipZBmN3OBNEPWa.e9h8ToyLRF4gSXq3qVWYyZ7a5JMiBBy','miamors'),('$2b$10$m8apAYiaTcIgjeilFbgKsuOA5Ckolm/HgdB60SbsvQyzcxQbOnitm','1'),('$2b$10$n2TX9TtudzDP8lniHpFhXeoa/.nesXPtLwrjr5Zt30AAYNlyUo7KW','1'),('$2b$10$nBAFdUOMEK5litSyVEg/UOvcBFdCcxTxp9ctbNQ5eRazTeNDrdwGi','1234'),('$2b$10$pX4rRzgbh7PQV0Z8m5eAT.n969XzbJxo/aV8PzV9ondpvkvG52hJi','4'),('$2b$10$PX9g.GBUo6RoOb/EwuLnOO6kvtPt8yMhsO.AgR66V8xNe1EjgMOPC','1234'),('$2b$10$sFcQ4YGOaIGWio9XRYWD4eqdZ/h4b9CkIpawcsHzp0xun6EXWyOoa','renata'),('$2b$10$vchSwrEmm8umnRmgIXe9AuGYNRlHzvD09hIxrHgXiSGsRIUsAZM66','1'),('$2b$10$vH/3cNMiAl5fpK8zjFfvPO6V1naNqO33TQ4.yJz5m.q7ZfSq5MgKC','123'),('$2b$10$vsmKUHKZZqBsu7COiVUuHuwn9lOuTBXPa8Fd.RfbGYB.t/28esWNy','a'),('$2b$10$XB9pUYhuxCB31FWcLR8nreHP4DVGiMpQ8fRghMpCAVC628FJYPxSu','a'),('$2b$10$xmHWYT0T51ECzFYzJnSD2.JSj98YbjAtjGjbNi8qNb4jTqRjoo6xm','3'),('$2b$10$yAzvukuTVfXIfy3e5jmCFO6oEUHuN41f9hwfCWY7eNu4jLggWIhAu','2');
/*!40000 ALTER TABLE `contrasenas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `codigo` varchar(13) NOT NULL,
  `nombre` varchar(35) NOT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `cantidad` decimal(10,0) NOT NULL,
  `cantidad_minima` decimal(10,0) NOT NULL,
  PRIMARY KEY (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES ('1239329392932','Prueba',10.00,8,10),('2394309439049','Jumex Zanahoria',25.00,3,25),('2839843490393','Conchitas Granielotes',27.00,23,10),('2932988923782','Jumex Toronja',28.00,10,28),('2983829378237','Jumex Uva',27.00,7,10),('3092901038928','Pepsi',12.00,26,15);
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Trabajadores`
--

DROP TABLE IF EXISTS `Trabajadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Trabajadores` (
  `usuario` varchar(20) NOT NULL,
  `contrasena` varchar(128) NOT NULL,
  `rol` varchar(15) NOT NULL,
  `Nombre` varchar(30) NOT NULL,
  `apellido_paterno` varchar(20) NOT NULL,
  `apellido_materno` varchar(20) NOT NULL,
  PRIMARY KEY (`usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Trabajadores`
--

LOCK TABLES `Trabajadores` WRITE;
/*!40000 ALTER TABLE `Trabajadores` DISABLE KEYS */;
INSERT INTO `Trabajadores` VALUES ('andrade','$2b$10$n2TX9TtudzDP8lniHpFhXeoa/.nesXPtLwrjr5Zt30AAYNlyUo7KW','Operario','Andrade','Chehue','Hernández'),('arboilito','$2b$10$nBAFdUOMEK5litSyVEg/UOvcBFdCcxTxp9ctbNQ5eRazTeNDrdwGi','Operario','Arbol','Perez','Hernandez'),('chosina','$2b$10$JHWyY0UiBIN23YE7Vn8wkOqheV.iSCpvvX38HvYwSsZ7AFnyQun/S','Operario','Joyce','Abrego','Avila'),('crepusculobra','$2b$10$vH/3cNMiAl5fpK8zjFfvPO6V1naNqO33TQ4.yJz5m.q7ZfSq5MgKC','Operario','Brandon','Castillo','Martinez'),('danone','$2b$10$cpRu/Lx561rVy6EQft2i7OW8bnPZLIG2xPYyPc6piFPBxK9gh07Py','Administrador','Dana','Babun','Muñoz'),('jcamaney','$2b$10$e3ltDmY4jX0UWGU.rr/HF.NCkZwqcVr1QjOAIpzpNC93iJ4/8ZzUS','Administrador','Juan','Camaney','Ramírez'),('koreanite','$2b$10$lyEQpSRipZBmN3OBNEPWa.e9h8ToyLRF4gSXq3qVWYyZ7a5JMiBBy','Operario','Seolgo','Oh','Chu'),('miniona','$2b$10$PX9g.GBUo6RoOb/EwuLnOO6kvtPt8yMhsO.AgR66V8xNe1EjgMOPC','Administrador','Alma Rosaura','Morales','Ramírez'),('nemo12','$2b$10$sFcQ4YGOaIGWio9XRYWD4eqdZ/h4b9CkIpawcsHzp0xun6EXWyOoa','Operario','Jose Luis','Llanas','Zapata'),('ponchalo','$2b$10$bE.ceZevG5jcHv09fXXPxOSGkT6lN7Cq1f7yY0QXnil6pwSDIEmHm','Operario','Gonzalo','Molgado','Martinez'),('rnata','$2b$10$EG5FCjIwX6eqgMlsQ.Tzie47IaPTyIqA8coX4cOqp2yxO0H6qfmxe','Operario','Renata','Noriegas','Farias');
/*!40000 ALTER TABLE `Trabajadores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `num_venta` decimal(10,0) DEFAULT NULL,
  `producto` varchar(13) DEFAULT NULL,
  `cantidad` decimal(10,0) DEFAULT NULL,
  `total` decimal(10,0) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `usuario` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `producto` (`producto`),
  KEY `usuario` (`usuario`),
  CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`producto`) REFERENCES `productos` (`codigo`),
  CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`usuario`) REFERENCES `trabajadores` (`usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=168 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
INSERT INTO `ventas` VALUES (24,1,'2839843490393',1,27,'2025-05-28','danone'),(25,1,'2932988923782',1,28,'2025-05-28','danone'),(26,1,'2932988923782',1,28,'2025-05-28','danone'),(27,1,'2394309439049',1,25,'2025-05-28','danone'),(28,2,'2394309439049',1,25,'2025-05-28','danone'),(29,3,'2394309439049',1,25,'2025-05-28','danone'),(30,4,'2932988923782',1,28,'2025-05-28','danone'),(31,5,'2932988923782',1,28,'2025-05-28','danone'),(32,6,'2932988923782',1,28,'2025-05-28','danone'),(33,7,'2932988923782',1,28,'2025-05-28','danone'),(34,8,'2932988923782',1,28,'2025-05-28','danone'),(35,9,'2932988923782',1,28,'2025-05-28','danone'),(36,10,'2932988923782',1,28,'2025-05-28','danone'),(37,11,'2932988923782',1,28,'2025-05-28','danone'),(38,12,'2932988923782',1,28,'2025-05-28','danone'),(39,13,'2932988923782',1,28,'2025-05-28','danone'),(40,14,'2932988923782',1,28,'2025-05-28','danone'),(41,15,'2839843490393',1,27,'2025-05-28','danone'),(42,16,'2839843490393',1,27,'2025-05-28','danone'),(43,17,'2839843490393',1,27,'2025-05-28','danone'),(44,18,'2839843490393',1,27,'2025-05-28','danone'),(45,19,'2839843490393',1,27,'2025-05-28','danone'),(46,20,'2839843490393',1,27,'2025-05-28','danone'),(47,21,'2839843490393',1,27,'2025-05-28','danone'),(48,22,'2839843490393',1,27,'2025-05-28','danone'),(49,23,'2839843490393',1,27,'2025-05-28','danone'),(50,24,'2839843490393',1,27,'2025-05-28','danone'),(51,25,'2839843490393',1,27,'2025-05-28','danone'),(52,26,'2839843490393',1,27,'2025-05-28','danone'),(53,27,'2839843490393',1,27,'2025-05-28','danone'),(54,28,'2839843490393',1,27,'2025-05-28','danone'),(55,29,'2839843490393',1,27,'2025-05-28','danone'),(56,30,'2839843490393',1,27,'2025-05-28','danone'),(57,31,'2839843490393',1,27,'2025-05-28','danone'),(58,32,'2839843490393',1,27,'2025-05-28','danone'),(59,33,'2839843490393',1,27,'2025-05-28','danone'),(60,34,'2839843490393',1,27,'2025-05-28','danone'),(61,35,'2839843490393',1,27,'2025-05-28','danone'),(62,36,'2839843490393',1,27,'2025-05-28','danone'),(63,37,'2839843490393',1,27,'2025-05-28','danone'),(64,38,'2839843490393',1,27,'2025-05-28','danone'),(65,39,'2932988923782',1,28,'2025-05-28','danone'),(66,40,'2839843490393',1,27,'2025-05-28','danone'),(67,41,'2839843490393',1,27,'2025-05-28','danone'),(68,42,'2839843490393',1,27,'2025-05-28','danone'),(69,43,'2839843490393',1,27,'2025-05-28','danone'),(70,44,'2839843490393',1,27,'2025-05-28','danone'),(71,45,'2839843490393',1,27,'2025-05-28','danone'),(72,46,'2839843490393',1,27,'2025-05-28','danone'),(73,47,'2839843490393',1,27,'2025-05-28','danone'),(74,48,'2839843490393',1,27,'2025-05-28','danone'),(75,49,'2839843490393',1,27,'2025-05-28','danone'),(76,50,'2839843490393',1,27,'2025-05-28','danone'),(77,51,'2839843490393',1,27,'2025-05-28','danone'),(78,52,'2839843490393',1,27,'2025-05-28','danone'),(79,53,'2839843490393',1,27,'2025-05-28','danone'),(80,54,'2839843490393',1,27,'2025-05-28','danone'),(81,55,'2839843490393',1,27,'2025-05-28','danone'),(82,56,'2839843490393',1,27,'2025-05-28','danone'),(83,57,'2839843490393',1,27,'2025-05-28','danone'),(84,58,'2839843490393',1,27,'2025-05-28','danone'),(85,59,'2932988923782',1,28,'2025-05-28','danone'),(86,60,'2839843490393',1,27,'2025-05-28','danone'),(87,61,'2839843490393',1,27,'2025-05-28','danone'),(88,62,'2839843490393',1,27,'2025-05-28','danone'),(89,63,'2839843490393',1,27,'2025-05-29','danone'),(90,64,'2839843490393',1,27,'2025-05-29','danone'),(91,65,'2839843490393',1,27,'2025-05-29','danone'),(92,66,'2839843490393',1,27,'2025-05-29','danone'),(93,67,'2839843490393',1,27,'2025-05-29','danone'),(94,68,'2839843490393',1,27,'2025-05-29','danone'),(95,69,'2394309439049',7,175,'2025-05-29','danone'),(96,70,'2394309439049',1,25,'2025-05-29','danone'),(97,71,'2394309439049',1,25,'2025-05-29','danone'),(98,72,'2394309439049',1,25,'2025-05-29','danone'),(99,73,'2394309439049',1,25,'2025-05-29','danone'),(100,74,'2394309439049',1,25,'2025-05-29','danone'),(101,75,'2932988923782',1,28,'2025-05-29','danone'),(102,76,'2932988923782',1,28,'2025-05-29','danone'),(103,77,'2394309439049',1,25,'2025-05-29','danone'),(104,78,'2394309439049',1,25,'2025-05-29','danone'),(105,79,'2932988923782',1,53,'2025-05-29','danone'),(106,79,'2394309439049',1,53,'2025-05-29','danone'),(107,80,'2394309439049',1,25,'2025-05-29','danone'),(108,81,'2394309439049',1,25,'2025-05-29','danone'),(109,82,'2394309439049',1,25,'2025-05-29','danone'),(110,83,'2394309439049',1,25,'2025-05-29','danone'),(111,84,'2932988923782',1,28,'2025-05-29','danone'),(112,85,'2394309439049',3,185,'2025-05-29','danone'),(113,85,'2932988923782',2,185,'2025-05-29','danone'),(114,85,'2983829378237',2,185,'2025-05-29','danone'),(115,86,'2983829378237',1,27,'2025-05-29','danone'),(116,87,'2983829378237',1,27,'2025-05-29','danone'),(117,88,'2983829378237',1,27,'2025-05-29','danone'),(118,89,'2983829378237',1,27,'2025-05-29','danone'),(119,90,'2983829378237',1,27,'2025-05-29','danone'),(120,91,'2983829378237',1,27,'2025-05-29','danone'),(121,92,'2983829378237',1,27,'2025-05-29','danone'),(122,93,'2983829378237',1,27,'2025-05-29','danone'),(123,94,'2983829378237',1,27,'2025-05-29','danone'),(124,95,'2983829378237',1,27,'2025-05-29','danone'),(125,96,'2983829378237',1,27,'2025-05-29','danone'),(126,97,'3092901038928',1,12,'2025-05-29','danone'),(127,98,'2983829378237',1,27,'2025-05-29','danone'),(128,99,'2983829378237',1,27,'2025-05-29','danone'),(129,100,'2983829378237',1,27,'2025-05-29','danone'),(130,101,'2983829378237',1,27,'2025-05-29','danone'),(131,102,'2983829378237',1,27,'2025-05-29','danone'),(132,103,'2394309439049',1,92,'2025-05-29','danone'),(133,103,'2983829378237',1,92,'2025-05-29','danone'),(134,103,'3092901038928',1,92,'2025-05-29','danone'),(135,103,'2932988923782',1,92,'2025-05-29','danone'),(136,104,'2932988923782',2,147,'2025-05-29','danone'),(137,104,'2839843490393',1,147,'2025-05-29','danone'),(138,104,'2394309439049',1,147,'2025-05-29','danone'),(139,104,'2983829378237',1,147,'2025-05-29','danone'),(140,104,'3092901038928',1,147,'2025-05-29','danone'),(141,105,'2394309439049',1,550,'2025-05-29','danone'),(142,105,'3092901038928',1,550,'2025-05-29','danone'),(143,105,'2839843490393',19,550,'2025-05-29','danone'),(144,106,'2839843490393',10,270,'2025-05-29','danone'),(145,107,'2839843490393',1,27,'2025-05-29','miniona'),(146,108,'2839843490393',1,27,'2025-05-29','miniona'),(147,109,'2839843490393',1,27,'2025-05-29','miniona'),(148,110,'2839843490393',1,27,'2025-05-29','miniona'),(149,111,'2932988923782',3,84,'2025-05-29','danone'),(150,112,'2839843490393',1,27,'2025-05-29','danone'),(151,113,'2932988923782',1,28,'2025-05-29','miniona'),(152,114,'2932988923782',1,28,'2025-05-29','miniona'),(153,115,'2394309439049',1,25,'2025-05-29','miniona'),(154,116,'2932988923782',1,28,'2025-05-29','miniona'),(155,117,'2839843490393',1,27,'2025-05-29','miniona'),(156,118,'2839843490393',2,54,'2025-05-29','miniona'),(157,119,'2394309439049',1,52,'2025-05-29','miniona'),(158,119,'2983829378237',1,52,'2025-05-29','miniona'),(159,120,'2394309439049',1,52,'2025-05-29','miniona'),(160,120,'2983829378237',1,52,'2025-05-29','miniona'),(161,121,'2394309439049',1,25,'2025-05-29','miniona'),(162,122,'1239329392932',1,10,'2025-05-29','miniona'),(163,123,'2932988923782',1,28,'2025-05-29','miniona'),(164,124,'2932988923782',1,28,'2025-05-29','miniona'),(165,125,'2932988923782',1,28,'2025-05-29','miniona'),(166,126,'2394309439049',4,110,'2025-05-29','miniona'),(167,126,'1239329392932',1,110,'2025-05-29','miniona');
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'comercial_cabello'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-08 15:11:19
