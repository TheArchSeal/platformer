CREATE TABLE users (
	id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(20) NOT NULL,
    password VARCHAR(64) NOT NULL,
	signupDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	admin BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id)
);

CREATE TABLE levels (
	id INT NOT NULL AUTO_INCREMENT,
	creatorId INT NOT NULL,
    name VARCHAR(20) NOT NULL,
	description VARCHAR(8000) NOT NULL,
	uploadDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    filename VARCHAR(32) NOT NULL,
	public BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id),
	FOREIGN KEY (creatorId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ratings (
	userId INT NOT NULL,
	levelId INT NOT NULL,
	score INT NOT NULL,
	PRIMARY KEY (userId, levelId),
	FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (levelId) REFERENCES levels(id) ON DELETE CASCADE
);

CREATE TABLE comments (
	id INT NOT NULL AUTO_INCREMENT,
    levelId INT NOT NULL,
	userId INT NOT NULL,
	content VARCHAR(8000) NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (levelId) REFERENCES levels(id) ON DELETE CASCADE,
	FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE highscores (
	levelId INT NOT NULL,
	userId INT NOT NULL,
	attempts INT NOT NULL,
	bestTime INT NOT NULL,
	bestDeaths INT NOT NULL,
	PRIMARY KEY (userId, levelId),
	FOREIGN KEY (levelId) REFERENCES levels(id) ON DELETE CASCADE,
	FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE follows (
	followerId INT NOT NULL,
	creatorId INT NOT NULL,
	PRIMARY KEY (followerId, creatorId),
	FOREIGN KEY (followerId) REFERENCES users(id) ON DELETE CASCADE,
	FOREIGN KEY (creatorId) REFERENCES users(id) ON DELETE CASCADE
);
