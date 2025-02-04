const express = require("express");
const cookieParser = require('cookie-parser');
const multer = require('multer');
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const hbs = require("hbs");

// connect to database
const db = mysql.createPool({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE,
	multipleStatements: true,
	namedPlaceholders: true
});

// import my code from other files
const validate = require("./custom_modules/validate");
const {
	internal_error,
	handle_rows,
	handle_value,
	set_message,
	pop_message,
	login,
	verify_login,
	get_rating,
	get_followers
} = require("./custom_modules/helpers")(db);

// create new handlebars helper to select html option with value
hbs.registerHelper("select", (value, options) => options.fn(this).replace(new RegExp(`(value="${value}")`), "$1 selected"));

// paths to files
const site_path = __dirname + "/public/";
const upload_path = __dirname + "/uploads/";
// 8-64 characters including uppercase, lowercase, number and special
const password_check = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,64}$/;
// stay logged in for 1 day
const login_time = 24 * 60 * 60;

const app = express();
app.set("view engine", "hbs");
app.use(express.static(site_path));
// parse request
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const upload = multer({ dest: upload_path });

// handle "basic" pages
app.get("/upload", verify_login((req, res, user) => res.render("upload", { ...pop_message(req, res), user: user })));
app.get("/login", (req, res) => res.render("login", pop_message(req, res)));
app.get("/signup", (req, res) => res.render("signup", pop_message(req, res)));
app.get("/level/edit", (req, res) => res.render("edit"));

// render homepage
app.get("/", verify_login((req, res, user) => {
	if (!user) res.render("home", { search: req.query });
	else db.query( // select follows with their usernames
		`SELECT creatorId, username FROM follows
		LEFT JOIN users ON follows.creatorId = users.id
		WHERE followerId = :userId ORDER BY username DESC`,
		{ userId: user.id }, handle_rows(
			rows => res.render("home", { user: user, follows: rows, search: req.query }),
			internal_error(res)
		)
	);
}));

// render user page
app.get("/user", verify_login((req, res, user) => {
	const { id } = req.query;

	db.query( // select basic stats, number of levels and average level ratings
		`SELECT id, username, admin, DATE_FORMAT(signupDate, '%Y-%m-%d') AS signupDate,
		(SELECT COUNT(1) FROM follows WHERE followerId = :userId AND creatorId = :targetId) AS isFollowing,
		(SELECT COUNT(*) FROM levels WHERE creatorId = :targetId) AS levelAmount,
		(SELECT COALESCE(ROUND(AVG(score), 0), 0) FROM (
			SELECT COALESCE(SUM(score),0) AS score
			FROM ratings LEFT JOIN levels ON ratings.levelId = levels.id
			WHERE levels.creatorId = :targetId GROUP BY levels.id
		) AS scores) AS avgRating
		FROM users WHERE id = :targetId`,
		{ userId: user?.id, targetId: id }, handle_value(
			target => get_followers(id, followers =>
				res.render("user", {
					user: user, target: target, followers: followers,
					relation: { // how the user on the page relates to the user viewing the page
						self: user && user.id === target.id,
						admin: user?.admin,
						followable: user && user.id !== target.id,
						deletable: user && (user.id === target.id || user.admin)
					}
				})),
			() => res.render("404", { page: "user" }), // user not in database
			internal_error(res)
		)
	);
}));

// render level page
app.get("/level", verify_login((req, res, user) => {
	const { id } = req.query;

	db.query( // select basic stats, creator name and what the user rated it
		`SELECT levels.id, name, description, DATE_FORMAT(uploadDate, '%Y-%m-%d') AS uploadDate,
		creatorId, username AS creator, score as userScore FROM levels
		LEFT JOIN users ON levels.creatorId = users.id
		LEFT JOIN ratings ON levels.id = ratings.levelId AND ratings.userId = :userId
		WHERE levels.id = :levelId`,
		{ userId: user?.id, levelId: id }, handle_value(
			level => get_rating(id, rating => get_followers(level.creatorId, followers =>
				res.render("level", {
					level: level, user: user, rating: rating, followers: followers,
					relation: { // how the user on the page relates to the user viewing the page
						deletable: user && (user.id === level.creatorId || user.admin)
					}
				}))
			),
			() => res.render("404", { page: "level" }), // level not in database
			internal_error(res)
		)
	);
}));

app.get("/level/play", (req, res) => {
	const { id, local } = req.query;

	if (local) {
		res.render("game", { level: { name: "Test" }, local: local });
	} else {
		// select basic stats
		db.query("SELECT id, name, filename FROM levels WHERE id = :levelId", { levelId: id }, handle_value(
			level => {
				// get game data from file
				const json = fs.readFileSync(upload_path + level.filename);
				res.render("game", { level: level, data: json });
			},
			() => res.render("404", { page: "level" }), // level not in database
			internal_error(res)
		));
	}
});

