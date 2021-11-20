class PathSearching {
    constructor(speedIO, angleIO, distanceIO, pathSearchingIO) {
        this.s = speedIO;
        this.a = angleIO;
        this.d = distanceIO;
        this.ps = pathSearchingIO;
    }

    getOutput(human, humansBySector, staticObjectsBySearching) {
        
        let NE_BySector = [Infinity, Infinity, Infinity, Infinity, Infinity];

        let collisionRiskBySector = [0.0, 0.0, 0.0, 0.0, 0.0];
        let obstacleImpactBySector = [0.0, 0.0, 0.0, 0.0, 0.0];

        for (let [sectorId, sector] of humansBySector.entries()) {
            for (let object of sector) {
                let distance = p5.Vector.dist(human.pos, object.pos);
                let speed = object.velocityMag;

                let angleToOtherObject = p5.Vector.sub(human.pos, object.pos);
                let angle = object.velocity.angleBetween(angleToOtherObject);

                collisionRiskBySector[sectorId] += this.getColisionRisk(distance, speed, angle);
            }
        }

        for (let [sectorId, sector] of staticObjectsBySearching.entries()) {
            for (let object of sector) {
                let arc = human.visionArcs[sectorId];
                let angle = 0.0;
                let distance = Infinity;

                let [leftLine, rightLine, arcLine] = arc.getArcLines(human.velocity);

                let leftLineIntersections = object.rect.getIntersections(leftLine);
                let rightLineIntersections = object.rect.getIntersections(rightLine);
                let arcIntersections = object.rect.getIntersections(arcLine);

                let allIntersections = leftLineIntersections.concat(rightLineIntersections);
                allIntersections = allIntersections.concat(arcIntersections);
                for (let intersection of allIntersections) {
                    let curDistance = p5.Vector.dist(human.pos, intersection);
                    if (curDistance < distance) distance = curDistance;
                }

                if (leftLineIntersections.length >= 1 && rightLineIntersections.length >= 1) {
                    angle = abs(arc.endVisionAngle - arc.startVisionAngle);
                } else if (leftLineIntersections.length >= 1 && arcIntersections.length >= 1) {
                    let leftLineVector = leftLineIntersections[0].sub(human.pos);
                    let arcLineVector = arcIntersections[0].sub(human.pos);
                    
                    angle = leftLineVector.angleBetween(arcLineVector);
                } else if (rightLineIntersections.length >= 1 && arcIntersections.length >= 1) {
                    let rightLineVector = rightLineIntersections[0].sub(human.pos);
                    let arcLineVector = arcIntersections[0].sub(human.pos);
                    
                    angle = rightLineVector.angleBetween(arcLineVector);
                } else if (arcIntersections.length >= 2) {
                    let arcLineVector1 = arcIntersections[0].sub(human.pos);
                    let arcLineVector2 = arcIntersections[1].sub(human.pos);

                    angle = arcLineVector1.angleBetween(arcLineVector2);
                } else if (leftLineIntersections.length >= 1) {
                    let point = object.rect.getNearestPointTo(human)

                    let leftLineVector = leftLineIntersections[0].sub(human.pos);
                    let squareEdgeVector = point.sub(human.pos);

                    angle = leftLineVector.angleBetween(squareEdgeVector);
                } else if (rightLineIntersections.length >= 1) {
                    let point = object.rect.getNearestPointTo(human)

                    let rightLineVector = rightLineIntersections[0].sub(human.pos);
                    let squareEdgeVector = point.sub(human.pos);

                    angle = rightLineVector.angleBetween(squareEdgeVector);
                } else if (arcIntersections.length >= 1) {
                    let point = object.rect.getNearestPointTo(human)

                    let arcLineVector = arcIntersections[0].sub(human.pos);
                    let squareEdgeVector = point.sub(human.pos);

                    angle = arcLineVector.angleBetween(squareEdgeVector);
                }
                else {
                    console.log("leftLineIntersections length: ", leftLineIntersections.length, "right intersections length: ", rightLineIntersections.length, "arc intersections length: ", arcIntersections.length)
                    throw new Error("Unpredicted behaviour");
                }

                obstacleImpactBySector[sectorId] += this.getImpactOfObstacles(angle, distance);
            }   
        }

        for (let sectorId = 0; sectorId < obstacleImpactBySector.length; ++sectorId) {
            NE_BySector[sectorId] = this.ps.K_W * obstacleImpactBySector[sectorId] + (1 - this.ps.K_W) * collisionRiskBySector[sectorId];
        }

        //we omit division by zero
        let max_NE = max(NE_BySector) + Config.epsilon; 
        let min_NE = min(NE_BySector);

        for (let sectorId = 0; sectorId < NE_BySector.length; sectorId++) {
            NE_BySector[sectorId] = (max_NE - NE_BySector[sectorId]) / (max_NE - min_NE);
        }


        let ruleNumber = 0;
        // Calculate rule number
        for (let i = 0; i < NE_BySector.length; i++) {
            if (NE_BySector[i] >= this.ps.NEGATIVE_ENERGY_BARRIER) {
                ruleNumber += Math.pow(2, i);
            }
        }

        switch (ruleNumber) {
            // high, high, high, high, high
            case 0:
                return [this.a.LARGE_NEG, this.s.STOP];
            // low, high, high, high, high
            case 1:
                return [this.a.LARGE_NEG, this.s.SLOW];
            // high, low, high, high, high
            case 2:
                return [this.a.SMALL_NEG, this.s.SLOW];
            // low, low, high, high, high
            case 3:
                return [this.a.LARGE_NEG, this.s.SLOW];
            // high, high, low, high, high
            case 4:
                return [this.a.ZERO, this.s.FAST];
            // low, high, low, high, high
            case 5:
                return [this.a.ZERO, this.s.FAST];
            // high, low, low, high, high
            case 6:
                return [this.a.ZERO, this.s.FAST];
            // low, low, low, high, high
            case 7:
                return [this.a.ZERO, this.s.FAST];
            // high, high, high, low, high
            case 8:
                return [this.a.SMALL_POS, this.s.SLOW];
            // low, high, high, low, high
            case 9:
                return [this.a.SMALL_POS, this.s.SLOW];
            // high, low, high, low, high
            case 10:
                return random(0, 1) === 0 ? [this.a.SMALL_POS, this.s.SLOW] : [this.a.SMALL_NEG, this.s.SLOW];
            // low, low, high, low, high
            case 11:
                return [this.a.LARGE_NEG, this.s.SLOW];
            // high, high, low, low, high
            case 12:
                return [this.a.ZERO, this.s.FAST];
            // low, high, low, low, high
            case 13:
                return [this.a.ZERO, this.s.FAST];
            // high, low, low, low, high
            case 14:
                return [this.a.ZERO, this.s.FAST];
            // low, low, low, low, high
            case 15:
                return [this.a.ZERO, this.s.FAST];
            // high, high, high, high, low
            case 16:
                return [this.a.LARGE_POS, this.s.SLOW];
            // low, high, high, high, low
            case 17:
                return random(0, 1) === 0 ? [this.a.LARGE_POS, this.s.SLOW] : [this.a.LARGE_NEG, this.s.SLOW];
            // high, low, high, high, low
            case 18:
                return [this.a.SMALL_NEG, this.s.SLOW];
            // low, low, high, high, low
            case 19:
                return [this.a.LARGE_NEG, this.s.SLOW];
            // high, high, low, high, low
            case 20:
                return [this.a.ZERO, this.s.FAST];
            // low, high, low, high, low
            case 21:
                return [this.a.ZERO, this.s.FAST];
            // high, low, low, high, low
            case 22:
                return [this.a.ZERO, this.s.FAST];
            // low, low, low, high, low
            case 23:
                return [this.a.ZERO, this.s.FAST];
            // high, high, high, low, low
            case 24:
                return [this.a.LARGE_POS, this.s.SLOW];
            // low, high, high, low, low
            case 25:
                return [this.a.LARGE_POS, this.s.SLOW];
            // high, low, high, low, low
            case 26:
                return [this.a.LARGE_POS, this.s.SLOW];
            // low, low, high, low, low
            case 27:
                return random(0, 1) === 0 ? [this.a.LARGE_POS, this.s.SLOW] : [this.a.LARGE_NEG, this.s.SLOW];
            // high, high, low, low, low
            case 28:
                return [this.a.ZERO, this.s.FAST];
            // low, high, low, low, low
            case 29:
                return [this.a.ZERO, this.s.FAST];
            // high, low, low, low, low
            case 30:
                return [this.a.ZERO, this.s.FAST];
            // low, low, low, low, low
            default:
                return [this.a.ZERO, this.s.FAST];
        }
    }

    getColisionRisk(distance, speed, angle) {

        if (speed == this.s.STOP) {
            return this.ps.LOW_RISK;
        } else if (speed <= this.s.LOW) {
            if (abs(angle) <= this.ps.ANGLE_RISK && distance <= this.d.NEAR) return this.ps.HIGH_RISK;
            else return this.ps.LOW_RISK;
        } else {
            // if speed is high, distance is irrelavant
            if (abs(angle) <= this.ps.ANGLE_RISK) return this.ps.HIGH_RISK;
            else return this.ps.LOW_RISK;
        }
    }

    getImpactOfObstacles(angle, distance) {
        if (angle < this.ps.OI_ANGLE_BARRIER && distance < this.d.NEAR) {
            return 2 * this.ps.OI_MAGNIFIER;
        } else if (angle < this.ps.OI_ANGLE_BARRIER || distance < this.d.NEAR) {
            return this.ps.OI_MAGNIFIER;
        } else {
            return 0.0;
        }
    }
}