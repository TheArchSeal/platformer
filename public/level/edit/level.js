const level = document.querySelector(".level table");

function get_hovered() {
    return document.querySelector(".cell:hover");
}

function get_cell(col, row) {
    return document.querySelector(`tr:nth-child(${row + 1}) td:nth-child(${col + 1}) .cell`);
}

function get_pos(cell) {
    return cell ? [cell.closest("td").cellIndex, cell.closest("tr").rowIndex] : [null, null];
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

    cell.onmouseenter = () => cell_enter(...get_pos(cell));
    cell.onclick = () => cell_click(...get_pos(cell));
    cell.onmousedown = () => cell_mdown(...get_pos(cell));
    cell.onmouseup = () => cell_mup(...get_pos(cell));

    col.appendChild(border);
    col.appendChild(cell);
    return col;
}

function resize() {
    const w = parseInt(document.getElementById("width").value);
    const h = parseInt(document.getElementById("height").value);

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

function get_options() {
    const w = parseInt(document.getElementById("width").value);
    const h = parseInt(document.getElementById("height").value);
    const dash_count = parseInt(document.getElementById("dash_count").value);

    return { w, h, dash_count };
}

level.onmouseleave = () => level_leave();
resize();
