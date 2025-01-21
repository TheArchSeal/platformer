"use strict";

// apply function to all items in list
function map_list(func) {
	return obj => obj.map(val => func(val));
}

// apply function to all items in object
function map_dict(func) {
	return obj => Object.fromEntries(Object.entries(obj).map(([key, val]) => [key, func(val)]));
}

// apply functions to items with matching keys
function map_index(func_dict) {
	return args => args.map((val, key) => key in func_dict ? func_dict[key](val) : val);
}

// create constructor function from class
function construct(constructor) {
	return args => new constructor(...args);
}

// regular function composition
function compose(f, g) {
	return (...args) => f(g(...args));
}

// define structure of game template and how to construct it
const parse_json = compose(construct(GameTemplate), map_index({
	0: map_dict(construct(TileTemplate)),
	1: map_dict(construct(SpriteTemplate)),
	2: map_dict(compose(construct(LevelTemplate), map_index({
		2: construct(PlayerTemplate),
		3: map_list(construct(ObjTemplate)),
		4: map_list(construct(ItemTemplate)),
		5: map_list(construct(GoalTemplate)),
		6: compose(construct(BackgroundTemplate), map_index({
			3: map_list(construct(BackgroundTileTemplate))
		}))
	}))),
}));