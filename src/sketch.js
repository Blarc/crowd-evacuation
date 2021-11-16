let quadTree;
const vObjects = [];
const walls = [];

let baseVector;
let pause = false;
let goal;

function setup(){
    createCanvas(Config.windowWidth, Config.windowHeight);
    baseVector = createVector(1, 0);
    goal = createVector(random(50, width - 50), random(50, height - 50))

    // Create quadtree as big as the room
    quadTree = QuadTree.create();

    let speedIO = new IOSpeed(0.2, 0.5);
    let angleIO = new IOAngle(-10, -5, 5, 10);
    let distanceIO = new IODistance(Config.visionSize, Config.visionSize);
    let obstacleAvoidance = new ObstacleAvoidance(speedIO, angleIO, distanceIO);
    let goalSeeking = new GoalSeeking(speedIO, angleIO, distanceIO);

    for (let i = 0; i < Config.numberOfObjects; i++) {
        let x = random(50, width - 50);
        let y = random(50, height - 50);

        let vObject = new VHuman(x, y, Config.visionSize, obstacleAvoidance, goalSeeking);
        vObjects.push(vObject);
    }

    this.createWallBoundaries();
}

function createWallBoundaries() {

    // place bricks top-down
    for (let y = 0; y <= height - Config.blockSize; y += Config.blockSize) {
        let wallLeft = new VBlock(Config.blockSize / 2, y + Config.blockSize / 2);
        let wallRight = new VBlock(width - Config.blockSize / 2, y + Config.blockSize / 2);
        walls.push(wallLeft, wallRight);
    }

    for (let x = 0; x <= width - Config.blockSize; x += Config.blockSize) {
        let wallTop = new VBlock(x + Config.blockSize / 2, Config.blockSize / 2);
        let wallBottom = new VBlock(x + Config.blockSize / 2, height - Config.blockSize / 2);
        walls.push(wallTop, wallBottom);
    }
}

function draw() {
    quadTree = QuadTree.create();

    background(51);

    for (let vObject of vObjects) {
        let point = new Point(vObject.pos.x, vObject.pos.y, vObject);
        quadTree.insert(point);
    }

    for (let vWall of walls) {
        vWall.show();

        let point = new Point(vWall.pos.x, vWall.pos.y, vWall);
        quadTree.insert(point);
    }

    for (let vObject of vObjects) {
        vObject.show();
        vObject.update();
    }

    showGoal();
}

function mousePressed() {
    goal = createVector(mouseX, mouseY);
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

function showGoal() {
    fill(0, 255, 0);
    noStroke();
    ellipse(goal.x, goal.y, 10);
}
