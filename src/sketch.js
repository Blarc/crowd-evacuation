let quadTree;
const vObjects = [];
const walls = [];
let createdWalls = new Set();

let baseVector;
let pause = false;
let goal;

let mouseMode;
let blockSize;
let visionSize;

function setup(){
    let canvas = createCanvas(
        Math.ceil(windowWidth * Config.windowWidthRatio),
        Math.ceil(windowHeight * Config.windowHeightRatio)
    );
    canvas.parent('canvas');

    blockSize = convertSize(Config.blockSize);
    visionSize = convertSize(Config.visionSize);

    mouseMode = ModeEnum.SET_GOAL;
    baseVector = createVector(1, 0);
    goal = createVector(random(50, width - 50), random(50, height - 50))

    // Create quadtree as big as the room
    quadTree = QuadTree.create();

    let speedIO = new IOSpeed(0.2, 0.5);
    let angleIO = new IOAngle(-60, -30, 30, 60);
    let distanceIO = new IODistance(visionSize, visionSize);
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
        let point = new Point(vWall.pos.x, vWall.pos.y, vWall);
        quadTree.insert(point);
        vWall.show();
    }

    for (let cWall of createdWalls) {
        let point = new Point(cWall.pos.x, cWall.pos.y, cWall);
        quadTree.insert(point);
        cWall.show();
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
        // SPACE - pause
        case 32:
            pause ? loop() : noLoop();
            pause = !pause;
            return;
        // C - clear
        case 67:
            createdWalls = new Set();
            return;
        // D - draw
        case 68:
            mouseMode = ModeEnum.DRAW;
            return;
        // E - eraser
        case 69:
            mouseMode = ModeEnum.ERASE;
            return;
        // G - set goal
        case 71:
            mouseMode = ModeEnum.SET_GOAL;
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
            if (blockSize * 2 < mouseX &&
                mouseX < width - blockSize * 2 &&
                blockSize * 2 < mouseY &&
                mouseY < height - blockSize * 2 &&
                mouseIsPressed
            ) {
                goal = createVector(mouseX, mouseY);
            }
            return;

        case ModeEnum.DRAW:

            fill(255, 255, 255, 150);
            noStroke();
            rect(mouseX, mouseY, blockSize, blockSize);

            if (blockSize < mouseX &&
                mouseX < width - blockSize &&
                blockSize < mouseY &&
                mouseY < height - blockSize &&
                mouseIsPressed
            ) {
                createdWalls.add(new VBlock(mouseX, mouseY, true));
            }
            return;

        case ModeEnum.ERASE:

            fill(255, 255, 255, 150);
            noStroke();
            ellipse(mouseX, mouseY, 30);

            if (mouseIsPressed) {
                let points = quadTree.query(new Circle(mouseX, mouseY, 15));
                for (let point of points) {
                    let object = point.userData;
                    if (object instanceof VBlock && createdWalls.has(object)) {
                        createdWalls.delete(object);
                    }
                }
            }
    }
}

function createWallBoundaries() {

    // place bricks top-down
    for (let y = 0; y <= height - blockSize; y += blockSize) {
        let wallLeft = new VBlock(blockSize / 2, y + blockSize / 2);
        let wallRight = new VBlock(width - blockSize / 2, y + blockSize / 2);
        walls.push(wallLeft, wallRight);
    }

    for (let x = 0; x <= width - blockSize; x += blockSize) {
        let wallTop = new VBlock(x + blockSize / 2, blockSize / 2);
        let wallBottom = new VBlock(x + blockSize / 2, height - blockSize / 2);
        walls.push(wallTop, wallBottom);
    }
}
