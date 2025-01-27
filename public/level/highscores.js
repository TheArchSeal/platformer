"use strict";

const highscore_container = document.querySelector(".highscore-container");

// format time in milliseconds as a string
function format_time(time) {
	// separate different time units
	let minutes = Math.floor(time / 1000 / 60);
	let seconds = Math.floor(time / 1000) % 60;
	let milliseconds = Math.floor(time) % 1000;

	// pad seconds and milliseconds to always use same number of digits
	if (seconds < 10) { seconds = '0' + seconds }
	if (milliseconds < 10) { milliseconds = '0' + milliseconds }
	if (milliseconds < 100) { milliseconds = '0' + milliseconds }
	return `${minutes}:${seconds}.${milliseconds}`;
}

// create table row from highscore
function create_highscore_element(is_time) {
	return (highscore, index) => {
		// create all necessary elements
		let tr = document.createElement("tr");
		let rank = document.createElement("td");
		let user = document.createElement("td");
		let score = document.createElement("td");

		// add class to element
		tr.classList.add("highscore");

		// add content to elements
		rank.innerText = index + 1;
		user.innerText = highscore.username;
		score.innerText = is_time ? format_time(highscore.score) : highscore.score;
		tr.append(rank, user, score);

		return tr;
	}
}

// get new scores and replace the old ones
function update_scores(field) {
	const is_time = field === "bestTime"; // wether to format the response as time
	fetch("/level/highscores" + window.location.search + "&field=" + field)
		.then(res => res.json())
		.then(json => {
			// replace all highscores
			highscore_container.replaceChildren(...json.global.map(create_highscore_element(is_time)));
			if (json.user) {
				// add user rank if applicable
				let tr = create_highscore_element(is_time)(json.user, json.user.i)
				tr.classList.add("user-rank");
				highscore_container.append(tr);
			}
			// update what button is visible
			document.querySelector(".highscores").setAttribute("data-field", field);
		});
}

update_scores("bestTime")
