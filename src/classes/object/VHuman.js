class VHuman extends VMovingObject{

    constructor(x, y, visionSize, obstacleAvoidance, goalSeeking, pathSearching, integrationOfMultipleBehaviours) {
        super(x, y, [255, 255, 255], visionSize, obstacleAvoidance, goalSeeking, pathSearching, integrationOfMultipleBehaviours);
        this.size = Config.objectSize;
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
        let a_o, V_o, a_p, V_p, NE_f, a_g, V_g, d_g = 0;
        let d_o_f = distancesByArc[2];

        if (this.obstacleAvoidance) {
            [a_o, V_o] = this.obstacleAvoidance.getOutput(distancesByArc);
        }

        if (this.goalSeeking) {
            [a_g, V_g] = this.goalSeeking.getOutput(this, goal);
        }

        if (this.pathSearching) {
            [a_p, V_p, NE_f] = this.pathSearching.getOutput(this, humansByArc, staticObjectsByArc);
        }

        if (this.integrationOfMultipleBehaviours) {
            let [a, V] = this.integrationOfMultipleBehaviours.getOutput(d_o_f, NE_f, d_g, a_o, a_p, a_g, V_o, V_p, V_g);
            angle += a;
            velocity += V;
        }

        this.rotate(angle);
        this.setSpeed(velocity);

        this.pos.add(this.velocity.copy().setMag(this.velocityMag));

    }

    getRange() {
        return new Circle(this.pos.x, this.pos.y, Config.visionSize * 2);
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
