let quadTree;
const vObjects = [];
const vWalls = [];

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

        let vObject = new VObject(x, y, Config.objectSize, Config.visionSize, obstacleAvoidance, null);
        vObjects.push(vObject);
    }

    this.createWallBoundaries();
}

function createWallBoundaries() {

    // place bricks top-down
    let curHeightPos = 0;
    while (curHeightPos <= Config.windowHeight - Config.basicWallBrickHeight) {
        let vWallLeft = new VWall(0 + Config.basicWallBrickWidth / 2, curHeightPos + Config.basicWallBrickHeight / 2, Config.basicWallBrickWidth, Config.basicWallBrickHeight);
        let vWallRight = new VWall(Config.windowWidth - Config.basicWallBrickWidth + Config.basicWallBrickWidth / 2, curHeightPos + Config.basicWallBrickHeight / 2, Config.basicWallBrickWidth, Config.basicWallBrickHeight);
        vWalls.push(vWallLeft);
        vWalls.push(vWallRight);

        curHeightPos += Config.basicWallBrickHeight;
    }

    // place bricks left-right
    let curWidthPos = 0;
    while (curWidthPos <= Config.windowWidth - Config.basicWallBrickWidth) {
        let vWallTop = new VWall(curWidthPos + Config.basicWallBrickWidth / 2, 0 + Config.basicWallBrickHeight / 2, Config.basicWallBrickWidth, Config.basicWallBrickHeight);
        let vWallBottom = new VWall(curWidthPos + Config.basicWallBrickWidth / 2, Config.windowHeight - Config.basicWallBrickHeight + Config.basicWallBrickHeight / 2, Config.basicWallBrickWidth, Config.basicWallBrickHeight);
        vWalls.push(vWallTop);
        vWalls.push(vWallBottom);

        curWidthPos += Config.basicWallBrickWidth;
    }

}

function draw() {
    quadTree = QuadTree.create();

    background(51);

    for (let vObject of vObjects) {
        let point = new Point(vObject.pos.x, vObject.pos.y, vObject);
        quadTree.insert(point);
    }

    for (let vWall of vWalls) {
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

function showGoal() {
    fill(0, 255, 0);
    noStroke();
    ellipse(goal.x, goal.y, 10);
}
