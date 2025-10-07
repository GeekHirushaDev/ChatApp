CREATE DATABASE IF NOT EXISTS chatapp;
USE chatapp;

-- Dumping structure for table chatapp.chat
CREATE TABLE IF NOT EXISTS chat (
  id int NOT NULL AUTO_INCREMENT,
  created_at timestamp NULL DEFAULT (now()),
  updated_at timestamp NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  files varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  message varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  status varchar(45) DEFAULT NULL,
  from_user int DEFAULT NULL,
  to_user int DEFAULT NULL,
  PRIMARY KEY (id),
  KEY FK_qydhn8kg94hqya41okkq4h5ng (from_user),
  KEY FK_e6od82vcl84c3j9hawauu8xwn (to_user),
  CONSTRAINT FK_e6od82vcl84c3j9hawauu8xwn FOREIGN KEY (to_user) REFERENCES users (id),
  CONSTRAINT FK_qydhn8kg94hqya41okkq4h5ng FOREIGN KEY (from_user) REFERENCES users (id)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Dumping structure for table chatapp.friend_list
CREATE TABLE IF NOT EXISTS friend_list (
  id int NOT NULL AUTO_INCREMENT,
  user_status varchar(45) DEFAULT NULL,
  friend_id int DEFAULT NULL,
  users_id int DEFAULT NULL,
  display_name varchar(100) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY FK_t35f03kjx6389385fthfry288 (friend_id),
  KEY FK_iowy5ox4ohgvdxt9uuud1oijw (users_id),
  CONSTRAINT FK_iowy5ox4ohgvdxt9uuud1oijw FOREIGN KEY (users_id) REFERENCES users (id),
  CONSTRAINT FK_t35f03kjx6389385fthfry288 FOREIGN KEY (friend_id) REFERENCES users (id)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Dumping structure for table chatapp.users
CREATE TABLE IF NOT EXISTS users (
  id int NOT NULL AUTO_INCREMENT,
  created_at timestamp NULL DEFAULT (now()),
  updated_at timestamp NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  contact_no varchar(45) NOT NULL,
  country_code varchar(5) NOT NULL,
  first_name varchar(45) NOT NULL,
  last_name varchar(45) NOT NULL,
  status varchar(45) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY UK_4evw97yyknewdt98v2o1fvlg5 (contact_no)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;