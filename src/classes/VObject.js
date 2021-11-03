class VObject {

    constructor() {
        this.position = createVector(random(100, width - 100), random(100, height - 100));
        this.velocity = p5.Vector.random2D();
        this.size = 14;

        this.arcs = [
            new VArc(this.position, this.velocity, -275, -85, Config.visionSize / 2, VArcLabelEnum.BACK),
            new VArc(this.position, this.velocity, -85, -45, Config.visionSize, VArcLabelEnum.LEFT),
            new VArc(this.position, this.velocity, -45, -15, Config.visionSize, VArcLabelEnum.FRONT_LEFT),
            new VArc(this.position, this.velocity, -15, 15, Config.visionSize, VArcLabelEnum.FRONT),
            new VArc(this.position, this.velocity, 15, 45, Config.visionSize, VArcLabelEnum.FRONT_RIGHT),
            new VArc(this.position, this.velocity, 45, 85, Config.visionSize, VArcLabelEnum.RIGHT),
        ]
    }

    update() {
        this.checkBoundaries()

        this.position.add(this.velocity);

        this.arcs.forEach(arc => {
            arc.update(this.velocity)
            // vObjects.forEach(vObject => {
            //     if (vObject !== this) {
            //         if (arc.isInArc(vObject.position)) {
            //             this.velocity = createVector(0, 0)
            //         }
            //     }
            // })
        })
    }

    show() {
        fill(255);
        noStroke();
        ellipse(this.position.x, this.position.y, this.size);

        if (this.velocity.x !== 0 || this.velocity.y !== 0) {
            this.arcs.forEach(arc => {
                arc.show()
            })
        }
    }

    checkBoundaries() {
        if (this.position.x - Config.visionSize <= 0 ||
            this.position.x + Config.visionSize >= width ||
            this.position.y - Config.visionSize <= 0 ||
            this.position.y + Config.visionSize >= height
        ) {
            this.velocity = createVector(-this.velocity.x, -this.velocity.y);
        }
    }
}
