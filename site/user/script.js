"use strict";

// change following status and update elements accordingly
function update_following(status) {
	// send request to server
	fetch("/upload/follow" + window.location.search, {
		method: "post",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ status: status })
	})
		.then(res => res.json())
		.then(json => {
			// update follower amount
			document.querySelector(".follower-amount").innerText = json.followers;
			// update following status
			document.querySelector(".followers").setAttribute("data-is-following", status);
		});
}

// clear jwt cookie and redirect to home
function logout() {
	document.cookie = "jwt=;Max-Age=0;SameSite=Strict;path=/";
	window.location.replace("/");
}

// delete viewed user
function remove() {
	// confirm that they want to delete them
	if (window.confirm("Are you sure you want to delete user " + document.querySelector(".name").innerText + "?"))
		fetch("/delete/user" + window.location.search, { method: "post" })
			.then(res => window.location.replace("/")); // redirect to home since user they are viewing no longer exists
}

// change viewed users admin status
function update_admin(status) {
	fetch("/upload/admin" + window.location.search, {
		method: "post",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ status: status })
	}).then(res => window.location.reload()); // reload page to see changes
}