CREATE TABLE `Recorrencia` (
  `RecorrenciaId` int(11) NOT NULL AUTO_INCREMENT,
  `Descricao` varchar(45) NOT NULL
  PRIMARY KEY (`RecorrenciaId`));
INSERT INTO `hjqoto3qzd8dzwaw`.`Recorrencia` (`Descricao`) VALUES ('Única'),('Diária'),('Semanal'),('Mensal'),('Anual');


CREATE TABLE `Titulo` (
  `TituloId` int(11) NOT NULL AUTO_INCREMENT,
  `Descricao` varchar(45) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`TituloId`));
INSERT INTO `hjqoto3qzd8dzwaw`.`Recorrencia` (`Descricao`) VALUES ('Lavar louças'),('Colocar lixo na rua'),('Passear com dogs'),('Ligar na seguradora');


CREATE TABLE `Configuracao` (
  `ConfiguracaoId` int(11) NOT NULL AUTO_INCREMENT,
  `TituloId` int(11) NOT NULL,
  `RecorrenciaId` int(11) NOT NULL,
  `Inicio` date NOT NULL,
  `Ativo` tinyint(1) DEFAULT NULL,
  `DataCriacao` datetime DEFAULT NULL,
  PRIMARY KEY (`ConfiguracaoId`),
  KEY `fk_tituloid` (`TituloId`), CONSTRAINT `fk_tituloid` FOREIGN KEY (`TituloId`) REFERENCES `Titulo` (`TituloId`),
  KEY `fk_recorrenciaid` (`RecorrenciaId`), CONSTRAINT `fk_recorrenciaid` FOREIGN KEY (`RecorrenciaId`) REFERENCES `Recorrencia` (`RecorrenciaId`));
INSERT INTO `hjqoto3qzd8dzwaw`.`Configuracao` 
(`TituloId`,`RecorrenciaId`,`Inicio`,`Ativo`,`DataCriacao`) 
VALUES (4,1,'2016-10-14', 1, NOW()),(1,2,'2016-10-18', 1, NOW());


CREATE TABLE `TarefaConcluida` (
  `TarefaConcluidaId` int(11) NOT NULL AUTO_INCREMENT,
  `ConfiguracaoId` int(11) NOT NULL,
  `DataConclusao` datetime NOT NULL,
  PRIMARY KEY (`TarefaConcluidaId`),
  KEY `fk_configuracaoid` (`ConfiguracaoId`), CONSTRAINT `fk_configuracaoid` FOREIGN KEY (`ConfiguracaoId`) REFERENCES `Configuracao` (`ConfiguracaoId`)
);
INSERT INTO `hjqoto3qzd8dzwaw`.`TarefaConcluida` (`ConfiguracaoId`,`DataConclusao`) 
VALUES (3,'2016-10-14 09:00:00'),(4,'2016-10-14 08:32:01'),(4,'2016-10-15 08:51:00');



--obter tarefas de hoje
 SELECT DISTINCT 
   A.ConfiguracaoId ConfigId, B.Descricao AS Titulo, 
   CASE WHEN TC.TarefaConcluidaId IS NULL THEN 0 ELSE 1 END AS TarefaConcluida 
 FROM hjqoto3qzd8dzwaw.Configuracao A 
 INNER JOIN Titulo B ON B.TituloId = A.TituloId 
 LEFT JOIN TarefaConcluida TC ON TC.ConfiguracaoId = A.ConfiguracaoId 
 WHERE 
   Inicio <= DATE_ADD(NOW(),INTERVAL 1 DAY) AND Ativo = 1 AND ( 
   (RecorrenciaId = 1 AND DATE(DATE_ADD(NOW(),INTERVAL 1 DAY)) = DATE(Inicio)) 
   OR (RecorrenciaId = 2) 
   OR (RecorrenciaId = 3 AND DAYOFWEEK(Inicio) = DAYOFWEEK(DATE_ADD(NOW(),INTERVAL 1 DAY)) ) 
   OR (RecorrenciaId = 4 AND DAY(Inicio) = DAY(DATE_ADD(NOW(),INTERVAL 1 DAY)))  
   OR (RecorrenciaId = 5 AND DAY(Inicio) = DAY(DATE_ADD(NOW(),INTERVAL 1 DAY)) AND MONTH(Inicio) = MONTH(DATE_ADD(NOW(),INTERVAL 1 DAY)) ) 
 ); 