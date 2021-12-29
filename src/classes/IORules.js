class IOSpeed {
    constructor(slow, fast, max_speed) {
        this.STOP = 0;
        this.SLOW = slow;
        this.FAST = fast;
        this.MAX_SPEED = max_speed;
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

class IOPanicCoefficients {
    constructor(k_p_cat_2, k_p_cat_3, k_c_cat_3) {
        this.K_P_CAT_2 = k_p_cat_2;
        this.K_P_CAT_3 = k_p_cat_3;
        this.K_C_CAT_3 = k_c_cat_3;
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
        //ommited radians just for better readability
        this.OI_ANGLE_BARRIER = oiAngleBarrier;
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
