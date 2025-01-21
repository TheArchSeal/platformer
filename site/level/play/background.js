"use strict";

class Background {
	constructor(template, w, h) {
		this.img = new Image(); // final image to use as background
		this.w = w; // width of level (tiles)
		this.h = h; // height of level (tiles)

		// create new canvas and context to draw tiles on
		const canvas = document.createElement("canvas");
		const c = canvas.getContext("2d");
		canvas.width = w * template.tile_size;
		canvas.height = h * template.tile_size;

		// fill in default background color
		c.fillStyle = template.color;
		c.fillRect(0, 0, canvas.width, canvas.height);

		// get image with tiles to use
		const tile_sheet = new Image();
		tile_sheet.src = template.src;
		tile_sheet.onload = () => {

			template.tiles.forEach(tile => {
				// draw each tile at its specified location
				c.drawImage(tile_sheet,
					tile.source_x * template.tile_size, tile.source_y * template.tile_size,
					template.tile_size, template.tile_size,
					tile.dest_x * template.tile_size, tile.dest_y * template.tile_size,
					template.tile_size, template.tile_size
				);
			});

			// save canvas as image to avoid tons of draw calls every frame
			this.img.src = canvas.toDataURL();
		};
	}

	draw(c) {
		c.drawImage(this.img, 0, 0, this.w, this.h);
	}
};
