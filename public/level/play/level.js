"use strict";

class Level {
	static death_screen_speed = 2; // one over the duration of the death screen (opacity/second)
	static death_screen_color = "#d82d33"; // hex color of death screen

	constructor(template) {
		this.w = template.w; // width of level (tiles)
		this.h = template.h; // height of level (tiles)
		// id of level to transition to after going off screen, null for death
		this.level_top = template.level_top;
		this.level_bottom = template.level_bottom;
		this.level_left = template.level_left;
		this.level_right = template.level_right;

		this.scale_factor = 0; // scale of level on canvas (pixels / tiles)

		this.player_template = template.player; // default player state
		this.player = new Player(this.player_template); // player object
		// lists of stuff in level
		this.items = template.items.map(t => new Item(t));
		this.goals = template.goals.map(t => new Goal(t));
		this.objects = template.objects.map(t => new Obj(t));
		this.background = new Background(template.background, template.w, template.h);

		this.death_screen_alpha = 0; // current opacity of death screen
		this.dead = false; // whether player is dead;
	}

	// schedules player death, returns wether player has respawned since last call
	handle_death() {
		if (this.dead) return false;
		this.dead = true;
		return true;
	}

	// rescale canvas to match tile size
	scale(c, w, h) {
		// scale to limiting dimension if different aspect ratio to screen
		this.scale_factor = Math.min(w / this.w, h / this.h);
		c.reset();
		c.translate((w - this.w * this.scale_factor) / 2, (h - this.h * this.scale_factor) / 2)
		c.scale(this.scale_factor, this.scale_factor);
	}

	// updates everything in level
	update(dt) {
		// update death screen
		this.death_screen_alpha -= Level.death_screen_speed * dt;
		if (this.death_screen_alpha < 0)
			this.death_screen_alpha = 0;

		// update everything
		this.items.forEach(i => i.update(dt));
		this.goals.forEach(g => g.update(dt));
		this.player.update(dt, this.objects, this.items, this.goals);

		// handle player going off screen
		if (this.player.bottom() < 0) {
			if (this.level_top === null)
				game.handle_death();
			else game.change_level(this.level_top);
		}
		if (this.player.top() > this.h) {
			if (this.level_bottom === null)
				game.handle_death();
			else game.change_level(this.level_bottom);
		}
		if (this.player.right() < 0) {
			if (this.level_left === null)
				game.handle_death();
			else game.change_level(this.level_left);
		}
		if (this.player.right() > this.w) {
			if (this.level_right === null)
				game.handle_death();
			else game.change_level(this.level_right);
		}
	}

	// draw everything in level
	draw(c) {
		// draw everything
		this.background.draw(c);
		this.objects.forEach(o => o.draw(c));
		this.items.forEach(i => i.draw(c));
		this.goals.forEach(g => g.draw(c));
		this.player.draw(c);

		// draw death screen
		c.globalAlpha = this.death_screen_alpha;
		c.fillStyle = Level.death_screen_color;
		c.fillRect(0, 0, this.w, this.h);
		c.globalAlpha = 1;

		// clear everything drawn off screen
		c.clearRect(0, 0, -this.w * this.scale_factor, this.h)
		c.clearRect(this.w, 0, this.w * this.scale_factor, this.h)
		c.clearRect(0, 0, this.w, -this.h * this.scale_factor)
		c.clearRect(0, this.h, this.w, this.h * this.scale_factor)

		// only kill player after drawing frame where they died
		if (this.dead) {
			this.dead = false;
			this.death_screen_alpha = 1; // start death screen
			this.player = new Player(this.player_template, game.sprites); // reset player
			this.items.forEach(i => i.reset()); // reset items
		}
	}
};
