"use strict";

class Goal extends Hitbox {
	constructor(template) {
		super(template.x, template.y, 3, 4)
		// sprite of goal
		this.sprite = new Sprite(game.sprites[template.sprite]);
	}

	// update sprite animation
	update(dt) {
		this.sprite.animate(dt);
	}

	// draw sprite at goal's position
	draw(c) {
		this.sprite.draw(c, this.x, this.y, this.w, this.h);
	}
}