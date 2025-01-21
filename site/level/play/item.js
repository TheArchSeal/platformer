"use strict";

class Item extends Hitbox {
	// time between able to be collected (seconds)
	static cooldown = 2;

	constructor(template) {
		super(template.x, template.y, 2, 2)
		// sprite of item
		this.sprite = new Sprite(game.sprites[template.sprite]);
		this.timer = 0; // time left until item can be collected (seconds)
		this.restore_count = template.restore_count; // amount of dashed to restore when collected
	}

	// collects item if able and returns wether it was
	collect(p) {
		if (this.timer === 0) { // able to be collected
			this.timer = Item.cooldown; // set cooldown
			return true;
		}
		return false
	}

	// reset timer
	reset() {
		this.timer = 0;
	}

	// update timer and animation
	update(dt) {
		this.timer -= dt;
		if (this.timer < 0)
			this.timer = 0;

		this.sprite.animate(dt);
	}

	// draw if not on cooldown
	draw(c) {
		if (this.timer === 0)
			this.sprite.draw(c, this.x, this.y, this.w, this.h);
	}
}