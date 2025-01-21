"use strict";

// 8-64 characters including uppercase, lowercase, number and special
const password_check = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,64}$/;

// change what error is displayed
function set_error(err) {
	document.querySelectorAll(".error").forEach(e => e.remove());
	const error = document.createElement("h4");
	error.classList.add("error");
	error.innerText = err;
	document.querySelector("main").appendChild(error);
}

// validate form input
document.querySelector("form").onsubmit = e => {
	// get relevant values
	const password = e.target["password"].value;
	const conform_password = e.target["confirm_password"].value;

	if (!password.match(password_check)) { // check password complexity
		set_error("Password must be 8 to 64 characters containing uppercase, lowercase, number and special")
		return false; // stop form submission
	}

	if (password !== conform_password) { // check password matching
		set_error("Passwords do not match");
		return false; // stop form submission
	}

	return true; // all good
};
