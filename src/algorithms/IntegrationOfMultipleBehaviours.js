class IntegrationOfMultipleBehaviours {
    constructor(speedIO, angleIO, distanceIO, deltaIO, negativeEnergyBarrier) {
        this.s = speedIO;
        this.a = angleIO;
        this.d = distanceIO;
        this.delta = deltaIO;
        this.ne_barrier = negativeEnergyBarrier;
    }

    calculateDeltas(d_o_f, NE_f, d_g) {
        if (d_o_f == this.d.NEAR) {
            // if negative energy low
            if (NE_f < this.ne_barrier) {
                if (d_g == this.d.NEAR) {
                    return [this.delta.LARGE, this.delta.SMALL, this.delta.MIDDLE];
                }
                 else {
                    return [this.delta.LARGE, this.delta.SMALL, this.delta.SMALL];
                 }
            }
            // if negative energy high
            else {
                if (d_g == this.d.NEAR) {
                    return [this.delta.LARGE, this.delta.MIDDLE, this.delta.MIDDLE];
                } else {
                    return [this.delta.LARGE, this.delta.MIDDLE, this.delta.SMALL];
                }
            }
        }
        else {
            // if negative energy low
            if (NE_f < this.ne_barrier) {
                if (d_g == this.d.NEAR) {
                    return [this.delta.SMALL, this.delta.SMALL, this.delta.LARGE];
                }
                 else {
                    return [this.delta.SMALL, this.delta.SMALL, this.delta.LARGE];
                 }
            }
            // if negative energy high
            else {
                if (d_g == this.d.NEAR) {
                    return [this.delta.SMALL, this.delta.LARGE, this.delta.MIDDLE];
                } else {
                    return [this.delta.SMALL, this.delta.LARGE, this.delta.SMALL];
                }
            }
        }
    }

    getOutput(d_o_f, NE_f, d_g, a_1, a_2, a_3, V_1, V_2, V_3) {

        let [d_a_o, d_s_p, d_s_g] = this.calculateDeltas(d_o_f, NE_f, d_g);

        let alpha = (d_a_o * a_1 + d_s_p * a_2 + d_s_g * a_3) / (d_a_o + d_s_p + d_s_g);

        let V = (d_a_o * V_1 + d_s_p * V_2 + d_s_g * V_3) / (d_a_o + d_s_p + d_s_g);

        return [alpha, V];
    }
}