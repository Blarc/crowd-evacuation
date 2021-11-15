class GoalSeeking {
    constructor(speedIO, angleIO, distanceIO) {
        this.s = speedIO;
        this.a = angleIO;
        this.d = distanceIO;
    }

    getOutput(object, goal) {
        let distance = p5.Vector.dist(object.pos, goal);

        let desiredVelocity = p5.Vector.sub(goal, object.pos);
        let angle = desiredVelocity.angleBetween(object.velocity);

        let input_angle = this.getInputAngle(angle);
        let input_distance = this.getInputDistance(distance);

        // Rule 1
        if (input_angle === this.a.LARGE_POS && input_distance === this.d.NEAR) {
            return [this.a.LARGE_NEG, this.s.ZERO]
        }
        // Rule 2
        else if (input_angle === this.a.LARGE_POS && input_distance === this.d.FAR) {
            return [this.a.LARGE_NEG, this.s.SLOW]
        }
        // Rule 3
        else if (input_angle === this.a.SMALL_POS && input_distance === this.d.NEAR) {
            return [this.a.SMALL_NEG, this.s.SLOW]
        }
        // Rule 4
        else if (input_angle === this.a.SMALL_POS && input_distance === this.d.FAR) {
            return [this.a.SMALL_NEG, this.s.SLOW]
        }
        // Rule 5
        else if (input_angle === this.a.ZERO && input_distance === this.d.NEAR) {
            return [this.a.ZERO, this.s.FAST]
        }
        // Rule 6
        else if (input_angle === this.a.ZERO && input_distance === this.d.FAR) {
            return [this.a.ZERO, this.s.FAST]
        }
        // Rule 7
        else if (input_angle === this.a.SMALL_NEG && input_distance === this.d.NEAR) {
            return [this.a.SMALL_POS, this.s.SLOW]
        }
        // Rule 8
        else if (input_angle === this.a.SMALL_NEG && input_distance === this.d.FAR) {
            return [this.a.SMALL_POS, this.s.SLOW]
        }
        // Rule 9
        else if (input_angle === this.a.LARGE_NEG && input_distance === this.d.NEAR) {
            return [this.a.LARGE_POS, this.s.STOP]
        }
        // Rule 10
        else if (input_angle === this.a.LARGE_NEG && input_distance === this.d.FAR) {
            return [this.a.LARGE_POS, this.s.SLOW]
        }
    }

    getInputAngle(angle) {
        if (angle < this.a.LARGE_NEG) {
            return this.a.LARGE_NEG;
        } else if (angle < this.a.SMALL_NEG) {
            return this.a.SMALL_NEG;
        } else if (angle > this.a.SMALL_POS) {
            return this.a.SMALL_POS;
        } else if (angle > this.a.LARGE_POS) {
            return this.a.LARGE_POS;
        }
        return this.a.ZERO;
    }

    getInputDistance(distance) {
        if (distance < this.d.NEAR) {
            return this.d.NEAR;
        }
        return this.d.FAR;
    }
}
