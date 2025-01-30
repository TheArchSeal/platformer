class SpriteTool extends Tool {
    constructor(name, type, data, src, src_w, src_h, x, y, w, h, frame_width, frame_count, frame_offset, spf, repeat_cooldown) {
        super(name, "sprites");
        this.type = type;
        this.data = data;
        this.src = src
        this.src_w = src_w
        this.src_h = src_h
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.frame_width = frame_width
        this.frame_count = frame_count
        this.frame_offset = frame_offset
        this.spf = spf
        this.repeat_cooldown = repeat_cooldown
    }

    icon(size) {
        const img = document.createElement("img");
        img.src = "/level/play/" + this.src;

        const f = Math.max(this.w, this.h);
        img.width = Math.floor(this.src_w * size / f);
        img.height = Math.floor(this.src_h * size / f);
        img.style.marginLeft = `${-Math.floor((this.x + this.frame_width * this.frame_offset) * size / f)}px`;
        img.style.marginTop = `${-Math.floor(this.y * size / f)}px`;

        const div = document.createElement("div");
        div.style.width = `${Math.floor(size * this.w / f)}px`;
        div.style.height = `${Math.floor(size * this.h / f)}px`;
        div.style.overflow = "hidden";

        div.appendChild(img);
        return div;
    }
}
