const table = document.querySelector("table");
let w;
let h;

function create_row() {
    const row = document.createElement("tr");
    return row;
}

function create_col() {
    const col = document.createElement("td");
    const div = document.createElement("div");
    div.classList.add("cell");
    col.appendChild(div);
    return col;
}

function resize() {
    w = document.getElementById("width").value;
    h = document.getElementById("height").value;


    for (let i = table.childElementCount; i < h; i++)
        table.appendChild(create_row());
    for (let i = table.childElementCount; i > h; i--)
        table.lastChild?.remove();

    for (const child of table.children) {
        for (let i = child.childElementCount; i < w; i++)
            child.appendChild(create_col());
        for (let i = child.childElementCount; i > w; i--)
            child.lastChild?.remove();
    }
};

resize();
