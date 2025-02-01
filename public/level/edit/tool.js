class Tool {
    constructor(name, category, obj_t) {
        this.name = name;
        this.category = category;
        this.obj_t = obj_t;
    }

    button(size) {
        const icon = this.icon(size);

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

class Obj {
    constructor(tool, w, h) {
        this.tool = tool;
        this.x = null;
        this.y = null;
        this.w = w;
        this.h = h;
        this.elements = [];
    }

    forEach(callbackfn) {
        this.elements.forEach((row, j) => row.forEach((elem, i) => callbackfn(elem, i, j)));
    }

    create() {
        this.elements = [];
        for (let j = 0; j < this.h; j++) {
            this.elements[j] = [];
            for (let i = 0; i < this.w; i++) {
                const elem = this.sub_tile(i, j, this.w, this.h);
                elem.onclick = e => {
                    obj_select(this);
                    e.stopPropagation();
                };

                if (j === 0) elem.classList.add("top");
                if (j + 1 === this.h) elem.classList.add("bottom");
                if (i === 0) elem.classList.add("left");
                if (i + 1 === this.w) elem.classList.add("right");

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
            const cell = get_cell(x + i, y + j);
            if (cell === null) elem.remove();
            else cell.appendChild(elem);
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
