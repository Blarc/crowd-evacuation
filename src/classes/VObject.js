class VObject {

    constructor(obstacleAvoidance) {
        this.position = createVector(random(100, width - 100), random(100, height - 100));
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(0.5)
        this.velocityMag = 1.0
        this.size = 14;
        this.obstacleAvoidance = obstacleAvoidance

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

        let distancesBySector = [Infinity, Infinity, Infinity, Infinity, Infinity]

        let inRadius = []
        vObjects.forEach(vObject => {
            let distance = p5.Vector.dist(this.position, vObject.position)
            if (this !== vObject && distance < Config.visionSize) {
                inRadius.push(vObject)
            }
        })

        this.arcs.forEach(arc => {
            arc.update(this.velocity)

            inRadius.forEach(vObject => {
                if (vObject !== this) {
                    if (arc.isInArc(vObject.position)) {
                        arc.color = [255, 0, 0, 200]
                        if (arc.label !== VArcLabelEnum.BACK) {
                            let distance = p5.Vector.dist(this.position, vObject.position)

                            if (distance < distancesBySector[arc.label.id]) {
                                distancesBySector[arc.label.id] = distance
                            }
                        }
                    }
                }
            })
        })

        if (this.obstacleAvoidance) {
            let [a, V] = this.obstacleAvoidance.getOutput(distancesBySector)
            this.velocity.rotate(radians(a))
            this.velocityMag = V
        }

        this.position.add(this.velocity.copy().setMag(this.velocityMag));

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
        if (this.position.x - Config.visionSize < 0 ||
            this.position.x + Config.visionSize > width ||
            this.position.y - Config.visionSize < 0 ||
            this.position.y + Config.visionSize > height
        ) {
            this.velocity = createVector(-this.velocity.x, -this.velocity.y);
            // Make sure it doesn't get stuck
            this.position.add(this.velocity.copy().setMag(this.velocityMag));
        }
    }
}
