// the same templates the game uses to create objects

class TileTemplate {
	constructor(src, tile_size, x, y, extendable_x, extendable_y, rotation = 0) {
		this.src = src; // path to source image (path)
		this.tile_size = tile_size; // width and height of source image tile (px)
		this.x = x; // source tile column (tiles)
		this.y = y; // source tile row (tiles)
		this.extendable_x = extendable_x; // wether neighboring tiles extend the row (bool)
		this.extendable_y = extendable_y; // wether neighboring tiles extend the column (bool)
		this.rotation = rotation; // amount of clockwise 90 degree rotations made to the sprite (90 deg)
	}
};

class SpriteTemplate {
	constructor(src, x, y, w, h, frame_width, frame_count, frame_offset, spf, repeat_cooldown) {
		this.src = src; // path to source image (path)
		this.x = x; // source x offset (px)
		this.y = y; // source y offset (px)
		this.w = w; // source width (px)
		this.h = h; // source height (px)
		this.frame_width = frame_width; // distance between frames (px)
		this.frame_count = frame_count; // amount of frames in animation (#)
		this.frame_offset = frame_offset; // amount of frames to ignore (#)
		this.spf = spf; // seconds per frame to animate, -1 to disable animation (s|-1)
		this.repeat_cooldown = repeat_cooldown; // minimum time between start of animation cycles, -1 to disable looping (s|-1)
	}
};

class BackgroundTileTemplate {
	constructor(source_x, source_y, dest_x, dest_y) {
		this.source_x = source_x; // source x coordinate (tiles)
		this.source_y = source_y; // source y coordinate (tiles)
		this.dest_x = dest_x; // destination x coordinate (tiles)
		this.dest_y = dest_y; // destination y coordinate (tiles)
	}
};

class BackgroundTemplate {
	constructor(src, tile_size, color, tiles) {
		this.src = src; // path to source image (path)
		this.tile_size = tile_size; // width and height of source image tile (px)
		this.color = color; // default background color (hex)
		this.tiles = tiles; // array of background tiles ([BackgroundTileTemplate])
	}
};

class ObjTemplate {
	constructor(tile, x, y, w, h, collide_top = true, collide_bottom = true, collide_left = true, collide_right = true, deadly = false, padding = 0) {
		this.tile = tile; // tile index to use (id)
		this.x = x; // destination x coordinate (tiles)
		this.y = y; // destination y coordinate (tiles)
		this.w = w; // destination width (tiles)
		this.h = h; // destination height (tiles)
		this.collide_top = collide_top; // stop player going down (bool)
		this.collide_bottom = collide_bottom; // stop player going up (bool)
		this.collide_left = collide_left; // stop player going right (bool)
		this.collide_right = collide_right; // stop player going left (bool)
		this.deadly = deadly; // wether colliding with the object kills the player (bool)
		this.padding = padding; // distance between sides and hitbox (tiles)
	}
};

class ItemTemplate {
	constructor(sprite, x, y, restore_count) {
		this.sprite = sprite; // sprite index to use (id)
		this.x = x; // destination x coordinate (tiles)
		this.y = y; // destination y coordinate (tiles)
		this.restore_count = restore_count // how many dashes to give (#)
	}
};

class GoalTemplate {
	constructor(sprite, x, y) {
		this.sprite = sprite; // sprite index to use (id)
		this.x = x; // destination x coordinate (tiles)
		this.y = y; // destination y coordinate (tiles)
	}
}

class PlayerTemplate {
	constructor(x, y, max_dash_count) {
		this.x = x; // starting player x position (tiles)
		this.y = y; // starting player y position (tiles)
		this.max_dash_count = max_dash_count; // maximum amounts of dashed between refreshes (#)
	}
}

class LevelTemplate {
	constructor(w, h, player, objects, items, goals, background, level_top = null, level_bottom = null, level_left = null, level_right = null) {
		this.w = w; // width of level (tiles)
		this.h = h; // height of level (tiles)
		this.player = player; // player template to use (PlayerTemplate)
		this.objects = objects; // array of objects in level ([ObjTemplate])
		this.items = items; // array of items in level ([ItemTemplate])
		this.goals = goals; // array of goals in level ([GoalTemplate])
		this.background = background; // background to use (BackgroundTemplate)
		this.level_top = level_top; // id of level above (id)
		this.level_bottom = level_bottom; // id of level below (id)
		this.level_left = level_left; // id of level to the left (id)
		this.level_right = level_right; // id of level to teh right (id)
	}
};

class GameTemplate {
	constructor(tiles, sprites, levels, start) {
		this.tiles = tiles; // dictionary of tiles in level ({id:TileTemplate})
		this.sprites = sprites; // dictionary of sprites in level ({id:SpriteTemplate})
		this.levels = levels; // dictionary of levels to use ({id:LevelTemplate})
		this.start = start; // identifier of first level (id)
	}
};

module.exports = {
	TileTemplate,
	SpriteTemplate,
	BackgroundTileTemplate,
	BackgroundTemplate,
	ObjTemplate,
	ItemTemplate,
	GoalTemplate,
	PlayerTemplate,
	LevelTemplate,
	GameTemplate,
}