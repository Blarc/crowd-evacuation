class VObject {

    constructor() {
        this.position = createVector(random(0, width), random(0, height));
        this.velocity = p5.Vector.random2D();
        this.acceleration = createVector(0, 0);
        this.angle = degrees(this.velocity.heading())
        this.size = 14;
    }

    update() {
        this.checkVision()
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.angle = degrees(this.velocity.heading())
    }

    show() {
        fill(255);
        strokeWeight(0)
        ellipse(this.position.x, this.position.y, this.size);

        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            strokeWeight(0)
            fill(255, 0, 0, 70)
            arc(
                this.position.x,
                this.position.y,
                Config.visionSize * 2,
                Config.visionSize * 2,
                radians(this.angle - Config.visionAngle),
                radians(this.angle + Config.visionAngle)
            )
        }

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

        let angle = degrees(this.velocity.angleBetween(p5.Vector.sub(point, this.position)))
        let distance = p5.Vector.dist(this.position, point)

        return abs(angle) < Config.visionAngle && distance < Config.visionSize
    }
}
