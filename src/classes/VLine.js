class VLine {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }

    show(color= [0, 255, 0], weight = 1) {
        stroke(color);
        strokeWeight(weight);
        line(this.from.x, this.from.y, this.to.x, this.to.y);
    }

    intersection(other) {
        let bx = this.to.x - this.from.x;
        let by = this.to.y - this.from.y;

        let dx = other.to.x - other.from.x;
        let dy = other.to.y - other.from.y;

        let dot = bx * dy - by * dx;

        if (dot === 0) {
            return null;
        }

        let cx = other.from.x - this.from.x;
        let cy = other.from.y - this.from.y;

        let t = (cx * dy - cy * dx) / dot;
        if(t < 0 || t > 1) return null;

        let u = (cx * by - cy * bx) / dot;
        if(u < 0 || u > 1) return null;

        return createVector(this.from.x + t * bx, this.from.y + t * by);
    }
}
