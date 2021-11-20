let quadTree;
const vObjects = [];
const walls = [];

let baseVector;
let pause = false;
let goal;

let mouseMode;

function setup(){
    let canvas = createCanvas(windowWidth*0.8, windowHeight*0.5);
    canvas.parent('canvas');

    mouseMode = ModeEnum.SET_GOAL;
    baseVector = createVector(1, 0);
    goal = createVector(random(50, width - 50), random(50, height - 50))

    // Create quadtree as big as the room
    quadTree = QuadTree.create();

    let speedIO = new IOSpeed(0.2, 0.5);
    let angleIO = new IOAngle(-60, -30, 30, 60);
    let distanceIO = new IODistance(Config.visionSize, Config.visionSize);
    let pathSearchingIO = new IOPathSearching(0.2, 1.0, 15, 0.2, 15, 0.4, 0.9);
    let obstacleAvoidance = new ObstacleAvoidance(speedIO, angleIO, distanceIO);
    let pathSearching = new PathSearching(speedIO, angleIO, distanceIO, pathSearchingIO);
    let goalSeeking = new GoalSeeking(speedIO, angleIO, distanceIO);

    for (let i = 0; i < Config.numberOfObjects; i++) {
        let x = random(50, width - 50);
        let y = random(50, height - 50);

        let vObject = new VHuman(x, y, Config.visionSize, obstacleAvoidance, goalSeeking, pathSearching);
        vObjects.push(vObject);
    }

    this.createWallBoundaries();
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

    drawMouse();
    showGoal();
}

function mousePressed() {
    // Empty
}

function keyPressed() {
    console.log(keyCode);
    switch (keyCode) {
        // space
        case 32:
            pause ? loop() : noLoop();
            pause = !pause;
            return;
        // D
        case 68:
            mouseMode = ModeEnum.DRAW;
            return;
        // G
        case 71:
            mouseMode = ModeEnum.SET_GOAL;
            return;
        // R
        case 82:
            mouseMode = ModeEnum.REMOVE;
            return;
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

function drawMouse() {

    switch (mouseMode) {
        case ModeEnum.SET_GOAL:
            if (Config.blockSize * 2 < mouseX &&
                mouseX < width - Config.blockSize * 2 &&
                Config.blockSize * 2 < mouseY &&
                mouseY < height - Config.blockSize * 2 &&
                mouseIsPressed
            ) {
                goal = createVector(mouseX, mouseY);
            }
            return;

        case ModeEnum.DRAW:

            fill(255, 255, 255, 150);
            noStroke();
            rect(mouseX, mouseY, Config.blockSize, Config.blockSize);

            if (Config.blockSize < mouseX &&
                mouseX < width - Config.blockSize &&
                Config.blockSize < mouseY &&
                mouseY < height - Config.blockSize &&
                mouseIsPressed
            ) {
                walls.push(new VBlock(mouseX, mouseY, true));
            }
            return;

        case ModeEnum.REMOVE:

            fill(255, 255, 255, 150);
            noStroke();
            ellipse(mouseX, mouseY, 30);

            if (mouseIsPressed) {
                let points = quadTree.query(new Circle(mouseX, mouseY, 15));
                for (let point of points) {
                    let object = point.userData;
                    if (object instanceof VBlock && object.deletable) {
                        walls.splice(walls.indexOf(object), 1);
                    }
                }
            }
    }
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
