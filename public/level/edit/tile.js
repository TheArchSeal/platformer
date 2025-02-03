"use strict";

class TileTool extends Tool {
    constructor(name, src, tile_size, x, y, extendable_x, extendable_y, draggable_x, draggable_y, collide_top, collide_bottom, collide_left, collide_right, deadly, padding) {
        super(name, "tiles", TileObj);
        this.src = src;
        this.tile_size = tile_size;
        this.x = x;
        this.y = y;
        this.extendable_x = extendable_x;
        this.extendable_y = extendable_y;
        this.draggable_x = draggable_x;
        this.draggable_y = draggable_y;
        this.collide_top = collide_top;
        this.collide_bottom = collide_bottom;
        this.collide_left = collide_left;
        this.collide_right = collide_right;
        this.deadly = deadly;
        this.padding = padding;
    }

    icon(size) {
        const img = document.createElement("img");
        img.src = this.src;
        img.alt = this.name;

        img.style.scale = size / (this.tile_size * 3);
        img.style.translate = `${-this.x * size / 3}px ${-this.y * size / 3}px`;
        img.style.transformOrigin = "0 0";

        const div = document.createElement("div");
        div.style.width = `${this.extendable_x ? size : size / 3}px`;
        div.style.height = `${this.extendable_y ? size : size / 3}px`;
        div.style.overflow = "hidden";

        div.appendChild(img);
        return div;
    }

    sub_tile(x, y, w, h, r) {
        const img = document.createElement("img");
        img.src = this.src;
        img.alt = this.name;

        const sin = (r % 2) * (r - 2);
        const cos = (r % 2 - 1) * (r - 1);
        const rotate_x = (x, y) => cos * x - sin * y;
        const rotate_y = (x, y) => sin * x + cos * y;
        const rotate = (x, y) => [rotate_x(x, y), rotate_y(x, y)];

        w--;
        h--;
        if (rotate_x(1, 1) < 0) x = w - x;
        if (rotate_y(1, 1) < 0) y = h - y;
        [x, y] = rotate(x, y);
        [w, h] = rotate(w, h);

        const offset_x = !this.extendable_x || x === 0 ? 0 : x === w ? 2 : 1;
        const offset_y = !this.extendable_y || y === 0 ? 0 : y === h ? 2 : 1;
        const width = img.naturalWidth / this.tile_size
        const height = img.naturalHeight / this.tile_size
        const [marginLeft, marginTop] = rotate(this.x + offset_x, this.y + offset_y);

        img.style.transformOrigin = `${50 / width}% ${50 / height}%`;
        img.style.rotate = `${-90 * r}deg`
        img.style.width = `${100 * width}%`;
        img.style.height = `${100 * height}%`;
        img.style.marginLeft = `${-100 * marginLeft}%`;
        img.style.marginTop = `${-100 * marginTop}%`;

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
        this.r = 0;
        this.corner_x = null;
        this.corner_y = null;
    }

    clone() {
        const obj = new TileObj(this.tool);
        obj.r = this.r;
        return obj;
    }

    sub_tile(x, y, w, h) { return this.tool.sub_tile(x, y, w, h, this.r); }

    ghost(x, y) {
        this.corner_x = null;
        this.corner_y = null;
        this.resize(1, 1);
        super.ghost(x, y);
    }

    place(x, y) {
        super.place(x, y);
        this.corner_x = x;
        this.corner_y = y;
    }

    drag(x, y) {
        if (this.corner_x === null)
            this.corner_x = x;
        if (this.corner_y === null)
            this.corner_y = y;

        let [draggable_x, draggable_y] = [this.tool.draggable_x, this.tool.draggable_y];
        if (this.r % 2 === 1) [draggable_x, draggable_y] = [draggable_y, draggable_x]
        if (!draggable_x) x = this.corner_x;
        if (!draggable_y) y = this.corner_y;

        const new_x = Math.min(x, this.corner_x);
        const new_y = Math.min(y, this.corner_y);
        const new_w = Math.abs(x - this.corner_x) + 1;
        const new_h = Math.abs(y - this.corner_y) + 1;
        this.move(new_x, new_y);
        this.resize(new_w, new_h);
    }

    rotate(x, y) {
        this.r = (this.r + 1) % 4;
        if (x !== null && y !== null)
            this.drag(x, y);
    }
}
