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

class IOPathSearching {
    constructor(lowRisk, highRisk, angleRisk, oiMagnifier, oiAngleBarrier, k_w, negative_energy_barrier) {
        this.LOW_RISK = lowRisk;
        this.HIGH_RISK = highRisk;
        this.ANGLE_RISK = radians(angleRisk);
        this.OI_MAGNIFIER = oiMagnifier;
        this.OI_ANGLE_BARRIER = radians(oiAngleBarrier);
        this.K_W = k_w;
        this.NEGATIVE_ENERGY_BARRIER = negative_energy_barrier;
    }
}

class IOdelta {
    constructor(small, middle, large) {
        this.SMALL = small;
        this.MIDDLE = middle;
        this.LARGE = large;
    }
}
