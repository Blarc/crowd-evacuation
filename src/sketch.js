let quadTree;
const vObjects = [];
const walls = [];
let createdWalls = new Set();

let baseVector;
let pause = false;
let goal;

let mouseMode;

let sizeSlider;

function createUI() {
    let w = windowWidth * 0.8;
    let h = windowHeight * 0.5;
    let canvas = createCanvas(w - w % Config.blockSize, h - h % Config.blockSize);
    canvas.parent('canvas');

    sizeSlider = createSlider(1,10,1,1);
    sizeSlider.parent('size');
    sizeSlider.style('width', '80px');
}

function setup(){

    createUI();
    setInterval(() => {
        document.getElementById('frames').innerHTML = round(frameRate(), 2);
    }, 200);


    mouseMode = ModeEnum.SET_GOAL;
    baseVector = createVector(1, 0);
    goal = createVector(random(50, width - 50), random(50, height - 50))

    // Create quadtree as big as the room
    quadTree = QuadTree.create();

    let deltaIO = new IOdelta(0.1, 0.4, 1.0);
    let speedIO = new IOSpeed(0.3, 0.5);
    let angleIO = new IOAngle(-20, -10, 10, 20);
    let distanceIO = new IODistance(Config.visionSize / 2.0, Config.visionSize);
    let pathSearchingIO = new IOPathSearching(0.0, 1.0, 15, 0.2, 15, 0.4, 0.9);

    let obstacleAvoidance = new ObstacleAvoidance(speedIO, angleIO, distanceIO);
    let pathSearching = new PathSearching(speedIO, angleIO, distanceIO, pathSearchingIO);
    let goalSeeking = new GoalSeeking(speedIO, angleIO, distanceIO);
    let integrationOfMultipleBehaviours = new IntegrationOfMultipleBehaviours(speedIO, angleIO, distanceIO, deltaIO, pathSearchingIO.NEGATIVE_ENERGY_BARRIER);

    for (let i = 0; i < Config.numberOfObjects; i++) {
        let x = random(50, width - 50);
        let y = random(50, height - 50);

        let vObject = new VHuman(x, y, Config.visionSize, obstacleAvoidance, goalSeeking, pathSearching, integrationOfMultipleBehaviours);
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

            let size = sizeSlider.value();

            console.log(size);
            let x = mouseX - mouseX % (Config.blockSize * size) + Config.blockSize / 2;
            let y = mouseY - mouseY % (Config.blockSize * size) + Config.blockSize / 2;

            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    fill(255, 255, 255, 150);
                    noStroke();
                    rectMode(CENTER);
                    rect(x + i * Config.blockSize, y + j * Config.blockSize, Config.blockSize, Config.blockSize);
                }
            }

            if (Config.blockSize < mouseX &&
                mouseX < width - Config.blockSize &&
                Config.blockSize < mouseY &&
                mouseY < height - Config.blockSize &&
                mouseIsPressed
            ) {
                for (let i = 0; i < size; i++) {
                    for (let j = 0; j < size; j++) {
                        createdWalls.add(new VBlock(x + i * Config.blockSize, y + j * Config.blockSize, [255, 0, 0]));
                    }
                }
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
