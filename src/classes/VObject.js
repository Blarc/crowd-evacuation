class VObject {

    constructor(x, y, size, visionSize, obstacleAvoidance, goalSeeking) {
        this.pos = createVector(x, y);
        this.size = size;
        this.visionSize = visionSize;
        this.obstacleAvoidance = obstacleAvoidance;
        this.goalSeeking = goalSeeking;

        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(0.5);
        this.velocityMag = 1.0;

        this.arcs = [
            // Temporarily removed BACK arc
            // new VArc(this.position, -275, -85, Config.visionSize / 2, VArcLabelEnum.BACK),
            new VArc(this.pos, -85, -45, this.visionSize, VArcLabelEnum.LEFT),
            new VArc(this.pos, -45, -15, this.visionSize, VArcLabelEnum.FRONT_LEFT),
            new VArc(this.pos, -15, 15, this.visionSize, VArcLabelEnum.FRONT),
            new VArc(this.pos, 15, 45, this.visionSize, VArcLabelEnum.FRONT_RIGHT),
            new VArc(this.pos, 45, 85, this.visionSize, VArcLabelEnum.RIGHT),
        ]
    }

    update() {
        // TODO Instead of checking for boundaries, add obstacles at the edges of the room
        this.checkBoundaries();
        this.checkGoal();

        let distancesByArc = [Infinity, Infinity, Infinity, Infinity, Infinity];
        let points = quadTree.query(this.getRange());

        for (let point of points) {
            let other = point.userData;

            if (this !== other) {
                this.arcs.forEach(arc => {
                    if (arc.isPointInArc(this.velocity, other.pos)) {
                        arc.highlight();

                        let distance = p5.Vector.dist(this.pos, other.pos)
                        if (distance < distancesByArc[arc.label.id]) {
                            distancesByArc[arc.label.id] = distance;
                        }

                        // If two objects are about to crash into each other, rotate
                        if (distance < this.size / 2 + other.size / 2) {
                            this.setSpeed(this.obstacleAvoidance.s.STOP);
                            this.rotate(this.obstacleAvoidance.a.LARGE_NEG)
                        }
                    }
                })
            }
        }

        let angle = 0;
        let velocity = 0;

        if (this.obstacleAvoidance) {
            let [a, V] = this.obstacleAvoidance.getOutput(distancesByArc);
            angle += 0.7 * a;
            velocity += 0.7 * V;
        }

        if (this.goalSeeking) {
            let [a, V] = this.goalSeeking.getOutput(this, goal);
            angle += 0.3 * a;
            velocity += 0.3 * V;
        }

        this.rotate(angle);
        this.setSpeed(velocity);

        this.pos.add(this.velocity.copy().setMag(this.velocityMag));

    }

    show() {
        fill(255);
        noStroke();
        ellipse(this.pos.x, this.pos.y, this.size);

        // Put all debugging visuals in this if-statement
        if (Config.debug) {
            if (this.velocity.x !== 0 || this.velocity.y !== 0) {
                this.arcs.forEach(arc => {
                    arc.show(this.velocity);
                })
            }
        }
    }

    getRange() {
        return new Circle(this.pos.x, this.pos.y, Config.visionSize);
    }

    checkBoundaries() {
        if (this.pos.x - Config.visionSize < 0 ||
            this.pos.x + Config.visionSize > width ||
            this.pos.y - Config.visionSize < 0 ||
            this.pos.y + Config.visionSize > height
        ) {
            this.rotate(PI);
            // Make sure it doesn't get stuck
            this.pos.add(this.velocity.copy().setMag(this.velocityMag));
        }
    }

    rotate(a) {
        this.velocity.rotate(a);
    }

    setSpeed(v) {
        this.velocityMag = v;
    }

    stop() {
        this.setSpeed(0);
    }

    checkGoal() {
        if (p5.Vector.dist(this.pos, goal) < 5) {
            goal = createVector(random(50, width - 50), random(50, height - 50))
        }
    }
}
