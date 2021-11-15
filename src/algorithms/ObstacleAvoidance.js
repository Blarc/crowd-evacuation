class ObstacleAvoidance {
    constructor(speedIO, angleIO, distanceIO) {
        this.s = speedIO;
        this.a = angleIO;
        this.d = distanceIO;
    }

    /*
    Accepts distances to the nearest object in each
    vision sector.
     */
    getOutput(distancesBySector) {

        let ruleNumber = 0;
        // Calculate rule number
        for (let i = 0; i < distancesBySector.length; i++) {
            // If object is not near
            if (distancesBySector[i] > this.d.NEAR) {
                ruleNumber += Math.pow(2, i);
            }
        }

        switch (ruleNumber) {
            // near, near, near, near, near
            case 0:
                return [this.a.LARGE_NEG, this.s.STOP];
            // far, near, near, near, near
            case 1:
                return [this.a.LARGE_NEG, this.s.SLOW];
            // near, far, near, near, near
            case 2:
                return [this.a.SMALL_NEG, this.s.SLOW];
            // far, far, near, near, near
            case 3:
                return [this.a.LARGE_NEG, this.s.SLOW];
            // near, near, far, near, near
            case 4:
                return [this.a.ZERO, this.s.FAST];
            // far, near, far, near, near
            case 5:
                return [this.a.ZERO, this.s.FAST];
            // near, far, far, near, near
            case 6:
                return [this.a.ZERO, this.s.FAST];
            // far, far, far, near, near
            case 7:
                return [this.a.ZERO, this.s.FAST];
            // near, near, near, far, near
            case 8:
                return [this.a.SMALL_POS, this.s.SLOW];
            // far, near, near, far, near
            case 9:
                return [this.a.SMALL_POS, this.s.SLOW];
            // near, far, near, far, near
            case 10:
                return random(0, 1) === 0 ? [this.a.SMALL_POS, this.s.SLOW] : [this.a.SMALL_NEG, this.s.SLOW];
            // far, far, near, far, near
            case 11:
                return [this.a.LARGE_NEG, this.s.SLOW];
            // near, near, far, far, near
            case 12:
                return [this.a.ZERO, this.s.FAST];
            // far, near, far, far, near
            case 13:
                return [this.a.ZERO, this.s.FAST];
            // near, far, far, far, near
            case 14:
                return [this.a.ZERO, this.s.FAST];
            // far, far, far, far, near
            case 15:
                return [this.a.ZERO, this.s.FAST];
            // near, near, near, near, far
            case 16:
                return [this.a.LARGE_POS, this.s.SLOW];
            // far, near, near, near, far
            case 17:
                return random(0, 1) === 0 ? [this.a.LARGE_POS, this.s.SLOW] : [this.a.LARGE_NEG, this.s.SLOW];
            // near, far, near, near, far
            case 18:
                return [this.a.SMALL_NEG, this.s.SLOW];
            // far, far, near, near, far
            case 19:
                return [this.a.LARGE_NEG, this.s.SLOW];
            // near, near, far, near, far
            case 20:
                return [this.a.ZERO, this.s.FAST];
            // far, near, far, near, far
            case 21:
                return [this.a.ZERO, this.s.FAST];
            // near, far, far, near, far
            case 22:
                return [this.a.ZERO, this.s.FAST];
            // far, far, far, near, far
            case 23:
                return [this.a.ZERO, this.s.FAST];
            // near, near, near, far, far
            case 24:
                return [this.a.LARGE_POS, this.s.SLOW];
            // far, near, near, far, far
            case 25:
                return [this.a.LARGE_POS, this.s.SLOW];
            // near, far, near, far, far
            case 26:
                return [this.a.LARGE_POS, this.s.SLOW];
            // far, far, near, far, far
            case 27:
                return random(0, 1) === 0 ? [this.a.LARGE_POS, this.s.SLOW] : [this.a.LARGE_NEG, this.s.SLOW];
            // near, near, far, far, far
            case 28:
                return [this.a.ZERO, this.s.FAST];
            // far, near, far, far, far
            case 29:
                return [this.a.ZERO, this.s.FAST];
            // near, far, far, far, far
            case 30:
                return [this.a.ZERO, this.s.FAST];
            // far, far, far, far, far
            default:
                return [this.a.ZERO, this.s.FAST];
        }
    }
}
