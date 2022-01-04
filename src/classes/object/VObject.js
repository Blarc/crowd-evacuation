class VObject {
    constructor(x, y, color) {
        this.pos = createVector(x, y);
        this.color = color;
    }

    toJSON() {
        return {
            pos: {x: this.pos.x, y: this.pos.y}
        }
    }
}
