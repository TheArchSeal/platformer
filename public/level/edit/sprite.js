"use strict";

class SpriteTool extends Tool {
    constructor(name, type, data, src, x, y, w, h, frame_width, frame_count, frame_offset, spf, repeat_cooldown, tile_w, tile_h) {
        super(name, "sprites", SpriteObj);
        this.type = type; // "item" | "goal" | "player"
        this.data = data; // object containing additional data irrelevant to rendering
        this.src = src; // url to image containing the animation
        this.x = x; // x offset within frame in image
        this.y = y; // y offset within frame in image
        this.w = w; // with of sprite in image
        this.h = h; // height of sprite in image
        this.frame_width = frame_width; // x offset between frames
        this.frame_count = frame_count; // number of frames
        this.frame_offset = frame_offset; // first frame in animation
        this.spf = spf; // seconds per frame in animation
        this.repeat_cooldown = repeat_cooldown; // minimum time between animation cycles or -1 to disable looping
        this.tile_w = tile_w; // width in tiles in game
        this.tile_h = tile_h; // height in tiles in game
    }

    icon(size) {
        const img = document.createElement("img");
        img.src = this.src;
        img.alt = this.name;

        const scale = size / Math.max(this.w, this.h);
        img.style.scale = scale;
        // offset position
        img.style.translate = `${-(this.x + this.frame_width * this.frame_offset) * scale}px ${-this.y * scale}px`;
        img.style.transformOrigin = "0 0"; // scale around top-left

        // crop to size
        const div = document.createElement("div");
        div.style.width = `${this.w * scale}px`;
        div.style.height = `${this.h * scale}px`;
        div.style.overflow = "hidden";

        div.appendChild(img);
        return div;
    }

    sub_tile(x, y, w, h) {
        const img = document.createElement("img");
        const set_size = () => {
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

class SpriteObj extends Obj {
    constructor(tool) {
        super(tool, tool.tile_w, tool.tile_h);
    }

    clone() { return new SpriteObj(this.tool); }

    sub_tile(x, y, w, h) { return this.tool.sub_tile(x, y, w, h); }

    drag(x, y) { this.move(x, y); }

    rotate(x, y) { }
}
