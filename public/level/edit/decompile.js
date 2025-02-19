"use strict";

function val_or_default(val, def) {
    return val === undefined ? def : val;
}

function tile_factory(tile, game_tools, rotation_data) {
    const tool = game_tools[tile[0]];
    tool.collide_top = val_or_default(tile[5], true);
    tool.collide_bottom = val_or_default(tile[6], true);
    tool.collide_left = val_or_default(tile[7], true);
    tool.collide_right = val_or_default(tile[8], true);
    tool.deadly = val_or_default(tile[9], false);
    tool.padding = val_or_default(tile[10], 0);

    const t = new TileObj(tool)
    t.x = tile[1];
    t.y = tile[2];
    t.w = tile[3];
    t.h = tile[4];
    t.r = rotation_data[tool.name];

    return t;
}

function item_factory(item, game_tools) {
    const tool = game_tools[item[0]];
    tool.type = "item";
    tool.tile_w = 2;
    tool.tile_h = 2;
    tool.data.restore_count = item[3];

    const i = new SpriteObj(tool);
    i.x = item[1];
    i.y = item[2];

    return i;
}

function goal_factory(goal, game_tools) {
    const tool = game_tools[goal[0]];
    tool.type = "goal";
    tool.tile_w = 3;
    tool.tile_h = 4;

    const g = new SpriteObj(tool);
    g.x = goal[1];
    g.y = goal[2];

    return g;
}

function player_factory(player, sprites) {
    const tool = new PlayerTool("player", sprites);
    const p = new PlayerObj(tool);
    p.x = player[0];
    p.y = player[1];
    return p;
}

function background_base_factory(background_base) {
    if (
        (
            background.src === background_base[0] ||
            "/level/play/" + background.src === background_base[0]
        ) &&
        background.tile_size === background_base[1] &&
        background.color === background_base[2]
    ) return background; // use default if they match so adding new items will work

    return new BackgroundBase(
        background_base[0],
        background_base[1],
        background_base[2]
    );
}

function background_factory(background_tile, background_base) {
    const tool = new BackgroundTool(
        "",
        background_base,
        background_tile[0],
        background_tile[1],
        1,
        1
    )

    const b = new BackgroundObj(tool);
    b.x = background_tile[2];
    b.y = background_tile[3];

    return b;
}

function level_factory(level, name, game_tools, rotation_data) {
    const l = new Level(name);
    l.w = level[0];
    l.h = level[1];
    l.dash_count = level[2][2];
    l.level_top = level[7];
    l.level_bottom = level[8];
    l.level_left = level[9];
    l.level_right = level[10];

    // player sprites are those that start with player
    const player_sprites = Object.entries(game_tools)
        .filter(([name, _]) => name.startsWith("player"))
        .map(([_, tool]) => tool);
    // set player size
    player_sprites.forEach(tool => {
        tool.tile_w = 1.4;
        tool.tile_h = 2.5;
    });
    // add all player sprites
    l.objects.add(player_factory(level[2], player_sprites));

    // add all tiles, items and goals
    level[3].forEach(obj => l.objects.add(tile_factory(obj, game_tools, rotation_data)));
    level[4].forEach(item => l.objects.add(item_factory(item, game_tools)));
    level[5].forEach(goal => l.objects.add(goal_factory(goal, game_tools)));

    // add background objects
    const background_base = background_base_factory(level[6]);
    level[6][3].forEach(background_tile => l.objects.add(background_factory(background_tile, background_base)));

    return l;
}

function decompile(game) {
    const rotation_data = {};
    const game_tools = {};
    const game_levels = {};

    // parse all tile tools
    Object.entries(game["data"][0]).forEach(([name, tile]) => {
        game_tools[name] = new TileTool(
            name,
            tile[0],
            tile[1],
            tile[2],
            tile[3],
            tile[4],
            tile[5],
            false,
            false,

            null,
            null,
            null,
            null,
            null,
            null
        );
        rotation_data[name] = val_or_default(tile[6], 0);
    });

    // parse all sprite tools
    Object.entries(game["data"][1]).forEach(([name, sprite]) => {
        game_tools[name] = new SpriteTool(
            name,
            null,
            {},
            sprite[0],
            sprite[1],
            sprite[2],
            sprite[3],
            sprite[4],
            sprite[5],
            sprite[6],
            sprite[7],
            sprite[8],
            sprite[9],

            null,
            null
        );
    })

    // parse all levels
    Object.entries(game["data"][2]).forEach(([name, level]) =>
        game_levels[name] = level_factory(level, name, game_tools, rotation_data)
    );

    // clear previous game
    for (const level of levels) level.destroy();
    levels.clear();
    Object.values(game_levels).forEach(level => {
        // set transitions
        if (level.level_top) level.level_top = game_levels[level.level_top];
        if (level.level_bottom) level.level_bottom = game_levels[level.level_bottom];
        if (level.level_left) level.level_left = game_levels[level.level_left];
        if (level.level_right) level.level_right = game_levels[level.level_right];

        levels.add(level);
        level.set_options();
        level.create();
        // create all objects
        curr_level = level;
        for (const obj of level.objects) {
            obj.create();
            obj.place(obj.x, obj.y);
        }
    });

    // select starting level
    const start_level = game["data"][3];
    document.getElementById("start_level").value = start_level;
    select_level(start_level);
}

function load() {
    // load from local storage if it exists
    const game = localStorage.getItem("editorlevel");
    if (game) decompile(JSON.parse(game));
}

function upload() {
    // load from file
    const file = document.getElementById("upload_input").files[0];
    const reader = new FileReader();
    reader.onload = () => decompile(JSON.parse(reader.result));
    reader.readAsText(file);
}
