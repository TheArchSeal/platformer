"use strict";

// base class for tools
class Tool {
    constructor(name, category, obj_t) {
        this.name = name; // unique name used as json key
        this.category = category; // where to put it in toolbar
        this.obj_t = obj_t; // class of the objects it creates
    }

    button(size) {
        const icon = this.icon(size); // implemented by subclass

        const input = document.createElement("input");
        input.type = "radio";
        input.name = "tool";
        input.id = this.name;
        input.onclick = () => tool_select(this);

        const label = document.createElement("label");
        label.htmlFor = this.name;
        label.style.width = `${size}px`;
        label.style.height = `${size}px`;
        label.appendChild(icon);

        const div = document.createElement("div");
        div.classList.add("tool");
        div.append(label, input);
        return div;
    }
}

// base class for objects
class Obj {
    constructor(tool, w, h) {
        this.tool = tool; // the tool that created it
        this.x = null; // x position on the level grid
        this.y = null; // y position on the level grid
        this.w = w; // width on the level grid
        this.h = h; // height on the level grid
        this.elements = []; // 2d array of a html element per tile within object
    }

    forEach(callbackfn) {
        this.elements.forEach((row, j) => row.forEach((elem, i) => callbackfn(elem, i, j)));
    }

    create() {
        this.elements = [];
        for (let j = 0; j < this.h; j++) {
            this.elements[j] = [];
            for (let i = 0; i < this.w; i++) {
                const elem = this.sub_tile(i, j, this.w, this.h); // implemented by subclass
                elem.onmousedown = () => obj_mdown(this, i, j);

                // styling around edges
                if (j === 0) elem.classList.add("top");
                if (j + 1 >= this.h) elem.classList.add("bottom");
                if (i === 0) elem.classList.add("left");
                if (i + 1 >= this.w) elem.classList.add("right");

                this.elements[j][i] = elem;
            }
        }
    }

    destroy() {
        this.x = null;
        this.y = null;
        this.forEach(elem => elem.remove());
        this.elements = [];
    }

    resize(w, h) {
        const x = this.x;
        const y = this.y
        this.destroy();
        this.w = w;
        this.h = h;
        this.create();
        if (x !== null && y !== null)
            this.move(x, y);
    }

    hide() {
        this.x = null;
        this.y = null;
        this.forEach(elem => elem.remove());
    }

    move(x, y) {
        this.x = x;
        this.y = y;
        this.forEach((elem, i, j) => {
            const cell = curr_level.get_cell(x + i, y + j);
            if (cell === null) elem.remove(); // would be outside grid
            else cell.appendChild(elem); // moves to new parent
        });
    }

    ghost(x, y) {
        this.move(x, y);
        this.forEach(elem => elem.classList.add("ghost"));
    }

    place(x, y) {
        this.move(x, y);
        this.forEach(elem => elem.classList.remove("ghost"));
    }

    select() {
        this.forEach(elem => elem.classList.add("selected"));
    }

    deselect() {
        this.forEach(elem => elem.classList.remove("selected"));
    }
}
