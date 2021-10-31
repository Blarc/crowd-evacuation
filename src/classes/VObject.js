class VObject {

    constructor() {
        this.position = createVector(random(0, width), random(0, height));
        this.velocity = p5.Vector.random2D();
        this.acceleration = createVector(0, 0);
        this.angle = degrees(baseVector.angleBetween(this.velocity));
        this.size = 14;
    }

    update() {
        this.checkVision()
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.angle = degrees(baseVector.angleBetween(this.velocity));
    }

    show() {
        fill(255);
        strokeWeight(0)
        ellipse(this.position.x, this.position.y, this.size);

        strokeWeight(0)
        fill(255, 0, 0, 100)
        arc(
            this.position.x,
            this.position.y,
            Config.visionSize * 2,
            Config.visionSize * 2,
            radians(this.angle - Config.visionAngle),
            radians(this.angle + Config.visionAngle)
        )

        stroke(255, 0, 255);
        strokeWeight(1)

        for (let i = -Config.visionAngle; i <= Config.visionAngle; i+= Config.visionAngle) {
            let tmp = this.getVisionVector(i)
            line(this.position.x, this.position.y, tmp.x, tmp.y)
        }
    }

    checkVision() {
        for (let i = -Config.visionAngle; i <= Config.visionAngle; i+= Config.visionAngle) {
            let tmp = this.getVisionVector(i)
            this.checkBoundaries(tmp.x, tmp.y);
        }

        vObjects.forEach(vObject => {
            if (vObject !== this) {
                if (this.isInArc(vObject.position)) {
                    this.velocity = createVector(0, 0)
                }
            }
        })
    }

    checkBoundaries(x, y) {
        if (x <= 0 ||
            x >= width ||
            y <= 0 ||
            y >= height
        ) {
            this.velocity = createVector(-this.velocity.x, -this.velocity.y);
        }
    }

    getVisionVector(alpha) {
        let tmp = this.velocity
            .copy()
            .setMag(Config.visionSize)
            .rotate(radians(alpha));
        return p5.Vector.add(this.position, tmp)
    }

    isInArc(point) {
        // TODO mmarolt: This is not working correctly. Please fix it.
        let angle = degrees(this.position.angleBetween(point))
        let distance = p5.Vector.dist(this.position, point)
        return -Config.visionAngle <= angle <= Config.visionAngle && distance < Config.visionSize
    }
}
