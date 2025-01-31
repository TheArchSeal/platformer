class TileTool extends Tool {
    constructor(name, src, src_w, src_h, tile_size, x, y, extendable_x, extendable_y, collide_top, collide_bottom, collide_left, collide_right, deadly, padding) {
        super(name, "tiles", TileObj);
        this.src = src;
        this.src_w = src_w;
        this.src_h = src_h;
        this.tile_size = tile_size;
        this.x = x;
        this.y = y;
        this.extendable_x = extendable_x;
        this.extendable_y = extendable_y;
        this.collide_top = collide_top;
        this.collide_bottom = collide_bottom;
        this.collide_left = collide_left;
        this.collide_right = collide_right;
        this.deadly = deadly;
        this.padding = padding;
    }

    icon(size) {
        const img = document.createElement("img");
        img.src = "/level/play/" + this.src;
        img.alt = this.name;

        img.width = this.src_w * size / (this.tile_size * 3);
        img.height = this.src_h * size / (this.tile_size * 3);
        img.style.marginLeft = `${-this.x * size / 3}px`;
        img.style.marginTop = `${-this.y * size / 3}px`;

        const div = document.createElement("div");
        div.style.width = `${this.extendable_x ? size : size / 3}px`;
        div.style.height = `${this.extendable_y ? size : size / 3}px`;
        div.style.overflow = "hidden";

        div.appendChild(img);
        return div;
    }

    sub_tile(x, y, w, h, r) {
        const img = document.createElement("img");
        img.src = "/level/play/" + this.src;
        img.alt = this.name;

        const sin = (r % 2) * (r - 2);
        const cos = (r % 2 - 1) * (r - 1);
        const rotate_x = (x, y) => cos * x - sin * y;
        const rotate_y = (x, y) => sin * x + cos * y;

        if (r === 2) x = w - x - 1;
        if (r === 1) y = h - y - 1;

        const extendable_x = r % 2 === 0 ? this.extendable_x : this.extendable_y;
        const extendable_y = r % 2 === 1 ? this.extendable_x : this.extendable_y;
        const offset_x = !extendable_x || x === 0 ? 0 : x + 1 === w ? 2 : 1;
        const offset_y = !extendable_y || y === 0 ? 0 : y + 1 === h ? 2 : 1;

        const width = this.src_w / this.tile_size
        const height = this.src_h / this.tile_size
        const marginLeft = rotate_x(this.x + offset_x, this.y + offset_x);
        const marginTop = rotate_y(this.x + offset_y, this.y + offset_y);

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

    sub_tile(x, y, w, h) { return this.tool.sub_tile(x, y, w, h, this.r); }

    hide(x, y) {
        this.resize(1, 1);
        super.hide(x, y);
    }

    place(x, y) {
        super.place(x, y);
        this.corner_x = x;
        this.corner_y = y;
    }

    drag(x, y) {
        const new_x = Math.min(x, this.corner_x);
        const new_y = Math.min(y, this.corner_y);
        const new_w = Math.abs(x - this.corner_x) + 1;
        const new_h = Math.abs(y - this.corner_y) + 1;
        this.move(new_x, new_y);
        this.resize(new_w, new_h);
    }

    rotate() {
        this.r = (this.r + 1) % 4;
        this.resize(this.w, this.h);
    }
}
