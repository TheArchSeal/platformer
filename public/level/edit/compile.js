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

function background_recepie() {
    // TODO: implement
    return null;
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
        let level_player = null;

        for (const obj of level.objects) {
            switch (obj.tool.category) {
                case "tiles": {
                    const toolname = `${obj.tool.name} (${obj.r})`;
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
            background_recepie() // TODO: change after implement
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

function export_log() {
    const game = compile();
    console.log(JSON.stringify(game));
}
