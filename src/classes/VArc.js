class VArc {
    constructor(position, direction, startVisionAngle, endVisionAngle, visionSize, label) {
        this.position = position;
        this.direction = direction;
        this.startVisionAngle = radians(startVisionAngle);
        this.endVisionAngle = radians(endVisionAngle);
        this.visionSize = visionSize;
        this.label = label;
        this.color = null;
    }

    update(direction) {
        this.direction = direction;
    }

    show() {
        let heading = this.direction.heading();
        noStroke()
        if (this.color) {
            fill(this.color)
            this.color = null
        }
        else {
            fill(this.label.color)
        }
        arc(
            this.position.x,
            this.position.y,
            this.visionSize * 2,
            this.visionSize * 2,
            heading + this.startVisionAngle,
            heading + this.endVisionAngle
        )


        stroke(255, 0, 255);
        strokeWeight(1)
    }

    isInArc(point) {
        let a = atan2(point.y - this.position.y, point.x - this.position.x) + PI
        let r = p5.Vector.dist(this.position, point)

        let s = (this.direction.heading() + this.startVisionAngle + PI) % TWO_PI
        let e = (this.direction.heading() + this.endVisionAngle + PI) % TWO_PI

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

    getVisionVector(alpha) {
        let tmp = this.direction
            .copy()
            .setMag(Config.visionSize)
            .rotate(radians(alpha));
        return p5.Vector.add(this.position, tmp)
    }
}
