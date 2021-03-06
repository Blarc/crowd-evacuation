class VHuman extends VMovingObject{

    constructor(x, y, visionSize, obstacleAvoidance, goalSeeking, pathSearching, integrationOfMultipleBehaviours, goal_x = -1, goal_y = -1, isAssailant = false) {
        super(x, y, [255, 255, 255], visionSize, obstacleAvoidance, goalSeeking, pathSearching, integrationOfMultipleBehaviours);
        this.size = Config.objectSize;
        this.startingPos = createVector(x, y);
        this.isAssailant = isAssailant;
        if (goal_x !== -1 && goal_y !== -1) {
            this.goal = createVector(goal_x, goal_y)
        } else {
            this.goal = undefined
        }
        this.category = 1;
        this.categorySwitchProbability = random(0.2, 0.6);
        this.pickedHuman = undefined;

        if (this.isAssailant) {
            this.color = Config.assailantColor;
            this.prevGoalSeekingAngle = goalSeeking.a.ZERO;
        }
        this.stuckCounter = 0;
    }

    toJSON() {
        return {
            pos: {x: this.pos.x, y: this.pos.y},
            color: this.color,
            velocity: {x: this.velocity.x, y: this.velocity.y},
            velocityMag: this.velocityMag,
            isAssailant: this.isAssailant,
            goal: this.goal ? {x: this.goal.x, y: this.goal.y} : undefined
        }
    }

    update() {
        this.checkGoal();

        let points = quadTree.query(this.getRange());

        let staticObjectsByArc = [[], [], [], [], []];
        let humansByArc = [[], [], [], [], []];
        let distancesByArc = [Infinity, Infinity, Infinity, Infinity, Infinity];
        let curNearestHuman, curShortestDistance;

        //only if we choose simple tactic for assailant, that picks the nearest human in room
        let foundHumanPickedForGoal = false;
        if (this.isAssailant) {
            curNearestHuman = undefined;
            curShortestDistance = Infinity;
            if (!vObjects.has(this.pickedHuman)) {
                this.goal = undefined;
            }
        }

        if (this.category === 3 && random(0, 1) > this.categorySwitchProbability) {
            this.category = 2;
        }

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
                //if human sensed an assailant
                if (other.isAssailant && this.category === 1) {
                    this.category = 2;
                }

                this.visionArcs.forEach(arc => {
                    if (arc.isPointInArc(this.velocity, other.pos)) {
                        arc.highlight();

                        let distance = p5.Vector.dist(this.pos, other.pos)
                        if (distance < distancesByArc[arc.label.id] && !this.isAssailant) {
                            distancesByArc[arc.label.id] = distance;
                        }

                        if (this.isAssailant) {
                            //if we don't see picked human anymore, that means human managed to escape assailant
                            if (other === this.pickedHuman) {
                                foundHumanPickedForGoal = true;
                            }

                            if (!other.isAssailant && distance < curShortestDistance) {
                                curNearestHuman = other;
                                curShortestDistance = distance;
                            }

                            if (other === this.pickedHuman && distance < Config.objectSize * 2) {
                                other.color = Config.deadHumanColor;
                                other.velocity.x = 0.0;
                                other.velocity.y = 0.0;

                                this.pickedHuman = undefined;
                                this.goal = undefined;

                                vKilledObjects.add(other);
                                vObjects.delete(other);
                            }
                        }

                        humansByArc[arc.label.id].push(other);
                        if (other.isAssailant) {
                            this.category = 3;
                        }

                        // If two objects are about to crash into each other, rotate
                        if (distance < this.size / 2 + other.size / 2) {
                            this.setSpeed(this.obstacleAvoidance.s.STOP);
                            this.rotate(this.obstacleAvoidance.a.LARGE_NEG);
                        }
                    }
                })
            }
        }

        if (this.isAssailant && !foundHumanPickedForGoal && curNearestHuman) {
            this.pickedHuman = curNearestHuman;
            this.goal = curNearestHuman.pos;
        }

        let angle = 0;
        let velocity = 0;
        let a_o, V_o, a_p, V_p, NE_f, a_g, V_g, d_g = 0;
        let d_o_f = distancesByArc[2];

        if (this.obstacleAvoidance) {
            [a_o, V_o] = this.obstacleAvoidance.getOutput(distancesByArc);
        }

        if (this.goalSeeking) {
            //if assailant doesn't see any target
            if (!this.goal && this.isAssailant) {
                V_g = this.goalSeeking.s.FAST;
                //simple room searching algorithm
                if (random(0, 1) > 0.7) {
                    let newAngle;
                    if (this.prevGoalSeekingAngle === this.goalSeeking.a.SMALL_POS) {
                        newAngle = random(0, 1) > 0.9 ? this.goalSeeking.a.SMALL_NEG : this.goalSeeking.a.SMALL_POS;
                    } else {
                        newAngle = random(0, 1) > 0.9 ? this.goalSeeking.a.SMALL_POS : this.goalSeeking.a.SMALL_NEG;
                    }
                    a_g = newAngle;
                    this.prevGoalSeekingAngle = a_g;
                } else {
                    a_g = this.goalSeeking.a.ZERO;
                }
            }
            // if there is no goal defined for simple pedestrians
            else if (!useGlobalAndLocalGoals && this.category === 1) {
                V_g = this.goalSeeking.s.SLOW;
                //simple room searching algorithm
                if (random(0, 1) > 0.9) {
                    a_g = random(0, 1) > 0.5 ? this.goalSeeking.a.SMALL_NEG : this.goalSeeking.a.SMALL_POS;
                } else {
                    a_g = this.goalSeeking.a.ZERO;
                }
            }
            else if (!this.goal) {
                [a_g, V_g] = this.goalSeeking.getOutput(this, globalGoal);
            } else {
                [a_g, V_g] = this.goalSeeking.getOutput(this, this.goal);
            }
        }

        if (this.pathSearching) {
            [a_p, V_p, NE_f] = this.pathSearching.getOutput(this, humansByArc, staticObjectsByArc, distancesByArc);
        }

        if (this.integrationOfMultipleBehaviours) {
            let [a, V] = this.integrationOfMultipleBehaviours.getOutput(d_o_f, NE_f, d_g, a_o, a_p, a_g, V_o, V_p, V_g);
            if (V_o === this.obstacleAvoidance.s.STOP) {
                angle = a_o;
                velocity = V_o;
                this.stuckCounter += 1;
            } else {
                if (!this.isAssailant && this.category === 2) {
                    V = (1 - this.pathSearching.cf.K_P_CAT_2) * V + this.pathSearching.cf.K_P_CAT_2 * this.pathSearching.s.MAX_SPEED;
                } else if (!this.isAssailant && this.category === 3) {
                    V = (1 - this.pathSearching.cf.K_P_CAT_3) * V + this.pathSearching.cf.K_P_CAT_3 * this.pathSearching.s.MAX_SPEED;
                } else if (this.isAssailant && this.goal && V_o === this.obstacleAvoidance.s.FAST) {
                    V = this.pathSearching.s.MAX_SPEED;
                }
                angle += a;
                velocity += V;

                this.stuckCounter = 0;
            }
        }

        if (this.stuckCounter > 4) {
            let tmpPoints = quadTree.query(new Circle(this.pos.x, this.pos.y, Config.blockSize));

            for (let point of tmpPoints) {
                let other = point.userData;

                if (other instanceof VBlock) {
                    let closestPosition = other.rect.getNearestPositionNear(this);

                    this.pos.x = closestPosition[0];
                    this.pos.y = closestPosition[1];
                    this.stuckCounter = 0;
                    break;
                }

            }
        } else {
            this.rotate(angle);
            this.setSpeed(velocity);

            this.pos.add(this.velocity.copy().setMag(this.velocityMag));
        }

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
        if (!this.isAssailant &&
            ((this.goal && p5.Vector.dist(this.pos, this.goal) < 5) ||
            (!this.goal && p5.Vector.dist(this.pos, globalGoal) < 5))) {
                if (!evacuationMode && useGlobalAndLocalGoals) {
                    this.pos.x = this.startingPos.x;
                    this.pos.y = this.startingPos.y;
                } else if (evacuationMode) {
                    globalSavedPeopleCounter += 1;
                    vObjects.delete(this);
                }
        }
    }
}
