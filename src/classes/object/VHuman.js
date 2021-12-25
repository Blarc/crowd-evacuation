class VHuman extends VMovingObject{

    constructor(x, y, visionSize, obstacleAvoidance, goalSeeking, pathSearching, integrationOfMultipleBehaviours, goal_x = -1, goal_y = -1, isAssailant = false) {
        super(x, y, [255, 255, 255], visionSize, obstacleAvoidance, goalSeeking, pathSearching, integrationOfMultipleBehaviours);
        this.size = Config.objectSize;
        this.startingPos = createVector(x, y);
        this.isAssailant = isAssailant;
        // TODO: Category has to be changed dynamically, based on assailants in the room
        this.category = 1;
        if (goal_x != -1 && goal_y != -1) {
            this.goal = createVector(goal_x, goal_y)
        } else {
            this.goal = undefined
        }
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
            if (!this.goal) {
                [a_g, V_g] = this.goalSeeking.getOutput(this, goal);
            } else {
                [a_g, V_g] = this.goalSeeking.getOutput(this, this.goal);
            }
        }

        if (this.pathSearching) {
            [a_p, V_p, NE_f] = this.pathSearching.getOutput(this, humansByArc, staticObjectsByArc);
            if (this.category == 2) {
                V_p = (1 - this.pathSearching.cf.K_P_CAT_2) * V_p + this.pathSearching.cf.K_P_CAT_2 * this.pathSearching.s.MAX_SPEED;
            } else if (this.category == 3) {
                V_p = (1 - this.pathSearching.cf.K_P_CAT_3) * V_p + this.pathSearching.cf.K_P_CAT_3 * this.pathSearching.s.MAX_SPEED;
            }
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
        if (!this.goal && p5.Vector.dist(this.pos, goal) < 5) {
            goal = createVector(random(50, width - 50), random(50, height - 50))
        } else if (this.goal && p5.Vector.dist(this.pos, this.goal) < 5) {
            this.pos.x = this.startingPos.x;
            this.pos.y = this.startingPos.y;
        }
    }
}
