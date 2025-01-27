"use strict";

// like or remove like from level
function like() {
	if (document.querySelector(".rating").getAttribute("data-user-score") === "1")
		send_rating(0);
	else send_rating(1);
}

// dislike or remove dislike from level
function dislike() {
	if (document.querySelector(".rating").getAttribute("data-user-score") === "-1")
		send_rating(0);
	else send_rating(-1);
}

// update rating and display new total rating
function send_rating(score) {
	fetch("/upload/rating" + window.location.search, {
		method: "post",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ score: score })
	})
		.then(res => res.json())
		.then(json => {
			// change total rating
			document.querySelector(".rating .score").innerText = json.rating;
			// change user rating
			document.querySelector(".rating").setAttribute("data-user-score", score);
		})
}
