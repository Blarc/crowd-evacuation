class VHuman extends VMovingObject{

    constructor(x, y, visionSize, obstacleAvoidance, goalSeeking, pathSearching) {
        super(x, y, [255, 255, 255], visionSize, obstacleAvoidance, goalSeeking, pathSearching);
        this.size = convertSize(Config.objectSize);
    }

    update() {
        this.checkGoal();

        let points = quadTree.query(this.getRange());

        let staticObjectsByArc = [[], [], [], [], []];
        let humansByArc = [[], [], [], [], []];
        let distancesByArc = [Infinity, Infinity, Infinity, Infinity, Infinity];


        for (let point of points) {
            let other = point.userData;

            if (other instanceof VBlock) {
                this.visionArcs.forEach(arc => {
                    let intersectionPoint = arc.isRectInArc(this.velocity, other.rect)
                    if (intersectionPoint) {
                        arc.highlight();

                        let distance = p5.Vector.dist(this.pos, intersectionPoint)
                        if (distance < distancesByArc[arc.label.id]) {
                            distancesByArc[arc.label.id] = distance;
                        }

                        staticObjectsByArc[arc.label.id].push(other);
                    }
                })
            }
            else if (other instanceof VHuman && this !== other) {
                this.visionArcs.forEach(arc => {
                    if (arc.isPointInArc(this.velocity, other.pos)) {
                        arc.highlight();

                        let distance = p5.Vector.dist(this.pos, other.pos)
                        if (distance < distancesByArc[arc.label.id]) {
                            distancesByArc[arc.label.id] = distance;
                        }

                        humansByArc[arc.label.id].push(other);

                        // If two objects are about to crash into each other, rotate
                        if (distance < this.size / 2 + other.size / 2) {
                            this.setSpeed(this.obstacleAvoidance.s.STOP);
                            this.rotate(this.obstacleAvoidance.a.LARGE_NEG);
                        }
                    }
                })
            }
        }

        let angle = 0;
        let velocity = 0;

        // TODO: angle and velocity of each method has to be weighted using Integration of Multiple Behaviors

        if (this.obstacleAvoidance) {
            let [a, V] = this.obstacleAvoidance.getOutput(distancesByArc);
            angle += 0.35 * a;
            velocity += 0.35 * V;
        }

        if (this.goalSeeking) {
            let [a, V] = this.goalSeeking.getOutput(this, goal);
            angle += 0.3 * a;
            velocity += 0.3 * V;
        }

        if (this.pathSearching) {
            let [a, V] = this.pathSearching.getOutput(this, humansByArc, staticObjectsByArc);
            angle += 0.35 * a;
            velocity += 0.35 * V;
        }

        this.rotate(angle);
        this.setSpeed(velocity);

        this.pos.add(this.velocity.copy().setMag(this.velocityMag));

    }

    getRange() {
        return new Circle(this.pos.x, this.pos.y, convertSize(visionSize * 2));
    }

    checkBoundaries() {
        if (this.pos.x - visionSize < 0 ||
            this.pos.x + visionSize > width ||
            this.pos.y - visionSize < 0 ||
            this.pos.y + visionSize > height
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
