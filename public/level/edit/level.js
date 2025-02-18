"use strict";

class Level {
    // select element ids containing this level as an option
    static selector_ids = [
        "levels",
        "start_level",
        "level_top",
        "level_bottom",
        "level_left",
        "level_right"
    ];

    constructor(name) {
        this.table = null; // html table element
        this.menu_options = {}; // html option element referring to this

        this.name = name; // unique name used as json key
        this.w = null; // width in tiles
        this.h = null; // height in tiles
        this.dash_count = null; // how many dashes the player can make
        this.level_top = ""; // level transition going up
        this.level_bottom = ""; // level transition going down
        this.level_left = ""; // level transition going left
        this.level_right = ""; // level transition going right

        this.objects = new Set(); // all objects in level
    }

    create() {
        this.table = document.createElement("table");
        this.table.onmouseleave = () => level_leave();

        // create new option in each select element
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
        // remove option from each select element
        Object.values(this.menu_options).forEach(option => option.remove());
        this.menu_options = {};

        // reset options
        this.w = null;
        this.h = null;
        this.dash_count = null;
        this.level_top = null;
        this.level_bottom = null;
        this.level_left = null;
        this.level_right = null;

        // clear all objects
        this.objects.forEach(obj => obj.destroy());
        this.objects = new Set();
    }

    rename() {
        // get new name from html input
        const name = document.getElementById("name").value;
        if (name) { // don't accept empty name
            this.name = name
            // update all option elements
            Object.values(this.menu_options).forEach(option => {
                option.value = name;
                option.textContent = name;
            });
        }
    }

    // get all values that should transfer when creating new level
    update_inherited() {
        this.w = parseInt(document.getElementById("width").value);
        this.h = parseInt(document.getElementById("height").value);
        this.dash_count = parseInt(document.getElementById("dash_count").value);
    }

    // get all values of level transitions
    update_transitions() {
        this.level_top = get_level(document.getElementById("level_top").value);
        this.level_bottom = get_level(document.getElementById("level_bottom").value);
        this.level_left = get_level(document.getElementById("level_left").value);
        this.level_right = get_level(document.getElementById("level_right").value);
    }

    // set all values for when switching to this level
    set_options() {
        document.getElementById("name").value = this.name;
        document.getElementById("width").value = this.w.toString();
        document.getElementById("height").value = this.h.toString();
        document.getElementById("dash_count").value = this.dash_count.toString();
        document.getElementById("level_top").value = this.level_top?.name || "";
        document.getElementById("level_bottom").value = this.level_bottom?.name || "";
        document.getElementById("level_left").value = this.level_left?.name || "";
        document.getElementById("level_right").value = this.level_right?.name || "";
    }

    resize() {
        this.update_inherited();

        // add until not too few
        for (let i = this.table.childElementCount; i < this.h; i++)
            this.table.appendChild(this.create_row());
        // remove until not too many
        for (let i = this.table.childElementCount; i > this.h; i--)
            this.table.lastChild?.remove();

        for (const child of this.table.children) {
            // add until not too few
            for (let i = child.childElementCount; i < this.w; i++)
                child.appendChild(this.create_col());
            // remove until not too many
            for (let i = child.childElementCount; i > this.w; i--)
                child.lastChild?.remove();
        }
    }

    load() {
        this.set_options();
        const contianer = document.querySelector(".level");
        contianer.replaceChildren(this.table);
        document.getElementById("levels").value = this.name;
        // remove self as option from level transitions
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
        return this.table.children.item(row)?.children.item(col)?.querySelector('.cell') || null;
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
        cell.onmousedown = () => cell_mdown(...this.get_pos(cell));
        cell.onmouseup = () => cell_mup(...this.get_pos(cell));

        col.appendChild(border);
        col.appendChild(cell);
        return col;
    }
}