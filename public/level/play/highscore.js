"use strict";

class Highscore {
	constructor(time, deaths) {
		this.time = time; // time taken to beat the game (milliseconds)
		this.deaths = deaths; // amount of deaths during game
	}

	// returns time formatted as m:ss.mmm
	formatted_time() {
		// separate different time units
		let minutes = Math.floor(this.time / 1000 / 60);
		let seconds = Math.floor(this.time / 1000) % 60;
		let milliseconds = Math.floor(this.time) % 1000;

		// pad seconds and milliseconds to always use same number of digits
		if (seconds < 10) { seconds = '0' + seconds }
		if (milliseconds < 10) { milliseconds = '0' + milliseconds }
		if (milliseconds < 100) { milliseconds = '0' + milliseconds }
		return `${minutes}:${seconds}.${milliseconds}`;
	}

	// returns number of deaths
	formatted_deaths() {
		return String(this.deaths);
	}
}
