-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: clinicaaurum
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `citas`
--

DROP TABLE IF EXISTS `citas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citas` (
  `id` varchar(20) NOT NULL COMMENT 'ID único y amigable para la cita, ej: APT-1234',
  `paciente_id` int NOT NULL,
  `estudio_id` int NOT NULL,
  `fecha_cita` date NOT NULL,
  `hora_cita` time NOT NULL,
  `estado` enum('Pendiente','Confirmada','Completada','Cancelada') NOT NULL DEFAULT 'Pendiente',
  `notas_admin` text COMMENT 'Notas internas para el personal administrativo.',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `paciente_id` (`paciente_id`),
  KEY `estudio_id` (`estudio_id`),
  CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`estudio_id`) REFERENCES `estudios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Registros de citas que conectan pacientes con estudios.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citas`
--

LOCK TABLES `citas` WRITE;
/*!40000 ALTER TABLE `citas` DISABLE KEYS */;
INSERT INTO `citas` VALUES ('APT-1063',18,11,'2026-08-19','09:00:00','Cancelada',NULL,'2026-08-14 07:07:11','2026-08-14 07:28:50'),('APT-2074',21,11,'2026-08-20','09:30:00','Confirmada',NULL,'2026-08-14 07:29:12','2026-08-14 07:29:15'),('APT-2166',15,11,'2026-08-27','10:30:00','Cancelada',NULL,'2026-08-14 07:25:32','2026-08-14 07:28:45'),('APT-4573',22,13,'2026-08-20','10:00:00','Confirmada',NULL,'2026-08-18 00:03:04','2026-08-18 00:03:10'),('APT-6906',15,12,'2026-08-21','09:30:00','Cancelada',NULL,'2026-08-14 07:24:36','2026-08-14 07:25:05'),('APT-8886',17,12,'2026-08-20','09:00:00','Cancelada','','2026-08-14 07:05:28','2026-08-14 07:28:50');
/*!40000 ALTER TABLE `citas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estudios`
--

DROP TABLE IF EXISTS `estudios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estudios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_estudio` varchar(100) NOT NULL,
  `descripcion` text,
  `preparacion` text COMMENT 'Instrucciones para el paciente antes del estudio.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre_estudio` (`nombre_estudio`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Catálogo de todos los estudios médicos disponibles.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudios`
--

LOCK TABLES `estudios` WRITE;
/*!40000 ALTER TABLE `estudios` DISABLE KEYS */;
INSERT INTO `estudios` VALUES (2,'Ultrasonido de Alta Resolución',NULL,NULL),(3,'Ultrasonido Mamario',NULL,NULL),(4,'Ultrasonido Tiroideo',NULL,NULL),(5,'Ultrasonido Abdominal',NULL,NULL),(6,'Ultrasonido Pélvico',NULL,NULL),(7,'Ultrasonido Musculoesquelético',NULL,NULL),(8,'Doppler Arterial',NULL,NULL),(9,'Doppler Venoso',NULL,NULL),(10,'Biopsia de Tiroides',NULL,NULL),(11,'Biopsia de Mama',NULL,NULL),(12,'Biopsia de Ganglio',NULL,NULL),(13,'Elastografía',NULL,NULL);
/*!40000 ALTER TABLE `estudios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pacientes`
--

DROP TABLE IF EXISTS `pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pacientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(255) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `edad` int DEFAULT NULL,
  `sexo` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Almacena la información de contacto de cada paciente.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacientes`
--

LOCK TABLES `pacientes` WRITE;
/*!40000 ALTER TABLE `pacientes` DISABLE KEYS */;
INSERT INTO `pacientes` VALUES (14,'leandro reyes','2345678223233','leanjr19@gmail.com','2026-08-09 05:57:50',22,'Masculino'),(15,'Brigitte Reyes Palmero','4464325342','reyesleandro067@gmail.com','2026-08-09 05:58:21',22,'Masculino'),(17,'Test User','1234567890','test@example.com','2026-08-14 06:31:37',25,'Masculino'),(18,'Admin User','0987654321','admin@example.com','2026-08-14 07:07:11',NULL,NULL),(21,'leandro','1234567890','reyesleandro067@gmail.com','2026-08-14 07:29:12',22,'Masculino'),(22,'daniel juarez','2361079026','leanjr19@gmail.com','2026-08-18 00:03:04',22,'Masculino');
/*!40000 ALTER TABLE `pacientes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-17 23:40:37
