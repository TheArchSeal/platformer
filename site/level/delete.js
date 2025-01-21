"use strict";

// remove viewed level
function remove() {
	// confirm they want to delete it
	if (window.confirm("Are you sure you want to delete level " + document.querySelector(".name").innerText + "?"))
		fetch("/delete/level" + window.location.search, { method: "post" })
			.then(res => window.location.replace("/")); // return to home since viewed level no longer exists
}