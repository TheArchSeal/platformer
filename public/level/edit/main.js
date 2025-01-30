const tools = [
    new TileTool("brick", "assets/dungeon tile set.png", 240, 288, 16, 1, 1, true, true, true, true, true, true, false, 0),
    new TileTool("slate", "assets/dungeon tile set.png", 240, 288, 16, 1, 5, true, true, true, true, true, true, false, 0),
    new TileTool("platform", "assets/dungeon tile set.png", 240, 288, 16, 1, 10, true, false, true, false, false, false, false, 0),
    new TileTool("spike", "assets/dungeon tile set.png", 240, 288, 16, 1, 14, false, false, true, true, true, true, true, 0.5),

    new SpriteTool("crystal item", "item", { restore_count: 1 }, "assets/pixel purple gem.png", 224, 32, 0, 0, 32, 32, 32, 7, 0, 0.1, 3),
    new SpriteTool("goal", "goal", {}, "assets/flag animation.png", 300, 60, 0, 0, 45, 60, 60, 5, 0, 0.15, 0)
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
