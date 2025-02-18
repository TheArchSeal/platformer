"use strict";

class TileTool extends Tool {
    constructor(name, src, tile_size, x, y, extendable_x, extendable_y, draggable_x, draggable_y, collide_top, collide_bottom, collide_left, collide_right, deadly, padding) {
        super(name, "tiles", TileObj);
        this.src = src; // url to image containing the tile sheet
        this.tile_size = tile_size; // width and height of tile in image
        this.x = x; // x offset in tiles
        this.y = y; // y offset in tiles
        this.extendable_x = extendable_x; // wether it should use neighboring cells when tiling horizontally
        this.extendable_y = extendable_y; // wether it should use neighboring cells when tiling vertically
        this.draggable_x = draggable_x; // wether it can be tiled horizontally
        this.draggable_y = draggable_y; // wether it can be tiled vertically
        this.collide_top = collide_top; // check collision moving down
        this.collide_bottom = collide_bottom; // check collision moving up
        this.collide_left = collide_left; // check collision moving right
        this.collide_right = collide_right; // check collision moving left
        this.deadly = deadly; // wether touching is deadly
        this.padding = padding; // space between visual and hit box
    }

    icon(size) {
        const img = document.createElement("img");
        img.src = this.src;
        img.alt = this.name;

        img.style.scale = size / (this.tile_size * 3);
        // offset position
        img.style.translate = `${-this.x * size / 3}px ${-this.y * size / 3}px`;
        img.style.transformOrigin = "0 0"; // scale around top-left

        // crop to size
        const div = document.createElement("div");
        div.style.width = `${this.extendable_x ? size : size / 3}px`;
        div.style.height = `${this.extendable_y ? size : size / 3}px`;
        div.style.overflow = "hidden";

        div.appendChild(img);
        return div;
    }

    sub_tile(x, y, w, h, r) {
        const img = document.createElement("img");
        const set_size = () => {
            // rotation matrix
            const sin = (r % 2) * (2 - r);
            const cos = (r % 2 - 1) * (r - 1);
            const rotate_x = (x, y) => cos * x - sin * y;
            const rotate_y = (x, y) => sin * x + cos * y;
            const rotate = (x, y) => [rotate_x(x, y), rotate_y(x, y)];

            // 0 index instead of 1
            w--;
            h--;
            // keep x and y on same side of w and h after rotating
            if (rotate_x(1, 1) < 0) x = w - x;
            if (rotate_y(1, 1) < 0) y = h - y;
            // rotate
            [x, y] = rotate(x, y);
            [w, h] = rotate(w, h);

            // what neighboring tile to use
            const offset_x = !this.extendable_x || x === 0 ? 0 : x === w ? 2 : 1;
            const offset_y = !this.extendable_y || y === 0 ? 0 : y === h ? 2 : 1;
            const width = img.naturalWidth / this.tile_size
            const height = img.naturalHeight / this.tile_size
            const [marginLeft, marginTop] = rotate(this.x + offset_x, this.y + offset_y);

            img.style.transformOrigin = `${50 / width}% ${50 / height}%`;
            img.style.rotate = `${90 * r}deg`
            img.style.width = `${100 * width}%`;
            img.style.height = `${100 * height}%`;
            img.style.marginLeft = `${-100 * marginLeft}%`;
            img.style.marginTop = `${-100 * marginTop}%`;
        }

        img.src = this.src;
        img.alt = this.name;

        // naturalWidth and naturalHeight available only after loading
        if (img.complete) set_size();
        else img.onload = set_size;

        // crop to size
        const div = document.createElement("div");
        div.style.width = "100%";
        div.style.height = "100%";
        div.style.overflow = "hidden";

        div.appendChild(img);
        return div;
    }
}

class TileObj extends Obj {
    constructor(tool) {
        super(tool, 1, 1);
        this.r = 0; // rotation index
        this.corner_x = null; // initial x coordinate while dragging
        this.corner_y = null; // initial y coordinate while dragging
    }

    clone() {
        const obj = new TileObj(this.tool);
        obj.r = this.r; // keep rotation after placing
        return obj;
    }

    sub_tile(x, y, w, h) { return this.tool.sub_tile(x, y, w, h, this.r); }

    ghost(x, y) {
        // reset dragging corner
        this.corner_x = null;
        this.corner_y = null;
        this.resize(1, 1); // show only 1x1 in preview
        super.ghost(x, y);
    }

    place(x, y) {
        super.place(x, y);
        this.corner_x = x;
        this.corner_y = y;
    }

    drag(x, y) {
        // start dragging if not already
        if (this.corner_x === null)
            this.corner_x = x;
        if (this.corner_y === null)
            this.corner_y = y;

        // check allowed dragging directions after rotation
        let [draggable_x, draggable_y] = [this.tool.draggable_x, this.tool.draggable_y];
        if (this.r % 2 === 1) [draggable_x, draggable_y] = [draggable_y, draggable_x]
        // only drag in allowed directions
        if (!draggable_x) x = this.corner_x;
        if (!draggable_y) y = this.corner_y;

        // allow dragging in negative directions
        const new_x = Math.min(x, this.corner_x);
        const new_y = Math.min(y, this.corner_y);
        const new_w = Math.abs(x - this.corner_x) + 1;
        const new_h = Math.abs(y - this.corner_y) + 1;
        this.move(new_x, new_y);
        this.resize(new_w, new_h);
    }

    rotate(x, y) {
        this.r = (this.r + 1) % 4; // reset after full rotation
        if (x !== null && y !== null)
            this.drag(x, y); // recalculate allowed dragging directions
    }
}