// respond with levels displayed on homepage
app.get("/feed", verify_login((req, res, user) => {
	const { start, len, sort, order, ...filters } = req.query;

	let sort_string; // column to sort by
	let order_string; // "ASC" or "DESC"
	let filter_string = ""; // AND operands in the WHERE clause

	// add filter terms to expression
	for (const key in filters) {
		switch (key) {
			case "name":
				// not case sensitive include
				filter_string += " AND LOCATE(:name, name) > 0";
				break;
			case "levelId":
				// id must be exact
				filter_string += " AND levels.id = :levelId";
				break;
			case "creator":
				// not case sensitive include
				filter_string += " AND LOCATE(:creator, username) > 0";
				break;
			case "creatorId":
				// id must be exact
				filter_string += " AND levels.creatorId = :creatorId";
				break;
			default:
				// unrecognized filter
				res.sendStatus(400);
				return;
		}
	}

	// recommended/personalized feed
	if (sort === "default") {
		// decrease relevance with time, negative relevance can't increase with time, followed levels effectively have 100 more rating
		sort_string = `LEAST(
			IF(following, 100 + score, score),
			IF(following, 100 + score, score) / (1 + EXP(DATEDIFF(CURRENT_TIMESTAMP, uploadDate) / 5 - 2))
		)`;
		// only descend relevance
		order_string = "DESC";
		// don't get recommended your own levels
		if (user) filter_string += " AND NOT levels.creatorId = :userId"
	}
	// sorted by column
	else if (["name", "score", "uploadDate"].includes(sort) && ["asc", "desc"].includes(order)) {
		sort_string = sort;
		order_string = order.toUpperCase();
	}
	// sort column not recognized
	else {
		res.sendStatus(400);
		return
	}

	// maybe bad practice to use variables directly in the sql query but they are sanitized and wouldn't work otherwise
	db.query( // select levels, their creator, their score and their relevance
		`SELECT (levels.public AND levels.creatorId = :userId) AS test, levels.id, name, username as creator, score as score, ${sort_string} as sortVal
		FROM levels
		LEFT JOIN users ON levels.creatorId = users.id
		LEFT JOIN (
			SELECT creatorId, 1 AS following FROM follows WHERE followerId = :userId
		) AS follows ON levels.creatorId = follows.creatorId
		LEFT JOIN (
			SELECT id as levelId, COALESCE(SUM(score),0) AS score FROM levels LEFT JOIN ratings ON id = levelId GROUP BY id
		) as ratings ON levels.id = ratings.levelId
		WHERE (levels.public OR levels.creatorId = :userId)${filter_string} ORDER BY sortVal ${order_string} LIMIT :start, :len`,
		{ userId: user?.id, start: +start, len: +len, ...filters },
		handle_rows(
			levels => res.json(levels),
			internal_error(res)
		)
	);
}));

// respond with comments on a level
app.get("/level/comments", verify_login((req, res, user) => {
	const { id, start, len } = req.query;

	db.query( // select comment, comment creator name and wether the user can delete it
		`SELECT comments.id, content, userId, username, (userId = :userId OR :admin) AS deletable FROM comments
		LEFT JOIN users ON comments.userId = users.id WHERE comments.levelId = :levelId
		LIMIT :start, :len`,
		{ userId: user?.id, admin: user?.admin, levelId: id, start: +start, len: +len }, handle_rows(
			comments => res.json(comments),
			internal_error(res)
		)
	);
}));

// respond with highscores and the users rank on a level
app.get("/level/highscores", verify_login((req, res, user) => {
	const { id, field } = req.query;

	// check field to be safe for use in query
	if (["bestTime", "bestDeaths"].includes(field)) {
		db.query( // select usernames and highscores and select users rank and highscore
			`SELECT username, ${field} AS score FROM highscores
			LEFT JOIN users ON highscores.userId = users.id
			WHERE levelId = :levelId ORDER BY ${field} ASC LIMIT 10;
			SELECT * FROM
			(SELECT userId, 'You' AS username, ${field} AS score, ROW_NUMBER() OVER (ORDER BY ${field} ASC) - 1 AS i
			FROM highscores WHERE levelId = :levelId) AS highscores WHERE userId = :userId`,
			{ userId: user?.id, levelId: id }, handle_rows(
				rows => res.json({ global: rows[0], user: rows[1][0] }),
				internal_error(res)
			)
		);
	} else res.sendStatus(400); // column not recognized
}));

