"use strict";

class BackgroundBase {
    constructor(src, tile_size, color) {
        this.src = src; // url to image containing the tile sheet
        this.tile_size = tile_size; // width and height of tile in image
        this.color = color; // background color
    }
}

class BackgroundTool extends Tool {
    constructor(name, base, x, y, w, h) {
        super(name, "background", BackgroundObj);
        this.base = base; // BackgroundBase it's associated with
        this.x = x; // x position in tile sheet
        this.y = y; // y position in tile sheet
        this.w = w; // width in tiles
        this.h = h; // height in tiles
    }

    icon(size) {
        const img = document.createElement("img");
        img.src = this.base.src;
        img.alt = this.name;

        const scale = size / (this.base.tile_size * Math.max(this.w, this.h));
        img.style.scale = scale;
        // offset position
        img.style.translate = `${-this.base.tile_size * this.x * scale}px ${-this.base.tile_size * this.y * scale}px`
        img.style.transformOrigin = "0 0"; // scale around top-left

        // crop to size
        const div = document.createElement("div");
        div.style.width = `${this.base.tile_size * this.w * scale}px`;
        div.style.height = `${this.base.tile_size * this.h * scale}px`;
        div.style.overflow = "hidden";

        div.appendChild(img);
        return div;
    }

    sub_tile(x, y, w, h) {
        const img = document.createElement("img");
        const set_size = () => {
            const width = img.naturalWidth * w / (this.base.tile_size * this.w);
            const height = img.naturalHeight * h / (this.base.tile_size * this.h);
            const marginLeft = this.x + x;
            const marginTop = this.y + y;

            img.style.width = `${100 * width}%`;
            img.style.height = `${100 * height}%`;
            img.style.marginLeft = `${-100 * marginLeft}%`;
            img.style.marginTop = `${-100 * marginTop}%`;
        }

        img.src = this.base.src;
        img.alt = this.name;

        // naturalWidth and naturalHeight available only after loading
        if (img.complete) set_size();
        else img.onload = set_size;

        // crop to size
        const div = document.createElement("div");
        div.style.width = "100%";
        div.style.height = "100%";
        div.style.overflow = "hidden";
        div.classList.add("background");

        div.appendChild(img);
        return div;
    }
}

class BackgroundObj extends Obj {
    constructor(tool) {
        super(tool, tool.w, tool.h);
    }

    clone() { return new BackgroundObj(this.tool); }

    sub_tile(x, y, w, h) { return this.tool.sub_tile(x, y, w, h); }

    drag(x, y) { this.move(x, y); }

    rotate(x, y) { }
}