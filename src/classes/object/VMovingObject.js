class VMovingObject extends VObject {
    constructor(x, y, color, visionSize, obstacleAvoidance, goalSeeking, pathSearching, integrationOfMultipleBehaviours) {
        super(x, y, color);
        this.visionSize = visionSize;
        this.obstacleAvoidance = obstacleAvoidance;
        this.goalSeeking = goalSeeking;
        this.pathSearching = pathSearching;
        this.integrationOfMultipleBehaviours = integrationOfMultipleBehaviours;

        this.velocity = p5.Vector.random2D();
        this.velocityMag = 1.0;

        this.visionArcs = [
            // Temporarily removed BACK arc
            // new VArc(this.position, -275, -85, Config.visionSize / 2, VArcLabelEnum.BACK),
            //Each arc has to match Config.arcSize
            new VArc(this.pos, -50, -30, this.visionSize, VArcLabelEnum.LEFT),
            new VArc(this.pos, -30, -10, this.visionSize, VArcLabelEnum.FRONT_LEFT),
            new VArc(this.pos, -10, 10, this.visionSize, VArcLabelEnum.FRONT),
            new VArc(this.pos, 10, 30, this.visionSize, VArcLabelEnum.FRONT_RIGHT),
            new VArc(this.pos, 30, 50, this.visionSize, VArcLabelEnum.RIGHT),
        ]
    }

    show() {
        fill(this.color);
        noStroke();
        ellipse(this.pos.x, this.pos.y, this.size);

        // Put all debugging visuals in this if-statement
        if (this.isAssailant && Config.showAssailantArcs || !this.isAssailant && Config.showPedestrianArcs) {
            if (this.velocity.x !== 0 || this.velocity.y !== 0) {
                this.visionArcs.forEach(arc => {
                    arc.show(this.velocity);
                })
            }
        }
    }

}
