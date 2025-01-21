"use strict";

class Game {
	constructor(template) {
		this.tiles = template.tiles; // tile templates used
		this.sprites = template.sprites; // sprite templates used
		this.levels = template.levels; // level templates used
		this.level = null; // current level
		this.first_level = template.start; // key of first level

		this.won = false; // whether the game has been won
		this.death_count = 0; // amount of deaths during current game
		this.time_passed = 0; // time passed during current game
	}

	// kill player
	handle_death() {
		if (this.won) return; // don't die when already won

		// only increment death_count if level has reset since last death
		if (this.level.handle_death())
			this.death_count++;
	}

	// displays win screen and saves highscores
	handle_win() {
		// don't win multiple times
		if (this.won) return;
		this.won = true;

		// score of current game
		const current = new Highscore(this.time_passed, this.death_count);

		const display_menu = highscore => {
			// display stats of current and best games
			document.querySelector(".current.time span").textContent = current.formatted_time();
			document.querySelector(".current.deaths span").textContent = current.formatted_deaths();

			if (highscore) { // update highscore if it exists
				document.querySelector(".best.time span").textContent = highscore.formatted_time();
				document.querySelector(".best.deaths span").textContent = highscore.formatted_deaths();


				// update text depending on if player beat their highscore
				if (highscore.time > current.time || highscore.deaths > current.deaths)
					document.querySelector(".best.title").textContent = "Previous Best";
				else document.querySelector(".best.title").textContent = "Highscore";
			}

			// hide highscore if it does not exist
			document.querySelectorAll(".best").forEach(e => {
				if (highscore) e.classList.remove("hidden");
				else e.classList.add("hidden");
			});

			// show the win screen
			document.querySelector(".win-screen").style.visibility = "visible";
		}

		// score of best games
		this.fetch_highscores(current).then(display_menu).catch(err => display_menu(null));
	}

	// transition to level with specified id
	change_level(level_id) {
		if (this.won) return; // don't transition after winning the game
		this.level = new Level(this.levels[level_id]);
		init() // rescale in case new level of different size
	}

	// reset game and transition to first level
	start() {
		this.won = false;
		this.death_count = 0;
		this.time_passed = 0;
		this.level = new Level(this.levels[this.first_level]);
		init()
		document.activeElement.blur(); // deselect restart button
		document.querySelector(".win-screen").style.visibility = "hidden";
	}

	// rescale level to specified size
	scale(c, w, h) {
		this.level.scale(c, w, h);
	}

	// forward one tick of specified length
	update(dt) {
		this.time_passed += dt;
		// level uses seconds
		this.level.update(dt / 1000);
	}

	// draw current level
	draw(c) {
		this.level.draw(c);
	}

	// posts new attempt and returns promise of previous highscore or null
	fetch_highscores(highscore) {
		return fetch("/upload/attempt" + window.location.search, {
			method: "post",
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ time: highscore.time, deaths: highscore.deaths })
		})
			.then(res => res.json())
			.then(json => json ? new Highscore(json.time, json.deaths) : null);
	}
}