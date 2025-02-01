class SpriteTool extends Tool {
    constructor(name, type, data, src, src_w, src_h, x, y, w, h, frame_width, frame_count, frame_offset, spf, repeat_cooldown, tile_w, tile_h) {
        super(name, "sprites", SpriteObj);
        this.type = type;
        this.data = data;
        this.src = src;
        this.src_w = src_w;
        this.src_h = src_h;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.frame_width = frame_width;
        this.frame_count = frame_count;
        this.frame_offset = frame_offset;
        this.spf = spf;
        this.repeat_cooldown = repeat_cooldown;
        this.tile_w = tile_w;
        this.tile_h = tile_h;
    }

    icon(size) {
        const img = document.createElement("img");
        img.src = "/level/play/" + this.src;
        img.alt = this.name;

        const scale = size / Math.max(this.w, this.h);
        img.width = this.src_w * scale;
        img.height = this.src_h * scale;
        img.style.marginLeft = `${-(this.x + this.frame_width * this.frame_offset) * scale}px`;
        img.style.marginTop = `${-this.y * scale}px`;

        const div = document.createElement("div");
        div.style.width = `${this.w * scale}px`;
        div.style.height = `${this.h * scale}px`;
        div.style.overflow = "hidden";

        div.appendChild(img);
        return div;
    }

    sub_tile(x, y, w, h) {
        const img = document.createElement("img");
        img.src = "/level/play/" + this.src;
        img.alt = this.name;

        const width = this.src_w * w / this.w;
        const height = this.src_h * h / this.h;
        const marginLeft = (this.x + this.frame_width * this.frame_offset) / this.w + x;
        const marginTop = this.y / this.h + y;

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

class SpriteObj extends Obj {
    constructor(tool) {
        super(tool, tool.tile_w, tool.tile_h);
    }

    clone() { return new SpriteObj(this.tool); }

    sub_tile(x, y, w, h) { return this.tool.sub_tile(x, y, w, h); }

    drag(x, y) { this.move(x, y); }

    rotate(x, y) { }
}
