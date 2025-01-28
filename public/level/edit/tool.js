class Tool {
    constructor(obj, name, category) {
        this.obj = obj;
        this.name = name;
        this.category = category;
        this.icon = "";
    }

    load() {
        return new Promise((resolve, reject) => {
            this.obj.img.onload = () => {
                const canvas = document.createElement("canvas");
                const c = canvas.getContext("2d");
                canvas.width = 50;
                canvas.height = 50;
                this.obj.draw(c, 0, 0, canvas.width, canvas.height);
                this.icon = canvas.toDataURL();

                resolve();
            };
        });
    }
}
