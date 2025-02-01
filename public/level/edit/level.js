const level = document.querySelector(".level table");
let w;
let h;

function get_cell(col, row) {
    return document.querySelector(`tr:nth-child(${row + 1}) td:nth-child(${col + 1}) .cell`);
}

function create_row() {
    const row = document.createElement("tr");
    return row;
}

function create_col() {
    const col = document.createElement("td");
    const cell = document.createElement("div");
    const border = document.createElement("div")
    cell.classList.add("cell");
    border.classList.add("border")

    col.onmouseenter = () => cell_enter(col.cellIndex, col.parentElement.rowIndex);
    col.onclick = () => cell_click(col.cellIndex, col.parentElement.rowIndex);
    col.onmousedown = () => cell_mdown(col.cellIndex, col.parentElement.rowIndex);
    col.onmouseup = () => cell_mup(col.cellIndex, col.parentElement.rowIndex);

    col.appendChild(border);
    col.appendChild(cell);
    return col;
}

function resize() {
    w = document.getElementById("width").value;
    h = document.getElementById("height").value;

    for (let i = level.childElementCount; i < h; i++)
        level.appendChild(create_row());
    for (let i = level.childElementCount; i > h; i--)
        level.lastChild?.remove();

    for (const child of level.children) {
        for (let i = child.childElementCount; i < w; i++)
            child.appendChild(create_col());
        for (let i = child.childElementCount; i > w; i--)
            child.lastChild?.remove();
    }
};

level.onmouseleave = () => level_leave();
resize();