// handle upload request and redirect back on error or to newly added level on success
app.post("/upload/level", upload.single("data"), verify_login((req, res, user) => {
	const { name, description } = req.body;
	const { path, filename } = req.file;

	// not logged in
	if (!user) {
		// remove file and redirect back on error
		fs.unlinkSync(path);
		set_message(res, { error: "Login to upload level" }).status(401).redirect("back");
	}
	// empty or too long
	else if (!(name.length > 0 && name.length <= 20 && description.length <= 8000)) {
		fs.unlinkSync(path);
		set_message(res, { error: "Invalid name or description" }).status(400).redirect("back");
	}
	// invalid level
	else if (!validate(fs.readFileSync(path))) {
		fs.unlinkSync(path);
		set_message(res, { error: "Invalid or incomplete level" }).status(400).redirect("back");
	}
	// all good
	else {
		db.query( // insert level and select its id
			`INSERT INTO levels (creatorId, name, description, filename) VALUES (:userId, :name, :description, :filename);
			SELECT LAST_INSERT_ID() AS id`,
			{ userId: user.id, name: name, description: description, filename: filename }, (err, result) => {
				if (!err) res.redirect("/level?id=" + result[1][0].id); // redirect to level that was just uploaded
				else internal_error(res)(err);
			}
		);
	}
}));

// post comment and reload page to make it get new comment(s)
app.post("/upload/comment", verify_login((req, res, user) => {
	const { content } = req.body;
	const { id } = req.query;

	if (!user) res.sendStatus(401); // not logged in
	else if (!(content.length > 0 && content.length <= 8000)) res.sendStatus(400); // empty or too long

	else db.query("INSERT INTO comments (levelId, userId, content) VALUES (:levelId, :userId, :content)",
		{ userId: user.id, levelId: id, content: content },
		err => {
			if (!err) res.redirect("back");
			else internal_error(res)(err);
		}
	);
}));

// update users rating of level and respond with new total rating of level
app.post("/upload/rating", verify_login((req, res, user) => {
	const { score } = req.body;
	const { id } = req.query;

	if (!user) res.sendStatus(401); // not logged in
	else if (!(-1 <= score && score <= 1)) res.sendStatus(400); // score out of bounds

	// insert or update rating
	else db.query("INSERT INTO ratings (userId, levelId, score) VALUES (:userId, :levelId, :score) ON DUPLICATE KEY UPDATE score = :score",
		{ userId: user.id, levelId: id, score: score },
		err => {
			if (!err) get_rating(id, rating => res.json({ rating: rating })); // respond with new rating
			else internal_error(res)(err);
		}
	);
}));

// upload attempt of level and respond with previous best
app.post("/upload/attempt", verify_login((req, res, user) => {
	const { id } = req.query;
	const { time, deaths } = req.body;

	if (!user) res.sendStatus(401); // not logged in

	// select previous highscore
	else db.query("SELECT attempts, bestTime, bestDeaths FROM highscores WHERE levelId = :levelId AND userId = :userId",
		{ userId: user.id, levelId: id }, handle_value(
			// previous attempt found
			val => db.query( // update existing highscore and public status
				`UPDATE highscores SET attempts = :attempts, bestTime = :bestTime, bestDeaths = :bestDeaths WHERE levelId = :levelId AND userId = :userId;
				UPDATE levels SET public = TRUE WHERE levels.id = :levelId`, // anyone who beats the level makes it public
				{ userId: user.id, levelId: id, attempts: val.attempts + 1, bestTime: Math.min(val.bestTime, time), bestDeaths: Math.min(val.bestDeaths, deaths) },
				err => {
					// respond with previous highscore
					if (!err) res.json({ time: val.bestTime, deaths: val.bestDeaths });
					else internal_error(res)(err);
				}
			),
			// no previous attempt in database
			() => db.query( // insert new highscore and update public stat
				`INSERT INTO highscores (levelId, userId, attempts, bestTime, bestDeaths) VALUES (:levelId, :userId, :attempts, :bestTime, :bestDeaths);
				UPDATE levels SET public = TRUE WHERE levels.id = :levelId`, // anyone who beats the level makes it public
				{ userId: user.id, levelId: id, attempts: 1, bestTime: time, bestDeaths: deaths },
				err => {
					// no previous highscore exists
					if (!err) res.json(null);
					else internal_error(res)(err);
				}
			),
			internal_error(res)
		)
	);
}));

