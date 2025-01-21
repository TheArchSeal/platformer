"use strict";

const sort_select = document.getElementById("sort");
const order_select = document.getElementById("order");

function update_order_visibility() {
	if (sort_select.value === "default")
		order_select.classList.add("hidden");
	else order_select.classList.remove("hidden");
}

// recommended sorting can't be ascending
sort_select.addEventListener("change", update_order_visibility);
update_order_visibility();

const html = document.documentElement;
const level_container = document.querySelector(".level-container");
const buffer = 10; // how many extra overflowing levels to get at once
const element_height = 50; // approximate height of one element in pixels
let end = 0; // first index that has not been retrieved
let got_all = false; // wether all levels have been retrieved
let prev_top = 0; // previous scrollTop of page

// field elements to include in feed get request
const field_elements = ["name", "levelId", "creator", "creatorId", "sort", "order"].map(field => document.getElementById(field));

// create table row from sql row
function create_level_element(level) {
	// create all elements necessary
	let tr = document.createElement("tr");
	let name = document.createElement("td");
	let creator = document.createElement("td");
	let rating = document.createElement("td");

	// add classes to elements
	tr.classList.add("level");
	name.classList.add("name");
	creator.classList.add("creator");
	rating.classList.add("rating");

	// add content to elements
	name.innerText = level.name;
	creator.innerText = level.creator;
	rating.innerText = level.score;
	tr.append(name, creator, rating);

	// redirect to level on click
	tr.onclick = () => window.location = "/level?id=" + level.id;

	return tr;
}

// get and append new levels to feed
function add_feed(len) {
	// create query options from the defined filtering and sorting values
	const field_query = field_elements.filter(e => e.value && !e.classList.contains("hidden")).map(e => `&${e.name}=${e.value}`).join("");

	fetch("/feed?start=" + end + "&len=" + len + field_query)
		.then(res => res.json()).then(json => {
			level_container.append(...json.map(create_level_element));
			end += len; // after getting new values, end must be updated
			if (json.length < len) // if too few rows were received, no more can exist
				got_all = true;
		});
}

// get new elements when scrolling
document.addEventListener("scroll", () => {
	// get elements if not all are gotten, user scrolled down and the buffer is empty
	if (!got_all && prev_top < html.scrollTop && html.scrollHeight - html.scrollTop - html.clientHeight <= element_height)
		add_feed(buffer);

	// update scrollTop value
	prev_top = html.scrollTop;
});

// get levels from new search params
function search() {
	level_container.replaceChildren(); // remove old elements
	end = 0; // no elements have been gotten yet
	// get new elements to cover screen plus a buffer
	add_feed(Math.ceil((html.scrollTop + html.clientHeight - level_container.offsetTop) / element_height) + buffer);
	return false; // stop regular form submission
}


// search onsubmit, onchange and onload
document.querySelector(".search-form").onsubmit = search;
sort_select.addEventListener("change", search);
order_select.addEventListener("change", search);
search();
