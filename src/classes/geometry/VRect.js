class VRect {
    constructor(position, width, height) {
        this.pos = position;
        this.width = width;
        this.height = height;
    }

    show(color = [100, 100, 100]) {
        fill(color);
        stroke(255);
        strokeWeight(0.1);
        rectMode(CENTER);
        rect(this.pos.x, this.pos.y, this.width, this.height);
    }

    hasSamePosition(rect) {
        return this.pos.x === rect.pos.x && this.pos.y === rect.pos.y;
    }

    getRectLines() {
        let upperLine = new VLine(this.upperLeftCorner(), this.upperRightCorner());
        let leftLine = new VLine(this.upperLeftCorner(), this.bottomLeftCorner());
        let rightLine = new VLine(this.upperRightCorner(), this.bottomRightCorner());
        let bottomLine = new VLine(this.bottomLeftCorner(), this.bottomRightCorner());

        return [rightLine, upperLine, leftLine, bottomLine]
    }

    getIntersections(line) {
        let intersections = [];

        for (let rectLine of this.getRectLines()) {
            let intersectionVector = line.intersection(rectLine)
            if (intersectionVector) {
                intersections.push(intersectionVector);
            }
        }

        return intersections;
    }

    getArcIntersections(direction, arc) {
        let intersections = [];

        for (let rectLine of this.getRectLines()) {
            let intersectionVector = arc.intersection(direction, rectLine);
            if (intersectionVector) intersections.push(intersectionVector);
        }

        return intersections;
    }

    getIntersection(line) {
        for (let rectLine of this.getRectLines()) {
            let intersectionVector = line.intersection(rectLine)
            if (intersectionVector) {
                return intersectionVector;
            }
        }

        return undefined;
    }

    getNearestPointTo(object) {
        let nearestPoint;
        let shortestDistance = Infinity;

        let points = [this.upperLeftCorner(), this.upperRightCorner(), this.bottomLeftCorner(), this.bottomRightCorner()]

        for (let point of points) {
            let curDistance = p5.Vector.dist(object.pos, point);
            if (curDistance < shortestDistance) {
                shortestDistance = curDistance;
                nearestPoint = point;
            }
        }

        return nearestPoint;
    }

    getNearestPositionNear(object) {
        let nearestPoint;
        let shortestDistance = Infinity;
        let nearestPointIdx = 0;
        let idx = 0;

        let points = [this.upperLeftCorner(), this.upperRightCorner(), this.bottomLeftCorner(), this.bottomRightCorner()]

        for (let point of points) {

            let curDistance = p5.Vector.dist(object.pos, point);
            if (curDistance < shortestDistance) {
                shortestDistance = curDistance;
                nearestPoint = point;
                nearestPointIdx = idx;
            }

            idx += 1;
        }

        if (nearestPointIdx == 0) {
            return [nearestPoint.x - 2, nearestPoint.y - 2];
        } 
        else if (nearestPointIdx == 1) {
            return [nearestPoint.x + 2, nearestPoint.y - 2];
        }
        else if (nearestPointIdx == 2) {
            return [nearestPoint.x - 2, nearestPoint.y + 2];
        }
        else if (nearestPointIdx == 3) {
            return [nearestPoint.x + 2, nearestPoint.y + 2];
        }
    }

    bottomRightCorner() {
        return createVector(this.pos.x + this.width / 2, this.pos.y + this.height / 2);
    }

    bottomLeftCorner() {
        return createVector(this.pos.x - this.width / 2, this.pos.y + this.height / 2);
    }

    upperRightCorner() {
        return createVector(this.pos.x + this.width / 2, this.pos.y - this.height / 2);
    }

    upperLeftCorner() {
        return createVector(this.pos.x - this.width / 2, this.pos.y - this.height / 2);
    }
}