// update following status and respond with new total follower amount
app.post("/upload/follow", verify_login((req, res, user) => {
	const { id } = req.query;
	const { status } = req.body;

	if (!user) res.sendStatus(401); // not logged in
	else if (user.id === id) res.sendStatus(400); // can't follow yourself

	// follow user
	else if (status) db.query("INSERT IGNORE INTO follows (followerId, creatorId) VALUES (:userId, :targetId)",
		{ userId: user.id, targetId: id }, err => {
			// respond with new follower count
			if (!err) get_followers(id, followers => res.json({ followers: followers }));
			else internal_error(res)(err);
		}
	);
	// unfollow user
	else db.query("DELETE FROM follows WHERE followerId = :userId AND creatorId = :targetId",
		{ userId: user.id, targetId: id }, err => {
			// respond with new follower count
			if (!err) get_followers(id, followers => res.json({ followers: followers }));
			else internal_error(res)(err);
		}
	);
}));

// update admin status of user
app.post("/upload/admin", verify_login((req, res, user) => {
	const { id } = req.query;
	const { status } = req.body;

	if (!user) res.sendStatus(401); // not logged in
	else if (!user.admin) res.sendStatus(403); // only admins can promote to admin
	// update admin status
	else db.query("UPDATE users SET admin = :status WHERE id = :userId", { userId: id, status: Boolean(status) }, err => {
		if (!err) res.sendStatus(200);
		else internal_error(res)(err);
	});
}));

// authorize user login
app.post("/auth/login", (req, res) => {
	const { username, password } = req.body;

	// select user matching username
	db.query("SELECT id, username, password FROM users WHERE username = :username", { username: username }, handle_value(
		// check if password is correct
		user => bcrypt.compare(password, user.password, (err, correct) => {
			if (correct) login(res, user.id, login_time);
			// password incorrect
			else set_message(res, { error: "Incorrect username or password" }).status(401).redirect("back");
		}),
		// user not found
		() => set_message(res, { error: "Incorrect username or password" }).status(401).redirect("back"),
		internal_error(res)
	));
});

// create new user and make them logged in
app.post("/auth/signup", (req, res) => {
	const { username, password, confirm_password } = req.body;

	// check username length and password complexity
	if (!(username.length > 0 && username.length <= 20 && password.match(password_check) && password === confirm_password))
		set_message(res, { error: "Invalid username or password" }).status(400).redirect("back");

	// check if username is taken
	else db.query("SELECT 1 AS c FROM users WHERE username = :username", { username: username }, handle_value(
		val => set_message(res, { error: "Username already taken" }).status(409).redirect("back"),
		() => bcrypt.hash(password, 8, (err, hash) => {
			// insert new user and select its id
			db.query("INSERT INTO users (username, password) VALUES (:username, :password); SELECT LAST_INSERT_ID() AS id",
				{ username: username, password: hash }, (err, result) => login(res, result[1][0].id, login_time) // log them in
			);
		}),
		internal_error(res)
	));
});

// delete a user and all their levels, comments, etc.
app.post("/delete/user", verify_login((req, res, user) => {
	const { id } = req.query;
	if (!user) res.sendStatus(401); // not logged in
	else if (!user.admin && user.id !== +id) res.sendStatus(403); // not allowed to delete this user
	else db.query("DELETE FROM users WHERE id = :userId", { userId: id }, err => {
		if (!err) res.sendStatus(200);
		else internal_error(res)(err);
	});
}));

// delete a level and all comments, highscores, etc.
app.post("/delete/level", verify_login((req, res, user) => {
	const { id } = req.query;

	if (!user) res.sendStatus(401); // not logged in
	else db.query("SELECT creatorId, filename FROM levels WHERE id = :levelId", { levelId: id }, handle_value(
		val => {
			if (!user.admin && user.id !== val.creatorId) res.sendStatus(403); // not allowed to delete this level
			else db.query("DELETE FROM levels WHERE id = :levelId", { levelId: id }, err => {
				if (!err) {
					fs.unlinkSync(upload_path + val.filename);
					res.sendStatus(200);
				} else internal_error(res)(err);
			});
		},
		() => res.sendStatus(404), // level not in database
		internal_error(res)
	));
}));

// delete a comment
app.post("/delete/comment", verify_login((req, res, user) => {
	const { id } = req.query;

	if (!user) res.sendStatus(401); // not logged in
	else db.query("SELECT userId FROM comments WHERE id = :commentId", { commentId: id }, handle_value(
		val => {
			if (!user.admin && user.id !== val.userId) res.sendStatus(403); // not allowed to delete this comment
			else db.query("DELETE FROM comments WHERE id = :commentId:", { commentId: id }, err => {
				if (!err) res.sendStatus(200);
				else internal_error(res)(err);
			});
		},
		() => res.sendStatus(404), // comment not in database
		internal_error(res)
	));
}));

// start server
app.listen();
