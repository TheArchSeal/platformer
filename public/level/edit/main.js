"use strict";

const background = new BackgroundBase("/level/play/assets/dungeon tile set.png", 16, "#181425");

const tools = new Set([
    new TileTool("brick", "/level/play/assets/dungeon tile set.png", 16, 1, 1, true, true, true, true, true, true, true, true, false, 0),
    new TileTool("slate", "/level/play/assets/dungeon tile set.png", 16, 1, 5, true, true, true, true, true, true, true, true, false, 0),
    new TileTool("wood", "/level/play/assets/dungeon tile set.png", 16, 10, 9, false, false, true, true, true, true, true, true, false, 0),
    new TileTool("platform", "/level/play/assets/dungeon tile set.png", 16, 1, 10, true, false, true, false, true, false, false, false, false, 0),
    new TileTool("spike", "/level/play/assets/dungeon tile set.png", 16, 1, 14, false, false, true, false, true, true, true, true, true, 0.5),
    new TileTool("bloody spike", "/level/play/assets/dungeon tile set.png", 16, 3, 14, false, false, true, false, true, true, true, true, true, 0.5),
    new TileTool("saw", "/level/play/assets/dungeon tile set.png", 16, 10, 15, true, false, true, false, true, true, true, true, true, 0.5),

    new SpriteTool("crystal item", "item", { restore_count: 1 }, "/level/play/assets/pixel purple gem.png", 0, 0, 32, 32, 32, 7, 0, 0.1, 3, 2, 2),
    new SpriteTool("goal", "goal", {}, "/level/play/assets/flag animation.png", 0, 0, 45, 60, 60, 5, 0, 0.15, 0, 3, 4),

    new PlayerTool("player", [
        new SpriteTool("player idle", "player", {}, "/level/play/assets/player idle 48x48.png", 14, 11, 17, 29, 48, 10, 0, 0.1, 0, 1.4, 2.5),
        new SpriteTool("player run", "player", {}, "/level/play/assets/run cycle 48x48.png", 14, 11, 17, 29, 48, 8, 0, 0.1, 0, 1.4, 2.5),
        new SpriteTool("player jump", "player", {}, "/level/play/assets/player jump 48x48.png", 14, 11, 17, 29, 48, 1, 0, -1, -1, 1.4, 2.5),
        new SpriteTool("player airborne", "player", {}, "/level/play/assets/player jump 48x48.png", 14, 11, 17, 29, 48, 1, 1, -1, -1, 1.4, 2.5),
        new SpriteTool("player fall", "player", {}, "/level/play/assets/player jump 48x48.png", 14, 11, 17, 29, 48, 1, 2, -1, -1, 1.4, 2.5),
        new SpriteTool("player land", "player", {}, "/level/play/assets/player land 48x48.png", 14, 11, 17, 29, 48, 9, 0, 0.1, -1, 1.4, 2.5),
        new SpriteTool("player wall land", "player", {}, "/level/play/assets/wall slide 48x48.png", 18, 8, 17, 29, 48, 3, 0, 0.1, -1, 1.4, 2.5),
        new SpriteTool("player wall cling", "player", {}, "/level/play/assets/wall land 48x48.png", 18, 8, 17, 29, 48, 2, 0, 0.1, -1, 1.4, 2.5),
    ]),

    new BackgroundTool("wall", background, 10, 5, 1, 1),
    new BackgroundTool("eyes", background, 10, 1, 2, 2),
    new BackgroundTool("bars", background, 10, 3, 2, 2),
    new BackgroundTool("fence", background, 10, 11, 1, 1),
    new BackgroundTool("crate", background, 10, 10, 1, 1),
    new BackgroundTool("barrel", background, 10, 12, 1, 1),
    new BackgroundTool("pot", background, 11, 12, 1, 1),
    new BackgroundTool("web", background, 10, 14, 4, 1),
    new BackgroundTool("skulls", background, 4, 13, 3, 1),
    new BackgroundTool("lantern", background, 7, 12, 3, 2),
]);

const move_tool = {};

tools.forEach(tool => document.querySelector(`.${tool.category}`).appendChild(tool.button(50)));

const levels = new Set();
let curr_level = null;

let mouse_down = false;
let selected_tool = null;
let tool_obj = null;
let selected_obj = null;

function clear_level() {
    obj_deselect();
    for (const obj of curr_level.objects) {
        obj.destroy();
        curr_level.objects.delete(obj);
    }
}

function tool_select(tool) {
    tool_obj?.destroy();
    tool_obj = null;
    selected_obj?.deselect();
    selected_obj = null;

    if (tool) {
        tool_obj = new tool.obj_t(tool);
        tool_obj.create();
    }

    selected_tool = tool;
}

function obj_select(obj) {
    if (selected_tool === null) {
        selected_obj?.deselect();
        tool_obj?.destroy();
        tool_obj = null;
        selected_obj = obj;
        selected_obj.select();
    }
}

function obj_deselect() {
    selected_obj?.deselect();
    selected_obj = null;
    tool_obj?.hide();
}

function obj_delete() {
    if (selected_obj) {
        selected_obj.destroy();
        curr_level.objects.delete(selected_obj);
        selected_obj = null;
    }
}

function cell_enter(col, row) {
    if (selected_tool === move_tool) {
        if (mouse_down) selected_obj?.move(col - move_tool.i, row - move_tool.j);
        else selected_tool = null;
    } else if (mouse_down) {
        tool_obj?.drag(col, row);
    } else {
        tool_obj?.ghost(col, row);
    }
}

function obj_mdown(obj, i, j) {
    if (selected_tool === null) {
        obj_select(obj);
        selected_tool = move_tool;
        move_tool.i = i;
        move_tool.j = j;
    }
}

function cell_mdown(col, row) {
    if (selected_tool === null)
        obj_deselect();
    else tool_obj?.place(col, row);
}

function cell_mup() {
    if (selected_tool === move_tool) {
        selected_tool = null;
    } else if (tool_obj) {
        curr_level.objects.add(tool_obj);
        tool_obj = tool_obj.clone();
        tool_obj.create();
    }
}

function level_leave() {
    tool_obj?.hide();
}

function tool_rotate(col, row) {
    tool_obj?.rotate(col, row);
}

function new_level() {
    let name = levels.size + 1;
    for (const level of levels) {
        if (parseInt(level.name) >= name)
            name = parseInt(level.name) + 1;
    }

    obj_deselect();
    curr_level = new Level(name.toString());
    levels.add(curr_level);
    curr_level.create();
    curr_level.load();
}

function delete_level() {
    let prev = null;
    let passed = false;

    for (const level of levels) {
        if (level === curr_level) passed = true;
        if (passed && prev) break;
        if (level !== curr_level) prev = level;
    }

    if (prev) {
        obj_deselect();
        curr_level.destroy();
        levels.delete(curr_level);
        curr_level = prev;
        curr_level.load();
    }
}

function get_level(name) {
    for (const level of levels)
        if (level.name === name)
            return level;
    return null;
}

function select_level(name) {
    const level = get_level(name);
    if (level) {
        obj_deselect();
        curr_level = level;
        curr_level.load();
    }
}

document.onmousedown = () => mouse_down = true;
document.onmouseup = () => mouse_down = false;
document.onkeydown = e => {
    switch (e.key) {
        case "r":
            tool_rotate(...curr_level.get_pos(curr_level.get_hovered()));
            break;

        case "Delete":
        case "Backspace":
            obj_delete(...curr_level.get_pos(curr_level.get_hovered()));
            break;
    }
}

new_level();
