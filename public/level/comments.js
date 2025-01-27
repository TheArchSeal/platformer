"use strict";

const html = document.documentElement;
const comment_container = document.querySelector(".comment-container");
const buffer = 10; // how many extra overflowing comments to get at once
const element_height = 50; // approximate height of one element in pixels
let end = 0; // first index that has not been retrieved
let got_all = false; // wether all levels have been retrieved
let prev_top = 0; // previous scrollTop of page

// delete specific comment
function delete_comment(id) {
	// confirm they want to delete it
	if (window.confirm("Are you sure you want to delete comment?"))
		fetch("/delete/comment?id=" + id, { method: "post" })
			.then(res => window.location.reload()); // reload to make it take effect
}

// create article from sql row
function create_comment_element(comment) {
	// create all elements necessary
	let article = document.createElement("article");
	let commenter = document.createElement("a");
	let text = document.createElement("p");

	// add class to element
	article.classList.add("comment");

	// add content to elements
	commenter.innerText = comment.username;
	text.innerText = comment.content;
	commenter.href = "/user?id=" + comment.userId; // link to user page of commenter
	article.append(commenter, text);

	// add delete button if deletable
	if (comment.deletable) {
		let del = document.createElement("button");
		del.innerText = "Delete";
		del.classList.add("delete");
		del.onclick = () => delete_comment(comment.id);
		article.appendChild(del);
	}

	return article;
}

// get and append new comments
function add_comments(len) {
	fetch("/level/comments" + window.location.search + "&start=" + end + "&len=" + len)
		.then(res => res.json()).then(json => {
			comment_container.append(...json.map(create_comment_element));
			end += len; // after getting new values, end must be updated
			if (json.length < len) // if too few rows were received, no more can exist
				got_all = true;
		});
}

// get new elements when scrolling
document.addEventListener("scroll", () => {
	// get elements if not all are gotten, user scrolled down and the buffer is empty
	if (!got_all && prev_top < html.scrollTop && html.scrollHeight - html.scrollTop - html.clientHeight <= element_height)
		add_comments(buffer);

	// update scrollTop value
	prev_top = html.scrollTop;
});

// get new elements to cover screen plus a buffer
add_comments(Math.ceil((html.scrollTop + html.clientHeight - comment_container.offsetTop) / element_height) + buffer);
