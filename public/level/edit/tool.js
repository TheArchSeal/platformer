class Tool {
    constructor(name, category) {
        this.name = name;
        this.category = category;
    }

    button(size) {
        const icon = this.icon(size);

        const input = document.createElement("input");
        input.type = "radio";
        input.name = "tool";
        input.id = this.name;

        const label = document.createElement("label");
        label.for = this.name;
        label.style.width = `${size}px`;
        label.style.height = `${size}px`;
        label.appendChild(icon);
        label.onclick = () => input.click();

        const div = document.createElement("div");
        div.classList.add("tool");
        div.append(label, input);
        return div;
    }
}
