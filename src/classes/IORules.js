class IOSpeed {
    constructor(slow, fast) {
        this.STOP = 0;
        this.SLOW = slow;
        this.FAST = fast;
    }
}

class IOAngle {
    // TODO: negatives are just negated positives?
    constructor(largeNeg, smallNeg, smallPos, largePos) {
        this.LARGE_NEG = radians(largeNeg);
        this.SMALL_NEG = radians(smallNeg);
        this.ZERO = 0;
        this.SMALL_POS = radians(smallPos);
        this.LARGE_POS = radians(largePos);
    }
}

class IODistance {
    // TODO: We only need NEAR
    constructor(near, far) {
        this.NEAR = near;
        this.FAR = far;
    }
}
