class TileTool extends Tool {
    constructor(name, src, src_w, src_h, tile_size, x, y, extendable_x, extendable_y, collide_top, collide_bottom, collide_left, collide_right, deadly, padding) {
        super(name, "tiles")
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
        img.width = Math.floor(this.src_w * size / (this.tile_size * 3));
        img.height = Math.floor(this.src_h * size / (this.tile_size * 3));
        img.style.marginLeft = `${-Math.floor(this.x * this.tile_size * size / (this.tile_size * 3))}px`;
        img.style.marginTop = `${-Math.floor(this.y * this.tile_size * size / (this.tile_size * 3))}px`;

        const div = document.createElement("div");
        div.style.width = `${this.extendable_x ? size : Math.floor(size / 3)}px`;
        div.style.height = `${this.extendable_y ? size : Math.floor(size / 3)}px`;
        div.style.overflow = "hidden";

        div.appendChild(img);
        return div;
    }
}
