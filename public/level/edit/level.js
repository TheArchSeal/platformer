"use strict";

class Level {
    static selector_ids = [
        "levels",
        "start_level",
        "level_top",
        "level_bottom",
        "level_left",
        "level_right"
    ];

    constructor(name) {
        this.table = null;
        this.menu_options = {};

        this.name = name;
        this.w = null;
        this.h = null;
        this.dash_count = null;
        this.level_top = "";
        this.level_bottom = "";
        this.level_left = "";
        this.level_right = "";

        this.objects = new Set();
    }

    create() {
        this.table = document.createElement("table");
        this.table.onmouseleave = () => level_leave();

        Level.selector_ids.forEach(id => {
            const menu_option = document.createElement("option");
            menu_option.value = this.name;
            menu_option.textContent = this.name;
            document.getElementById(id).appendChild(menu_option);
            this.menu_options[id] = menu_option;
        });

        this.resize();
    }

    destroy() {
        this.table?.remove();
        this.table = null;
        this.menu_options.forEach(option => option.remove());
        this.menu_options = {};

        this.w = null;
        this.h = null;
        this.dash_count = null;
        this.level_top = "";
        this.level_bottom = "";
        this.level_left = "";
        this.level_right = "";

        this.objects.forEach(obj => obj.destroy());
        this.objects = new Set();
    }

    rename() {
        const name = document.getElementById("name").value;
        if (name) {
            this.name = name
            Object.values(this.menu_options).forEach(option => {
                option.value = name;
                option.textContent = name;
            });
        }
    }

    update_inherited() {
        this.w = parseInt(document.getElementById("width").value);
        this.h = parseInt(document.getElementById("height").value);
        this.dash_count = parseInt(document.getElementById("dash_count").value);
    }

    update_transitions() {
        this.level_top = document.getElementById("level_top").value;
        this.level_bottom = document.getElementById("level_bottom").value;
        this.level_left = document.getElementById("level_left").value;
        this.level_right = document.getElementById("level_right").value;
    }

    set_options() {
        document.getElementById("name").value = this.name;
        document.getElementById("width").value = this.w.toString();
        document.getElementById("height").value = this.h.toString();
        document.getElementById("dash_count").value = this.dash_count.toString();
        document.getElementById("level_top").value = this.level_top;
        document.getElementById("level_bottom").value = this.level_bottom;
        document.getElementById("level_left").value = this.level_left;
        document.getElementById("level_right").value = this.level_right;
    }

    resize() {
        this.update_inherited();

        for (let i = this.table.childElementCount; i < this.h; i++)
            this.table.appendChild(this.create_row());
        for (let i = this.table.childElementCount; i > this.h; i--)
            this.table.lastChild?.remove();

        for (const child of this.table.children) {
            for (let i = child.childElementCount; i < this.w; i++)
                child.appendChild(this.create_col());
            for (let i = child.childElementCount; i > this.w; i--)
                child.lastChild?.remove();
        }
    }

    load() {
        this.set_options();
        const contianer = document.querySelector(".level");
        contianer.replaceChildren(this.table);
        document.getElementById("levels").value = this.name;
        ["level_top", "level_bottom", "level_left", "level_right"].forEach(id => {
            for (const option of document.getElementById(id).children) {
                if (this.menu_options[id] === option)
                    option.classList.add("hidden");
                else option.classList.remove("hidden");
            }
        });
    }

    get_hovered() {
        return this.table.querySelector(".cell:hover");
    }

    get_cell(col, row) {
        return this.table.querySelector(`tr:nth-child(${row + 1}) td:nth-child(${col + 1}) .cell`);
    }

    get_pos(cell) {
        return cell ? [cell.closest("td").cellIndex, cell.closest("tr").rowIndex] : [null, null];
    }


    create_row() {
        return document.createElement("tr");
    }

    create_col() {
        const col = document.createElement("td");
        const cell = document.createElement("div");
        const border = document.createElement("div")
        cell.classList.add("cell");
        border.classList.add("border")

        cell.onmouseenter = () => cell_enter(...this.get_pos(cell));
        cell.onclick = () => cell_click(...this.get_pos(cell));
        cell.onmousedown = () => cell_mdown(...this.get_pos(cell));
        cell.onmouseup = () => cell_mup(...this.get_pos(cell));

        col.appendChild(border);
        col.appendChild(cell);
        return col;
    }
}