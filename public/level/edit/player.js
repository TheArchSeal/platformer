"use strict";

class PlayerTool extends Tool {
    constructor(name, sprites) {
        super(name, "player", PlayerObj);
        this.sprites = sprites; // array of SpriteTool for different animations
        this.sprite = sprites[0]; // display first sprite
    }

    icon(size) { return this.sprite.icon(size); }

    sub_tile(x, y, w, h) { return this.sprite.sub_tile(x, y, w, h); }
}

class PlayerObj extends Obj {
    constructor(tool) {
        super(tool, tool.sprite.tile_w, tool.sprite.tile_h);
    }

    clone() { return new PlayerObj(this.tool); }

    sub_tile(x, y, w, h) { return this.tool.sub_tile(x, y, w, h); }

    drag(x, y) { this.move(x, y); }

    rotate(x, y) { }
}
