"use strict";

// uBlock Origin blocks hitbox.js for some reason and when it does nothing works.
try { Hitbox; } catch (e) {
	if (e instanceof ReferenceError) {
		document.body.textContent =
			`It appears a script has failed to load. \
			This is likely to be caused by an adblocker. \
			Please turn it off and refresh the page.`;
	} else throw e;
}

// get canvas and context
const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

// call to rescale game dynamically
const init = () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	game.scale(c, canvas.width, canvas.height)
};

// rescale whenever resized
window.addEventListener("resize", init);

let game = new Game(parse_json(template));
let t0 = performance.now(); // time of last tick
const main = t => {
	const dt = t - t0; // time since last tick (milliseconds)
	t0 = t; // update last tick time

	game.update(dt);
	game.draw(c);

	requestAnimationFrame(main); // call main recursively to act as game loop
}

// start main loop
game.start();
main(t0);
