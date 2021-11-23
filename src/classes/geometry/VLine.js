class VLine {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }

    show(color= [0, 255, 0], weight = 0.5) {
        stroke(color);
        strokeWeight(weight);
        line(this.from.x, this.from.y, this.to.x, this.to.y);
    }

    intersection(other) {
        let bx = this.to.x - this.from.x;
        let by = this.to.y - this.from.y;

        let dx = other.to.x - other.from.x;
        let dy = other.to.y - other.from.y;

        let dot = bx * dy - by * dx;

        if (dot === 0) {
            // checks if one line segment endpoints lies on other line segment
            if (this.includePoint(other.from)) {
                return other.from;
            } 
            else if (this.includePoint(other.to)) {
                return other.to;
            }
            else if (other.includePoint(this.from)) {
                return this.from;
            }
            else if (other.includePoint(this.to)) {
                return this.to;
            }

            return null;
        }

        let cx = other.from.x - this.from.x;
        let cy = other.from.y - this.from.y;

        let t = (cx * dy - cy * dx) / dot;
        if(t < 0 || t > 1) return null;

        let u = (cx * by - cy * bx) / dot;
        if(u < 0 || u > 1) return null;

        return createVector(this.from.x + t * bx, this.from.y + t * by);
    }

    includePoint(point) {
        return p5.Vector.dist(this.from, point) + p5.Vector.dist(point, this.to) == p5.Vector.dist(this.to, this.from);
    }

    projection(point) {
        // a + (dot(ap, ab) / dot(ab, ab)) * ab
        let ap = p5.Vector.sub(point, this.from);
        let ab = p5.Vector.sub(this.to, this.from);
        let apXab = p5.Vector.dot(ap, ab);
        let abXab = p5.Vector.dot(ab, ab);
        let projection = p5.Vector.add(this.from, ab.mult(apXab / abXab));
        
        if (this.includePoint(projection)) {
            return projection;
        }
        
        return null;
    }
}
