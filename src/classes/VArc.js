class VArc {
    constructor(position, direction, startVisionAngle, endVisionAngle, visionSize, label) {
        this.position = position;
        this.direction = direction;
        this.startVisionAngle = startVisionAngle;
        this.endVisionAngle = endVisionAngle;
        this.visionSize = visionSize;
        this.label = label;
    }

    update(direction) {
        this.direction = direction;
    }

    show() {
        let heading = degrees(this.direction.heading());
        noStroke()
        fill(this.label.color)
        arc(
            this.position.x,
            this.position.y,
            this.visionSize * 2,
            this.visionSize * 2,
            radians(heading + this.startVisionAngle),
            radians(heading + this.endVisionAngle)
        )


        stroke(255, 0, 255);
        strokeWeight(1)
    }

    isInArc(point) {
        let angle = degrees(this.direction.angleBetween(p5.Vector.sub(point, this.position)))
        let distance = p5.Vector.dist(this.position, point)
        return abs(angle) < abs(this.endVisionAngle - this.startVisionAngle) && distance < this.visionSize
    }

    getVisionVector(alpha) {
        let tmp = this.direction
            .copy()
            .setMag(Config.visionSize)
            .rotate(radians(alpha));
        return p5.Vector.add(this.position, tmp)
    }
}
