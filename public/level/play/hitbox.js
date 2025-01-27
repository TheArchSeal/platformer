"use strict";

class Hitbox {
	constructor(x, y, w, h) {
		// position of hitbox
		this.x = x;
		this.y = y;
		// size of hitbox
		this.w = w;
		this.h = h;
	}

	left() { return this.x; } // returns x coordinate of left side of hitbox
	right() { return this.x + this.w; } // returns x coordinate of right side of hitbox
	top() { return this.y; } // returns y coordinate of top of hitbox
	bottom() { return this.y + this.h; } // returns y coordinate of bottom of hitbox

	set_left(x) { this.x = x; } // sets x coordinate such that left side of hitbox is the specified value
	set_right(x) { this.x = x - this.w; } // sets x coordinate such that right side of hitbox is the specified value
	set_top(y) { this.y = y; } // sets y coordinate such that top of hitbox is the specified value
	set_bottom(y) { this.y = y - this.h; } // sets y coordinate such that bottom of hitbox is the specified value
}
