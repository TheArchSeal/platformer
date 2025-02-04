"use strict";

class SpriteTool extends Tool {
    constructor(name, type, data, src, x, y, w, h, frame_width, frame_count, frame_offset, spf, repeat_cooldown, tile_w, tile_h) {
        super(name, "sprites", SpriteObj);
        this.type = type;
        this.data = data;
        this.src = src;
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
        img.src = this.src;
        img.alt = this.name;

        const scale = size / Math.max(this.w, this.h);
        img.style.scale = scale;
        img.style.translate = `${-(this.x + this.frame_width * this.frame_offset) * scale}px ${-this.y * scale}px`;
        img.style.transformOrigin = "0 0";

        const div = document.createElement("div");
        div.style.width = `${this.w * scale}px`;
        div.style.height = `${this.h * scale}px`;
        div.style.overflow = "hidden";

        div.appendChild(img);
        return div;
    }

    sub_tile(x, y, w, h) {
        const img = document.createElement("img");
        img.onload = () => {
            const width = img.naturalWidth * w / this.w;
            const height = img.naturalHeight * h / this.h;
            const marginLeft = (this.x + this.frame_width * this.frame_offset) / this.w + x;
            const marginTop = this.y / this.h + y;

            img.style.width = `${100 * width}%`;
            img.style.height = `${100 * height}%`;
            img.style.marginLeft = `${-100 * marginLeft}%`;
            img.style.marginTop = `${-100 * marginTop}%`;
        };

        img.src = this.src;
        img.alt = this.name;

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
