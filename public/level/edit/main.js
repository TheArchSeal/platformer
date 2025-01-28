const tiles = {
    "brick": ["assets/dungeon tile set.png", 16, 1, 1, true, true],
    "slate": ["assets/dungeon tile set.png", 16, 1, 5, true, true],

    "platform": ["assets/dungeon tile set.png", 16, 1, 10, true, false],

    "spike": ["assets/dungeon tile set.png", 16, 1, 14, false, false],
    "left spike": ["assets/dungeon tile set.png", 16, 1, 14, false, false, 1],
    "right spike": ["assets/dungeon tile set.png", 16, 1, 14, false, false, 3],
    "top spike": ["assets/dungeon tile set.png", 16, 1, 14, false, false, 2]
};
const sprites = {
    "crystal item": ["assets/pixel purple gem.png", 0, 0, 32, 32, 32, 7, 0, 0.1, 3],
    "goal": ["assets/flag animation.png", 0, 0, 45, 60, 60, 5, 0, 0.15, 0]
};
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

function tile_tool(name, args) {
    return new Tool(new Tile(new TileTemplate(
        ...args.map((arg, i) => i == 0 ? "../play/" + arg : arg)
    ), 3, 3), name, "tiles");
}
function sprite_tool(name, args) {
    return new Tool(new Sprite(new SpriteTemplate(
        ...args.map((arg, i) => i == 0 ? "../play/" + arg : arg)
    )), name, "sprites");
}

const tools = [
    ...Object.entries(tiles).map(([val, key]) => tile_tool(val, key)),
    sprite_tool("player", player["player idle"]),
    ...Object.entries(sprites).map(([val, key]) => sprite_tool(val, key))
];

Promise.all(tools.map(tool => tool.load())).then(() => tools.forEach(tool => {
    const img = document.createElement("img");
    img.src = tool.icon;
    img.alt = tool.name;

    const label = document.createElement("label");
    label.for = tool.name
    label.appendChild(img);

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "tool";
    input.id = tool.name;

    label.onclick = () => input.click();
    document.querySelector(`.${tool.category}`).append(label, input);
}));
