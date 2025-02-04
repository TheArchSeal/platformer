"use strict";

function tile_recepie(tile, r) {
    return [
        tile.src,
        tile.tile_size,
        tile.x,
        tile.y,
        tile.extendable_x,
        tile.extendable_y,
        r
    ];
}

function sprite_recepie(sprite) {
    return [
        sprite.src,
        sprite.x,
        sprite.y,
        sprite.w,
        sprite.h,
        sprite.frame_width,
        sprite.frame_count,
        sprite.frame_offset,
        sprite.spf,
        sprite.repeat_cooldown
    ];
}

function object_recepie(obj, toolname) {
    return [
        toolname,
        obj.x,
        obj.y,
        obj.w,
        obj.h,
        obj.tool.collide_top,
        obj.tool.collide_bottom,
        obj.tool.collide_left,
        obj.tool.collide_right,
        obj.tool.deadly,
        obj.tool.padding
    ];
}

function item_recepie(item, toolname) {
    return [
        toolname,
        item.x,
        item.y,
        item.tool.data.restore_count
    ];
}

function goal_recepie(goal, toolname) {
    return [
        toolname,
        goal.x,
        goal.y
    ];
}

function player_recepie(player, dash_count) {
    return [
        player.x,
        player.y,
        dash_count
    ];
}

function background_tile_recepie(tile) {
    let sub_tiles = [];
    tile.forEach((_, i, j) => sub_tiles.push([
        tile.tool.x + i,
        tile.tool.y + j,
        tile.x + i,
        tile.y + j
    ]));
    return sub_tiles;
}

function background_recepie(background, tiles) {
    return [
        background.src,
        background.tile_size,
        background.color,
        tiles
    ];
}

function level_recepie(level, player, objects, items, goals, background) {
    return [
        level.w,
        level.h,
        player,
        objects,
        items,
        goals,
        background,
        level.level_top || null,
        level.level_bottom || null,
        level.level_left || null,
        level.level_right || null
    ];
}

function compile() {
    const game_tiles = {};
    const game_sprites = {};
    const game_levels = {};

    for (const level of levels) {
        const level_objects = []
        const level_items = [];
        const level_goals = [];
        const level_background_tiles = [];
        let level_player = null;
        let background_base = null;

        for (const obj of level.objects) {
            switch (obj.tool.category) {
                case "tiles": {
                    const suffix = ` (${obj.r})`;
                    const toolname = obj.tool.name.endsWith(suffix) ? obj.tool.name : obj.tool.name + suffix;
                    if (!(toolname in game_tiles))
                        game_tiles[toolname] = tile_recepie(obj.tool, obj.r);
                    level_objects.push(object_recepie(obj, toolname))
                } break;

                case "sprites": {
                    const toolname = obj.tool.name;
                    if (!(toolname in game_sprites))
                        game_sprites[toolname] = sprite_recepie(obj.tool);

                    switch (obj.tool.type) {
                        case "item":
                            level_items.push(item_recepie(obj, toolname))
                            break;

                        case "goal":
                            level_goals.push(goal_recepie(obj, toolname))
                            break;
                    }
                } break;

                case "background": {
                    level_background_tiles.push(...background_tile_recepie(obj));
                    if (background_base === null)
                        background_base = obj.tool.base;
                    else if (background_base !== obj.tool.base)
                        return { "error": "More than one background per screen." }
                } break;

                case "player": {
                    obj.tool.sprites.forEach(sprite => {
                        const toolname = sprite.name;
                        if (!(toolname in game_sprites))
                            game_sprites[toolname] = sprite_recepie(sprite);
                    });
                    if (level_player === null)
                        level_player = player_recepie(obj, level.dash_count);
                    else return { "error": "More than one player per screen." };
                } break;
            }
        }

        if (background_base === null)
            background_base = background;
        if (level_player === null)
            return { "error": "No player in screen." };

        if (level.name in game_levels)
            return { "error": "Duplicate level names." };
        else game_levels[level.name] = level_recepie(
            level,
            level_player,
            level_objects,
            level_items,
            level_goals,
            background_recepie(background_base, level_background_tiles)
        );
    }

    const start_level = document.getElementById("start_level").value;
    if (!start_level) return { "error": "No start level selected." }

    const game = {
        "data": [
            game_tiles,
            game_sprites,
            game_levels,
            start_level
        ]
    }

    return game;
}

function catch_compile(callbackfn) {
    const game = compile();
    const error = document.getElementById("error");
    if ("error" in game) {
        error.classList.remove("hidden");
        document.getElementById("error_msg").textContent = game["error"];
    } else {
        error.classList.add("hidden");
        callbackfn(game);
    }
}

function log_level() {
    console.log(compile());
}

function save() {
    catch_compile(game => localStorage.setItem("editorlevel", JSON.stringify(game)));
}

function download() {
    catch_compile(game => {
        const a = document.createElement("a");
        a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(game));
        a.download = "level.json"
        a.click();
    });
}