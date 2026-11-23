CREATE DATABASE IF NOT EXISTS casa_dos_games
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE casa_dos_games;

CREATE TABLE IF NOT EXISTS games (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(120) NOT NULL,
  thumbnail TEXT NOT NULL,
  short_description VARCHAR(500) NOT NULL,
  genre VARCHAR(40) NOT NULL,
  platform VARCHAR(40) NOT NULL,
  game_url VARCHAR(500) NOT NULL DEFAULT '',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
