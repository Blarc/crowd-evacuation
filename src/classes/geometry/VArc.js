class VArc {
    constructor(position, startVisionAngle, endVisionAngle, visionSize, label) {
        this.pos = position;
        this.startVisionAngle = radians(startVisionAngle);
        this.endVisionAngle = radians(endVisionAngle);
        this.visionSize = visionSize;
        this.label = label;
        this.color = null;
    }

    show(direction) {
        let heading = direction.heading();
        noStroke();

        if (this.color) {
            fill(this.color);
            this.color = null;
        }
        else {
            fill(this.label.color);
        }

        arc(
            this.pos.x,
            this.pos.y,
            this.visionSize * 2,
            this.visionSize * 2,
            heading + this.startVisionAngle,
            heading + this.endVisionAngle
        );

        if (showLines) {
            let arcLines = this.getArcLines(direction)
            for (let arcLine of arcLines) {
                arcLine.show(255);
            }
        }
    }

    /**
     * Checks if point is in arc
     * @param {p5.Vector} direction of the arc
     * @param {p5.Vector} point to be checked
     * @returns {boolean} whether arc contains the point
     */
    isPointInArc(direction, point) {
        let a = atan2(point.y - this.pos.y, point.x - this.pos.x) + PI;
        let r = p5.Vector.dist(this.pos, point);

        let s = (direction.heading() + this.startVisionAngle + PI) % TWO_PI;
        let e = (direction.heading() + this.endVisionAngle + PI) % TWO_PI;

        if (r < this.visionSize) {
            if (s < e) {
                if (a > s && a < e) {
                    return true;
                }
            }
            if (s > e) {
                if (a > s || a < e) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Checks if circle is in arc
     * @param {p5.Vector} direction of the arc
     * @param {p5.Vector} point middle of the circle
     * @param {number} r radius of the circle
     * @returns {boolean} whether arc contains the circle
     */
    isCircleInArc(direction, point, r) {
        console.log("circle:", point, r);
        console.log("arc:", this.pos, s, e);
        let a = atan2(point.y - this.pos.y, point.x - this.pos.x) + PI;
        let d = p5.Vector.dist(this.pos, point);

        let s = (direction.heading() + this.startVisionAngle + PI) % TWO_PI;
        let e = (direction.heading() + this.endVisionAngle + PI) % TWO_PI;

        let dr = atan2(d, r);

        if (d - r < this.visionSize) {
            if (s < e) {
                if (a > s - dr && a < e + dr) {
                    console.log("true");
                    return true;
                }
            }
            if (s > e) {
                if (a > s - dr || a < e + dr) {
                    console.log("true");
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Checks if rect is in arc
     * @param {p5.Vector} direction of the arc
     * @param {VRect} rectangle
     * @returns {p5.Vector} intersection point if exists or else null
     */
    isRectInArc(direction, rectangle) {
        let arcLines = this.getArcLines(direction);
        let rectangleLines = rectangle.getRectLines();

        //will use this for now, cause it's much quicker and it works
        for (let arcLine of arcLines) {
            for (let rectangleLine of rectangleLines) {
                let intersectionVector = arcLine.intersection(rectangleLine)
                if (intersectionVector) {
                    return intersectionVector;
                }
            }
        }

        return null;

        /*let intersection = null
        let intersectionDistance = this.visionSize;

        for (let rectangleLine of rectangleLines) {

            let corner = rectangleLine.from;

            if (this.isPointInArc(direction, corner) && p5.Vector.dist(this.pos, corner) <= intersectionDistance) {
                intersection = corner;
                intersectionDistance = p5.Vector.dist(this.pos, corner);
            }

            let projection = rectangleLine.projection(this.pos);
            
            if (projection && this.isPointInArc(direction, projection) && p5.Vector.dist(this.pos, projection) <= intersectionDistance) {
                intersection = projection;
                intersectionDistance = p5.Vector.dist(this.pos, projection);
            }

            for (let arcLine of arcLines) {
                let intersectionVector = arcLine.intersection(rectangleLine);

                if (intersectionVector && p5.Vector.dist(this.pos, intersectionVector) <= intersectionDistance) {
                    intersection = intersectionVector;
                    intersectionDistance = p5.Vector.dist(this.pos, intersectionVector);
                }
            }
        }

        return intersection;*/
        
    }

    /**
     * Returns the start and end line of an arc
     * @param {p5.Vector} direction of the arc
     * @returns {VLine[]} array containing start and end line
     */
    getArcLines(direction) {
        let s = (direction.heading() + this.startVisionAngle) % TWO_PI;
        let e = (direction.heading() + this.endVisionAngle) % TWO_PI;

        let start_x = this.pos.x + this.visionSize * cos(s)
        let start_y = this.pos.y + this.visionSize * sin(s)

        let end_x = this.pos.x + this.visionSize * cos(e)
        let end_y = this.pos.y + this.visionSize * sin(e)

        /*let startLine = new VLine(this.pos, createVector(start_x, start_y))
        let endLine = new VLine(this.pos, createVector(end_x, end_y))
        let arcLine = new VLine(createVector(start_x, start_y), createVector(end_x, end_y));*/
        let lines = []

        //get also lines in the middle
        let tmp_s = s
        let tmp_e = e
        let diff = (tmp_e - tmp_s) / Config.numberOfControlLines;

        while ((s < e && tmp_s < tmp_e) || (s > e && tmp_s > tmp_e)) {
            start_x = this.pos.x + this.visionSize * cos(tmp_s)
            start_y = this.pos.y + this.visionSize * sin(tmp_s)

            tmp_s += diff;
            let line = new VLine(this.pos, createVector(start_x, start_y))
            lines.push(line);
        }

        //return [startLine, endLine, arcLine];
        return lines;
    }

    highlight() {
        this.color = [255, 0, 0, 200];
    }

    intersection(direction, line) {
        let projection = line.projection(this.pos);
            
        if (projection && this.isPointInArc(direction, projection)) {
            return projection;
        }

        let endpoint_distance = null;
        if (this.isPointInArc(direction, line.from)) {
            endpoint_distance = p5.Vector.dist(line.from, this.pos);
        }
        if (this.isPointInArc(direction, line.to) && (endpoint_distance == null || p5.Vector.dist(line.to, this.pos) < endpoint_distance)) {
            return line.to;
        }
        else if (endpoint_distance) {
            return line.from
        }

        return null;
    }
}
