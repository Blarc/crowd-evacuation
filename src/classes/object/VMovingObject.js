class VMovingObject extends VObject {
    constructor(x, y, color, visionSize, obstacleAvoidance, goalSeeking) {
        super(x, y, color);
        this.visionSize = visionSize;
        this.obstacleAvoidance = obstacleAvoidance;
        this.goalSeeking = goalSeeking;

        this.velocity = p5.Vector.random2D();
        this.velocityMag = 1.0;

        this.visionArcs = [
            // Temporarily removed BACK arc
            // new VArc(this.position, -275, -85, Config.visionSize / 2, VArcLabelEnum.BACK),
            new VArc(this.pos, -85, -45, this.visionSize, VArcLabelEnum.LEFT),
            new VArc(this.pos, -45, -15, this.visionSize, VArcLabelEnum.FRONT_LEFT),
            new VArc(this.pos, -15, 15, this.visionSize, VArcLabelEnum.FRONT),
            new VArc(this.pos, 15, 45, this.visionSize, VArcLabelEnum.FRONT_RIGHT),
            new VArc(this.pos, 45, 85, this.visionSize, VArcLabelEnum.RIGHT),
        ]
    }

    show() {
        fill(this.color);
        noStroke();
        ellipse(this.pos.x, this.pos.y, this.size);

        // Put all debugging visuals in this if-statement
        if (Config.debug) {
            if (this.velocity.x !== 0 || this.velocity.y !== 0) {
                this.visionArcs.forEach(arc => {
                    arc.show(this.velocity);
                })
            }
        }
    }

}
