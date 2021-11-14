let quadTree;
const vObjects = [];

let baseVector;
let pause = false;

function setup(){
    createCanvas(600, 400);
    baseVector = createVector(1, 0);

    // Create quadtree as big as the room
    quadTree = QuadTree.create();

    let speedIO = new IOSpeed(0.2, 0.5);
    let angleIO = new IOAngle(-10, -5, 5, 10);
    let distanceIO = new IODistance(Config.visionSize, Config.visionSize);
    let obstacleAvoidance = new ObstacleAvoiding(speedIO, angleIO, distanceIO);

    for (let i = 0; i < Config.numberOfObjects; i++) {
        let x = random(50, width - 50);
        let y = random(50, height - 50);

        let vObject = new VObject(x, y, Config.objectSize, Config.visionSize, obstacleAvoidance);
        vObjects.push(vObject);
    }
}

function draw() {
    quadTree = QuadTree.create();

    background(51);

    for (let vObject of vObjects) {
        let point = new Point(vObject.pos.x, vObject.pos.y, vObject);
        quadTree.insert(point);
    }

    for (let vObject of vObjects) {
        vObject.show();
        vObject.update();
    }
}

function mousePressed() {
    // TODO
}

function keyPressed() {
    // pause/unpause if space is pressed
    if (keyCode === 32) {
        pause ? loop() : noLoop();
        pause = !pause;
    }
}

function windowResized() {
    // TODO
}
