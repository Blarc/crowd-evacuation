class VRect {
    constructor(position, width, height) {
        this.pos = position;
        this.width = width;
        this.height = height;
    }

    show(color = [100, 100, 100]) {
        fill(color);
        stroke(255);
        strokeWeight(0.1);
        rectMode(CENTER);
        rect(this.pos.x, this.pos.y, this.width, this.height);
    }

    getRectLines() {
        let upperLine = new VLine(this.upperLeftCorner(), this.upperRightCorner());
        let leftLine = new VLine(this.upperLeftCorner(), this.bottomLeftCorner());
        let rightLine = new VLine(this.upperRightCorner(), this.bottomRightCorner());
        let bottomLine = new VLine(this.bottomLeftCorner(), this.bottomRightCorner());

        return [rightLine, upperLine, leftLine, bottomLine]
    }

    bottomRightCorner() {
        return createVector(point.x + this.width / 2, point.y + this.height / 2);
    }

    bottomLeftCorner() {
        return createVector(point.x - this.width / 2, point.y + this.height / 2);
    }

    upperRightCorner() {
        return createVector(point.x + this.width / 2, point.y - this.height / 2);
    }

    upperLeftCorner() {
        return createVector(point.x - this.width / 2, point.y - this.height / 2);
    }
}
