"use strict";

class Obj extends Hitbox {
	constructor(template) {
		super(template.x + template.padding, template.y + template.padding, template.w - 2 * template.padding, template.h - 2 * template.padding);
		// tile of object
		this.tile = new Tile(game.tiles[template.tile], template.w, template.h);

		// whether player can collide with object from respective side
		this.collide_top = template.collide_top;
		this.collide_bottom = template.collide_bottom;
		this.collide_left = template.collide_left;
		this.collide_right = template.collide_right;

		this.deadly = template.deadly; // wether contact kills player
		this.padding = template.padding; // inner distance between the visible and logical hitbox (tiles)
	}

	// draw at objects position
	draw(c) {
		this.tile.draw(c, this.x - this.padding, this.y - this.padding, this.w + 2 * this.padding, this.h + 2 * this.padding);
	}
};
