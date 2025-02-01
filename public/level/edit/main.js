const tools = new Set([
    new TileTool("brick", "assets/dungeon tile set.png", 240, 288, 16, 1, 1, true, true, true, true, true, true, true, true, false, 0),
    new TileTool("slate", "assets/dungeon tile set.png", 240, 288, 16, 1, 5, true, true, true, true, true, true, true, true, false, 0),
    new TileTool("platform", "assets/dungeon tile set.png", 240, 288, 16, 1, 10, true, false, true, false, true, false, false, false, false, 0),
    new TileTool("spike", "assets/dungeon tile set.png", 240, 288, 16, 1, 14, false, false, true, false, true, true, true, true, true, 0.5),

    new SpriteTool("crystal item", "item", { restore_count: 1 }, "assets/pixel purple gem.png", 224, 32, 0, 0, 32, 32, 32, 7, 0, 0.1, 3, 2, 2),
    new SpriteTool("goal", "goal", {}, "assets/flag animation.png", 300, 60, 0, 0, 45, 60, 60, 5, 0, 0.15, 0, 3, 4),

    new PlayerTool("player", [
        new SpriteTool("player idle", "player", {}, "assets/player idle 48x48.png", 480, 48, 14, 11, 17, 29, 48, 10, 0, 0.1, 0, 1.4, 2.5),
        new SpriteTool("player run", "player", {}, "assets/run cycle 48x48.png", 384, 48, 14, 11, 17, 29, 48, 8, 0, 0.1, 0, 1.4, 2.5),
        new SpriteTool("player jump", "player", {}, "assets/player jump 48x48.png", 144, 48, 14, 11, 17, 29, 48, 1, 0, -1, -1, 1.4, 2.5),
        new SpriteTool("player airborne", "player", {}, "assets/player jump 48x48.png", 144, 48, 14, 11, 17, 29, 48, 1, 1, -1, -1, 1.4, 2.5),
        new SpriteTool("player fall", "player", {}, "assets/player jump 48x48.png", 144, 48, 14, 11, 17, 29, 48, 1, 2, -1, -1, 1.4, 2.5),
        new SpriteTool("player land", "player", {}, "assets/player land 48x48.png", 432, 48, 14, 11, 17, 29, 48, 9, 0, 0.1, -1, 1.4, 2.5),
        new SpriteTool("player wall land", "player", {}, "assets/wall slide 48x48.png", 144, 48, 18, 8, 17, 29, 48, 3, 0, 0.1, -1, 1.4, 2.5),
        new SpriteTool("player wall cling", "player", {}, "assets/wall land 48x48.png", 144, 48, 18, 8, 17, 29, 48, 2, 0, 0.1, -1, 1.4, 2.5),
    ])
]);

tools.forEach(tool => document.querySelector(`.${tool.category}`).appendChild(tool.button(50)));

const objects = new Set();

let mouse_down = false;
let selected_tool = null;
let tool_obj = null;
let selected_obj = null;

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

function obj_delete() {
    if (selected_obj) {
        selected_obj.destroy();
        objects.delete(selected_obj);
        selected_obj = null;
    }
}

function cell_enter(col, row) {
    if (mouse_down) {
        tool_obj?.drag(col, row);
    } else {
        tool_obj?.ghost(col, row);
    }
}

function cell_click() {
    if (selected_tool === null) {
        selected_obj?.deselect();
        selected_obj = null;
    }
}

function cell_mdown(col, row) {
    tool_obj?.place(col, row);
}

function cell_mup() {
    if (tool_obj) {
        objects.add(tool_obj);
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

document.onmousedown = () => mouse_down = true;
document.onmouseup = () => mouse_down = false;
document.onkeydown = e => {
    switch (e.key) {
        case "r":
            tool_rotate(...get_pos(get_hovered()));
            break;

        case "Delete":
        case "Backspace":
            obj_delete(...get_pos(get_hovered()));
            break;
    }
}

// document.getElementById("platform").click();
