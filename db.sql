/*
 Navicat Premium Data Transfer

 Source Server         : ittat
 Source Server Type    : MySQL
 Source Server Version : 5
 Source Host           : localhost:3306
 Source Schema         : trip

 Target Server Type    : MySQL
 Target Server Version : 80012
 File Encoding         : 65001

 Date: 10/06/2021 23:46:42
*/

SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user_data
-- ----------------------------
DROP TABLE IF EXISTS `login_data`;
CREATE TABLE `login_data` (
  `userId` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE(`username`),
  UNIQUE(`email`),
  UNIQUE(`token`)
) ENGINE=InnoDB AUTO_INCREMENT=10020 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;



-- ----------------------------
-- Records of total_data
-- ----------------------------
BEGIN;
INSERT INTO `login_data` VALUES (1, 'test', '123', 'test@email.com',NULL);
INSERT INTO `login_data` VALUES (2, 'test2', '123', 'test2@email.com',NULL);
INSERT INTO `login_data` VALUES (3, 'test3', '123', 'test3@email.com',NULL);
COMMIT;



DROP TABLE IF EXISTS `user_infos`;
CREATE TABLE `user_infos` (
    `userId` int(11) NOT NULL,
    `username` varchar(255) DEFAULT NULL,
    `sex` int(2) DEFAULT NULL,
    `desc` varchar(21000) DEFAULT NULL,
    `follower` text,
    `follows`   text,
    `like_posts` text,
    PRIMARY KEY (`userId`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- BEGIN;
-- INSERT INTO `user_infos` (`userId`,`username`,`sex`,`desc`) 
--     VALUES (1, (SELECT `username` FROM `login_data` WHERE userId = 1 LIMIT 1) , '1', 'Hi! ALL');
-- COMMIT;

create trigger triggerName1
before insert on `user_infos` 
for each row 
SET NEW.username = (SELECT username FROM login_data WHERE userId = NEW.userId);


BEGIN;
INSERT INTO `user_infos` (`userId`,`sex`,`desc`) 
    VALUES (1, '1', 'Hi! ALL');
INSERT INTO `user_infos` (`userId`,`sex`,`desc`) 
    VALUES (2, '1', 'Hi! I am test2');
INSERT INTO `user_infos` (`userId`,`sex`,`desc`) 
    VALUES (3, '2', 'Hi! I am test3');
COMMIT;


-- create posts_data table

DROP TABLE IF EXISTS `posts_data`;
CREATE TABLE  `posts_data` (
    `postId` int(11) NOT NULL AUTO_INCREMENT,
    `userId` int(11) NOT NULL,
    `context` text,
    `date` date NOT NULL,
    `time` time NOT NULL,
    `like` int(9) DEFAULT 0,
    `img` text CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
    PRIMARY KEY (`postId`)
)ENGINE=InnoDB AUTO_INCREMENT=2021 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

BEGIN;
INSERT INTO `posts_data` (`userId`,`context`,`date`,`time`) 
    VALUES (1, '1 Hi! ALL fjsdkjfhdjsfhjsd jksdfhdjsfhdjksfhdjksf dsfjhdksjfhdksfjhdksdfh dfjdsjkfhdkfs dkfjdskfjsdklfjsfjsdlkfdsdsfkj dkfjsdlkfj ',
            (SELECT curdate()),
            (SELECT curtime()));
INSERT INTO `posts_data` (`userId`,`context`,`date`,`time`) 
    VALUES (1, '1port2 fjsdkjfhdjsfhjsd jksdfhdjsfhdjksfhdjksf dsfjhdksjfhdksfjhdksdfh dfjdsjkfhdkfs dkfjdskfjsdklfjsfjsdlkfdsdsfkj dkfjsdlkfj ',
            (SELECT curdate()),
            (SELECT curtime()));
INSERT INTO `posts_data` (`userId`,`context`,`date`,`time`) 
    VALUES (1, '1port3 fjsdkjfhdjsfhjsd jksdfhdjsfhdjksfhdjksf dsfjhdksjfhdksfjhdksdfh dfjdsjkfhdkfs dkfjdskfjsdklfjsfjsdlkfdsdsfkj dkfjsdlkfj ',
            (SELECT curdate()),
            (SELECT curtime()));
INSERT INTO `posts_data` (`userId`,`context`,`date`,`time`) 
    VALUES (1, '1port4 fjsdkjfhdjsfhjsd jksdfhdjsfhdjksfhdjksf dsfjhdksjfhdksfjhdksdfh dfjdsjkfhdkfs dkfjdskfjsdklfjsfjsdlkfdsdsfkj dkfjsdlkfj ',
            (SELECT curdate()),
            (SELECT curtime()));
INSERT INTO `posts_data` (`userId`,`context`,`date`,`time`) 
    VALUES (2, '2port1 fjsdkjfhdjsfhjsd jksdfhdjsfhdjksfhdjksf dsfjhdksjfhdksfjhdksdfh dfjdsjkfhdkfs dkfjdskfjsdklfjsfjsdlkfdsdsfkj dkfjsdlkfj ',
            (SELECT curdate()),
            (SELECT curtime()));
INSERT INTO `posts_data` (`userId`,`context`,`date`,`time`) 
    VALUES (2, '2port2 fjsdkjfhdjsfhjsd jksdfhdjsfhdjksfhdjksf dsfjhdksjfhdksfjhdksdfh dfjdsjkfhdkfs dkfjdskfjsdklfjsfjsdlkfdsdsfkj dkfjsdlkfj ',
            (SELECT curdate()),
            (SELECT curtime()));
INSERT INTO `posts_data` (`userId`,`context`,`date`,`time`) 
    VALUES (2, '2port3 fjsdkjfhdjsfhjsd jksdfhdjsfhdjksfhdjksf dsfjhdksjfhdksfjhdksdfh dfjdsjkfhdkfs dkfjdskfjsdklfjsfjsdlkfdsdsfkj dkfjsdlkfj ',
            (SELECT curdate()),
            (SELECT curtime()));
INSERT INTO `posts_data` (`userId`,`context`,`date`,`time`) 
    VALUES (3, '3port1 fjsdkjfhdjsfhjsd jksdfhdjsfhdjksfhdjksf dsfjhdksjfhdksfjhdksdfh dfjdsjkfhdkfs dkfjdskfjsdklfjsfjsdlkfdsdsfkj dkfjsdlkfj ',
            (SELECT curdate()),
            (SELECT curtime()));
INSERT INTO `posts_data` (`userId`,`context`,`date`,`time`) 
    VALUES (3, '3port2 fjsdkjfhdjsfhjsd jksdfhdjsfhdjksfhdjksf dsfjhdksjfhdksfjhdksdfh dfjdsjkfhdkfs dkfjdskfjsdklfjsfjsdlkfdsdsfkj dkfjsdlkfj ',
            (SELECT curdate()),
            (SELECT curtime()));
COMMIT;

