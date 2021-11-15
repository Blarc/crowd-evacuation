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

        let s = (direction.heading() + this.startVisionAngle) % TWO_PI;
        let e = (direction.heading() + this.endVisionAngle) % TWO_PI;

        let start_x = this.pos.x + this.visionSize * cos(s)
        let start_y = this.pos.y + this.visionSize * sin(s)

        let end_x = this.pos.x + this.visionSize * cos(e)
        let end_y = this.pos.y + this.visionSize * sin(e)
        
        if (Config.showLines) {
            //arc lines
            let startLine = new VLine(this.pos, createVector(start_x, start_y))
            startLine.show();

            let endLine = new VLine(this.pos, createVector(end_x, end_y))
            endLine.show();
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
        // TODO: Implement this function
        return this.isPointInArc(direction, point);
    }

    /**
     * Checks if rect is in arc
     * @param {p5.Vector} direction of the arc
     * @param {p5.Vector} point top-left corner of the rectangle
     * @param {number} w rectangle's width
     * @param {number} h rectangle's height
     * @returns {boolean} whether arc contains the rectangle
     */
    isRectInArc(direction, point, w, h) {
        // TODO: Implement this function

        let s = (direction.heading() + this.startVisionAngle) % TWO_PI;
        let e = (direction.heading() + this.endVisionAngle) % TWO_PI;

        let start_x = this.pos.x + this.visionSize * cos(s)
        let start_y = this.pos.y + this.visionSize * sin(s)

        let end_x = this.pos.x + this.visionSize * cos(e)
        let end_y = this.pos.y + this.visionSize * sin(e)

        //arc lines
        let startLine = new VLine(this.pos, createVector(start_x, start_y))

        let endLine = new VLine(this.pos, createVector(end_x, end_y))

        let arcLines = [startLine, endLine];

        //rectangle lines
        let upperLine = new VLine(createVector(point.x - w / 2, point.y - h / 2), createVector(point.x + w / 2, point.y - h / 2));
        let leftLine = new VLine(createVector(point.x - w / 2, point.y - h / 2), createVector(point.x - w / 2, point.y + h / 2));
        let rightLine = new VLine(createVector(point.x + w / 2, point.y - h / 2), createVector(point.x + w / 2, point.y + h / 2));
        let bottomLine = new VLine(createVector(point.x - w / 2, point.y + h / 2), createVector(point.x + w / 2, point.y + h / 2));

        let rectangleLines = [upperLine, leftLine, rightLine, bottomLine];

        for (let arcLine of arcLines) {
            for (let rectangleLine of rectangleLines) {
                let intersectionVector = arcLine.intersection(rectangleLine)
                if (intersectionVector) {
                    return intersectionVector;
                }
            }
        }

        return null;
    }

    highlight() {
        this.color = [255, 0, 0, 200];
    }
}
