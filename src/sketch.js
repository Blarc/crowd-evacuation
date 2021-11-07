const vObjects = [];
let baseVector;

function setup(){
    createCanvas(600, 400);
    baseVector = createVector(1, 0);

    let speedIO = new IOSpeed(0.3, 1.0)
    let angleIO = new IOAngle(-60, -30, 30, 60)
    let distanceIO = new IODistance(Config.visionSize, Config.visionSize)

    let obstacleAvoidance = new ObstacleAvoiding(speedIO, angleIO, distanceIO)

    for (let i = 0; i < 5; i++) {
        vObjects.push(new VObject(obstacleAvoidance))
    }
}

function draw() {
    background(51);

    for (let vObject of vObjects) {
        vObject.update()
        vObject.show()
    }
}

function mousePressed() {
    // TODO
}

function windowResized() {
    // TODO
}
