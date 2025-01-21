"use strict";

class Sprite {
	constructor(template) {
		this.img = new Image();
		this.img.src = template.src

		this.x = template.x; // x offset within frame (pixels)
		this.y = template.y; // y offset within frame (pixels)
		this.w = template.w; // width within frame (pixels)
		this.h = template.h; // height within frame (pixels)

		this.frame_width = template.frame_width; // distance between frames (pixels)
		this.frame_count = template.frame_count // total number of frames to cycle between
		this.frame_offset = template.frame_offset; // amount of frames to skip before first
		this.spf = template.spf; // animation speed, -1 for not animating (seconds/frame)
		this.repeat_cooldown = template.repeat_cooldown; // minimum time between animation cycles, -1 to not reset

		this.index = 0; // current frame index
		this.timer = 0; // time since last frame
		this.cooldown = 0; // time since last frame cycle
		this.on_cooldown = false; // if finished cycle and not started new
	}

	// reset to first frame
	reset() {
		this.index = 0;
		this.timer = 0;
		this.cooldown = 0;
		this.on_cooldown = false;
	}

	// update frame and timers
	animate(dt) {
		// don't automatically animate on -1
		if (this.spf === -1) return;

		// don't automatically reset on -1
		if (this.on_cooldown && this.repeat_cooldown !== -1) {
			this.cooldown += dt; // update cooldown
			if (this.cooldown >= this.repeat_cooldown)
				this.reset()
		}

		// early return if currently on cooldown
		if (this.on_cooldown) return;

		this.timer += dt; // update time since last frame change
		this.index += Math.floor(this.timer / this.spf); // update frame
		this.timer %= this.spf; // new time since last frame change

		// don't exceed last frame, instead go on cooldown
		if (this.index >= this.frame_count) {
			this.index = this.frame_count - 1;
			this.on_cooldown = true;
		}
	}

	// draw sprite at specified coordinated, possibly flipped
	draw(c, x, y, w, h, flip = false) {
		const x_offset = this.x * w / this.w; // x offset to account for image padding (tiles)
		const y_offset = this.y * h / this.h; // y offset to account for image padding (tiles)

		// transform canvas to flip image
		if (flip) {
			c.translate(w, 0)
			c.scale(-1, 1);
			x = -x;
		}
		// draw current frame
		c.drawImage(this.img,
			this.frame_width * (this.index + this.frame_offset), 0, this.frame_width, this.frame_width,
			x - x_offset, y - y_offset, this.frame_width * w / this.w, this.frame_width * h / this.h
		);
		// revert canvas transformation
		if (flip) {
			c.scale(-1, 1);
			c.translate(-w, 0);
		}
	}
};
