"use strict";

class Tile {
	constructor(template, w, h) {
		this.img = new Image(); // final image to use

		// get image with tiles to use
		const tile_sheet = new Image();
		tile_sheet.src = template.src;
		tile_sheet.onload = () => {

			// create new canvas and context to draw tiles on
			const canvas = document.createElement("canvas");
			const c = canvas.getContext("2d");
			canvas.width = w * template.tile_size;
			canvas.height = h * template.tile_size;

			// sin and cos values for rotation matrix
			const sin = (template.rotation % 2) * (template.rotation - 2);
			const cos = (template.rotation % 2 - 1) * (template.rotation - 1);

			for (let i = 0; i < w; i++) {
				for (let j = 0; j < h; j++) {

					let dx; // x offset for extendable texture
					if (i === 0) dx = -1; // left edge of image
					else if (i === w - 1) dx = 1; // right edge of image
					else dx = 0; // within image

					let dy; // y offset for extendable texture
					if (j === 0) dy = -1; // top edge of image
					else if (j === h - 1) dy = 1; // bottom edge of image
					else dy = 0; // within  edge of image

					// rotate source texture coordinates and reset if not extendable
					const x = template.extendable_x ? dx * cos - dy * sin : -1;
					const y = template.extendable_y ? dx * sin + dy * cos : -1;

					c.save()
					c.scale(template.tile_size, template.tile_size);

					c.translate(i + 0.5, j + 0.5); // move canvas origin to center of current tile
					c.rotate(template.rotation * Math.PI / 2); // rotate tile around its center
					c.translate(-0.5, -0.5); // move canvas to top left corner of current tile

					// draw tile at current canvas origin
					c.drawImage(
						tile_sheet,
						(template.x + x + 1) * template.tile_size, (template.y + y + 1) * template.tile_size,
						template.tile_size, template.tile_size,
						0, 0, 1, 1
					);
					c.restore(); // revert canvas transformations
				}
			}

			// save canvas as image to avoid tons of draw calls every frame
			this.img.src = canvas.toDataURL();
		};
	}

	// draw the final image at specified position
	draw(c, x, y, w, h) {
		c.drawImage(this.img, x, y, w, h)
	}
};