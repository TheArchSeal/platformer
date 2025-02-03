"use strict";

class BackgroundBase {
    constructor(src, src_w, src_h, tile_size, color) {
        this.src = src;
        this.src_w = src_w;
        this.src_h = src_h;
        this.tile_size = tile_size;
        this.color = color;
    }
}

class BackgroundTool extends Tool {
    constructor(name, base, x, y, w, h) {
        super(name, "background", BackgroundObj);
        this.base = base;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    icon(size) {
        const img = document.createElement("img");
        img.src = this.base.src;
        img.alt = this.name;

        const scale = size / (this.base.tile_size * Math.max(this.w, this.h));
        img.style.scale = scale;
        img.style.translate = `${-this.base.tile_size * this.x * scale}px ${-this.base.tile_size * this.y * scale}px`
        img.style.transformOrigin = "0 0";

        const div = document.createElement("div");
        div.style.width = `${this.base.tile_size * this.w * scale}px`;
        div.style.height = `${this.base.tile_size * this.h * scale}px`;
        div.style.overflow = "hidden";

        div.appendChild(img);
        return div;
    }

    sub_tile(x, y, w, h) {
        const img = document.createElement("img");
        img.src = this.base.src;
        img.alt = this.name;

        const width = this.base.src_w * w / (this.base.tile_size * this.w);
        const height = this.base.src_h * h / (this.base.tile_size * this.h);
        const marginLeft = this.x + x;
        const marginTop = this.y + y;

        img.style.width = `${100 * width}%`;
        img.style.height = `${100 * height}%`;
        img.style.marginLeft = `${-100 * marginLeft}%`;
        img.style.marginTop = `${-100 * marginTop}%`;

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