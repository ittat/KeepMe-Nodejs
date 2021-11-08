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
    `userId` int(11) NOT NULL AUTO_INCREMENT,
    `username` varchar(255) DEFAULT NULL,
    `sex` int(2) DEFAULT NULL,
    `desc` varchar(21000) DEFAULT NULL,
    `like_posts` text,
    `userImg` text,
    PRIMARY KEY (`userId`)
)ENGINE=InnoDB AUTO_INCREMENT=20000 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- BEGIN;
-- INSERT INTO `user_infos` (`userId`,`username`,`sex`,`desc`) 
--     VALUES (1, (SELECT `username` FROM `login_data` WHERE userId = 1 LIMIT 1) , '1', 'Hi! ALL');
-- COMMIT;

DROP trigger IF EXISTS `triggerName1`;
create trigger `triggerName1`
before insert on `user_infos` 
for each row 
SET NEW.username = (SELECT username FROM login_data WHERE userId = NEW.userId);


BEGIN;
INSERT INTO `user_infos` (`userId`,`sex`,`desc`,`userImg`) 
    VALUES (1, '1', 'Hi! ALL',"https://avatars2.githubusercontent.com/u/8186664?s=460&v=4");
INSERT INTO `user_infos` (`userId`,`sex`,`desc`,`userImg`) 
    VALUES (2, '1', 'Hi! I am test2',"https://avatars2.githubusercontent.com/u/8186664?s=460&v=4");
INSERT INTO `user_infos` (`userId`,`sex`,`desc`,`userImg`) 
    VALUES (3, '2', 'Hi! I am test3',"https://avatars2.githubusercontent.com/u/8186664?s=460&v=4");
COMMIT;


-- create posts_data table

DROP TABLE IF EXISTS `posts_data`;
CREATE TABLE  `posts_data` (
    `postId` int(11) NOT NULL AUTO_INCREMENT,
    `userId` int(11) NOT NULL,
    `context` text,
    `date` text NOT NULL,
    `img` text CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
    PRIMARY KEY (`postId`)
)ENGINE=InnoDB AUTO_INCREMENT=2021 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

BEGIN;
INSERT INTO `posts_data` (`userId`,`context`,`date`) 
    VALUES (1, '推文1',
            (SELECT now()));
INSERT INTO `posts_data` (`userId`,`context`,`date`) 
    VALUES (1, '推文2',
            (SELECT now()));
INSERT INTO `posts_data` (`userId`,`context`,`date`) 
    VALUES (1, '推文3',
            (SELECT now()));
INSERT INTO `posts_data` (`userId`,`context`,`date`) 
    VALUES (1, '推文4',
            (SELECT now()));
COMMIT;




DROP TABLE IF EXISTS `follow_link`;
-- followerId A 关注人
-- followId B 关注粉
-- A 被 B 关注了
CREATE TABLE `follow_link` (
    `followerId` int(11) NOT NULL,
    `followId` int(11) NOT NULL,
    PRIMARY KEY(`followerId`,`followId`)
)ENGINE=InnoDB;



DROP TABLE IF EXISTS `posts_likes`;
CREATE TABLE `posts_likes` (
    `postId` int(11) NOT NULL,
    `userId` int(11) NOT NULL,
    PRIMARY KEY(`postId`,`userId`)
)ENGINE=InnoDB;




DROP TABLE IF EXISTS `posts_commits`;
CREATE TABLE `posts_commits` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `userId` int(11),
    -- `commitType` int(2) NOT NULL,
    `context` text,
    `toPostId` int(11) NOT NULL,
    `toUserId` int(11),
    `created_at` text NOT NULL,
    PRIMARY KEY(`id`)
)ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;




-- 储存通知信息
-- messageType 通知类型 ： post—like post-commit user-follow
-- userId 通知介绍用户
-- from 发送源地址 ： userid postid
-- context : 你有新回复 有新关注你的人 你的推文有新的点赞
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `messageType` text NOT NULL,
    `userId` int(11) NOT NULL,
    `form` int(11) NOT NULL,
    `context` text,
    `created_at` text,
    PRIMARY KEY(`id`)
)ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;



-- 触法套装事件采集 getPostMessage 触发器
DROP trigger IF EXISTS `getPostMessage`;
create trigger `getPostMessage`
before insert on `posts_commits` 
for each row 
insert into messages(messageType,userId,form,context,created_at)
            VALUES( 
                'post-commit',
                (SELECT userId FROM posts_data WHERE postId = New.toPostId),
                NEW.toPostId,
                '你的推文有新的回复',
                New.created_at
                );


BEGIN;
INSERT INTO `posts_commits` (`userId`,`context`,`toPostId`,`created_at` ) 
    VALUES (1,"回复1",2022,(SELECT now()));
INSERT INTO `posts_commits` (`userId`,`context`,`toPostId`,`created_at` ) 
    VALUES (2,"回复2",2022,(SELECT now()));
INSERT INTO `posts_commits` (`userId`,`context`,`toPostId`,`toUserId`,`created_at` ) 
    VALUES (3,"回复3",2022,1,(SELECT now()));
COMMIT;


-- 触法套装事件采集 getPostMessage 触发器
DROP trigger IF EXISTS `getPostLikeMessage`;
create trigger `getPostLikeMessage`
before insert on `posts_likes` 
for each row 
insert into messages(messageType,userId,form,context)
            VALUES( 
                'post—like',
                (SELECT userId FROM posts_data WHERE postId = New.PostId),
                NEW.PostId,
                '你的推文有新的点赞'
                );



BEGIN;
INSERT INTO `posts_likes` VALUES (2023,1);
INSERT INTO `posts_likes` VALUES (2022,1);
INSERT INTO `posts_likes` VALUES (2023,2);
INSERT INTO `posts_likes` VALUES (2021,3);
COMMIT;



-- 触法套装事件采集 getPostMessage 触发器
DROP trigger IF EXISTS `getFollowMessage`;
create trigger `getFollowMessage`
before insert on `follow_link` 
for each row 
insert into messages(messageType,userId,form,context)
            VALUES( 
                'post—like',
                New.followerId,
                NEW.followId,
                '有新关注你的人'
                );


BEGIN;
INSERT INTO `follow_link` VALUES (1,2);
INSERT INTO `follow_link` VALUES (2,1);
INSERT INTO `follow_link` VALUES (1,3);
INSERT INTO `follow_link` VALUES (2,2);
COMMIT;

