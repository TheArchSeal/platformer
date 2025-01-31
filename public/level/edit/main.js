const tools = [
    new TileTool("brick", "assets/dungeon tile set.png", 240, 288, 16, 1, 1, true, true, true, true, true, true, false, 0),
    new TileTool("slate", "assets/dungeon tile set.png", 240, 288, 16, 1, 5, true, true, true, true, true, true, false, 0),
    new TileTool("platform", "assets/dungeon tile set.png", 240, 288, 16, 1, 10, true, false, true, false, false, false, false, 0),
    new TileTool("spike", "assets/dungeon tile set.png", 240, 288, 16, 1, 14, false, false, true, true, true, true, true, 0.5),

    new SpriteTool("crystal item", "item", { restore_count: 1 }, "assets/pixel purple gem.png", 224, 32, 0, 0, 32, 32, 32, 7, 0, 0.1, 3, 2, 2),
    new SpriteTool("goal", "goal", {}, "assets/flag animation.png", 300, 60, 0, 0, 45, 60, 60, 5, 0, 0.15, 0, 3, 4),
];

const player = {
    "player idle": ["assets/player idle 48x48.png", 14, 11, 17, 29, 48, 10, 0, 0.1, 0],
    "player run": ["assets/run cycle 48x48.png", 14, 11, 17, 29, 48, 8, 0, 0.1, 0],
    "player jump": ["assets/player jump 48x48.png", 14, 11, 17, 29, 48, 1, 0, -1, -1],
    "player airborne": ["assets/player jump 48x48.png", 14, 11, 17, 29, 48, 1, 0, -1, -1],
    "player fall": ["assets/player jump 48x48.png", 14, 11, 17, 29, 48, 1, 2, -1, -1],
    "player land": ["assets/player land 48x48.png", 14, 11, 17, 29, 48, 9, 0, 0.1, -1],
    "player wall cling": ["assets/wall slide 48x48.png", 18, 8, 17, 29, 48, 3, 0, 0.1, -1],
    "player wall land": ["assets/wall land 48x48.png", 18, 8, 17, 29, 48, 2, 0, 0.1, -1],
}

tools.forEach(tool => document.querySelector(`.${tool.category}`).appendChild(tool.button(50)));

let mouse_down = false;
let selected_tool = null;
let selected_obj = null;

function tool_select(tool) {
    selected_obj?.destroy();
    selected_tool = tool;
    tool_refresh();
}

function tool_refresh() {
    selected_obj = new selected_tool.obj_t(selected_tool);
    selected_obj.create();
}

function cell_enter(col, row) {
    if (mouse_down) {
        selected_obj?.drag(col, row);
    } else {
        selected_obj?.ghost(col, row);
    }
}

function cell_mdown(col, row) {
    selected_obj?.place(col, row);
}

function cell_mup(col, row) {
    tool_refresh();
}

function level_leave() {
    selected_obj?.hide();
}

function tool_rotate() {
    selected_obj?.rotate();
}

document.onmousedown = () => mouse_down = true;
document.onmouseup = () => mouse_down = false;
document.onkeydown = e => {
    switch (e.key) {
        case "r":
            tool_rotate();
            break;
    }
}

document.getElementById("platform").click();
