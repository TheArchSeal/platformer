const jwt = require("jsonwebtoken");

// export some helper functions after passing in the database
module.exports = db => ({
	// handle errors I'm to lazy to handle properly
	internal_error: res => err => {
		console.error(err);
		res.sendStatus(500);
	},

	// shorthand to handle selecting multiple rows from database easier
	handle_rows: (success, error) => (err, rows) => {
		if (err) error(err);
		else success(rows);
	},

	// shorthand to handle selecting one row from database easier
	handle_value: (success, empty, error) => (err, rows) => {
		if (err) error(err);
		else if (!rows.length) empty();
		else success(rows[0]);
	},

	// set the msg cookie to store simple message between redirects
	set_message: (res, message) => {
		res.cookie("msg", message, { sameSite: true });
		return res;
	},

	// returns and removes msg cookie
	pop_message: (req, res) => {
		if ("msg" in req.cookies) {
			res.clearCookie("msg", { sameSite: true });
			return req.cookies["msg"];
		} else return {};
	},

	// create json web token, set it to jwt cookie and redirect home
	login: (res, id, token_max_age) => {
		const token = jwt.sign({ id: id }, process.env.TOKEN_SECRET, { expiresIn: token_max_age });
		res.cookie("jwt", token, { maxAge: token_max_age * 1000, sameSite: true });
		res.redirect("/");
	},

	// pass to express request handler to get an argument with the logged in user
	verify_login: callback => (req, res) => {
		if (!("jwt" in req.cookies)) return callback(req, res, null); // jwt cookie not set
		jwt.verify(req.cookies["jwt"], process.env.TOKEN_SECRET, (err, user) => {
			if (err) return callback(req, res, null); // jwt cookie invalid/expired
			db.query("SELECT * FROM users WHERE id = :id", { id: user.id }, (err, result) => {
				if (!err && result.length > 0) return callback(req, res, result[0]); // user is logged in
				else return callback(req, res, null); // user not in database
			});
		});
	},

	// get total rating of level
	get_rating: (id, callback) => db.query(
		"SELECT COALESCE(SUM(score),0) AS score FROM ratings WHERE levelId = :levelId",
		{ levelId: id }, (err, result) => {
			if (!err && result.length > 0) callback(result[0].score);
			else return callback(null);
		}
	),

	// get follower amount of user
	get_followers: (id, callback) => db.query(
		"SELECT COUNT(*) AS followers FROM follows WHERE creatorId = :userId",
		{ userId: id }, (err, result) => {
			if (!err && result.length > 0) callback(result[0].followers);
			else return callback(null);
		}
	)
});
