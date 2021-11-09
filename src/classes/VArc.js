class VArc {
    constructor(position, startVisionAngle, endVisionAngle, visionSize, label) {
        this.pos = position;
        this.startVisionAngle = radians(startVisionAngle);
        this.endVisionAngle = radians(endVisionAngle);
        this.visionSize = visionSize;
        this.label = label;
        this.color = null;
    }

    show(direction) {
        let heading = direction.heading();
        noStroke()
        if (this.color) {
            fill(this.color)
            this.color = null
        }
        else {
            fill(this.label.color)
        }
        arc(
            this.pos.x,
            this.pos.y,
            this.visionSize * 2,
            this.visionSize * 2,
            heading + this.startVisionAngle,
            heading + this.endVisionAngle
        )


        stroke(255, 0, 255);
        strokeWeight(1)
    }

    isInArc(direction, point) {
        let a = atan2(point.y - this.pos.y, point.x - this.pos.x) + PI
        let r = p5.Vector.dist(this.pos, point)

        let s = (direction.heading() + this.startVisionAngle + PI) % TWO_PI
        let e = (direction.heading() + this.endVisionAngle + PI) % TWO_PI

        if (r < this.visionSize) {
            if (s < e) {
                if (a > s && a < e) {
                    return true;
                }
            }
            if (s > e) {
                if (a > s || a < e) {
                    return true;
                }
            }
        }
        return false;
    }
}
