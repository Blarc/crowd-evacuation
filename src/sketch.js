let quadTree;
let vObjects = [];
const walls = [];
let createdWalls = new Set();

let baseVector;
let pause = false;
let goal;

let mouseMode;

let sizeSlider;

let obstacleAvoidance, pathSearching, goalSeeking, integrationOfMultipleBehaviours;

let curPedestrianPosition = undefined;

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

    obstacleAvoidance = new ObstacleAvoidance(speedIO, angleIO, distanceIO);
    pathSearching = new PathSearching(speedIO, angleIO, distanceIO, pathSearchingIO);
    goalSeeking = new GoalSeeking(speedIO, angleIO, distanceIO);
    integrationOfMultipleBehaviours = new IntegrationOfMultipleBehaviours(speedIO, angleIO, distanceIO, deltaIO, pathSearchingIO.NEGATIVE_ENERGY_BARRIER);

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
        !pause && vObject.update();
    }

    drawMouse();
    showGoal();
}

function mousePressed() {
    // Empty
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

        case ModeEnum.DRAW_PEDESTRIAN_WITH_GOAL:

            if (Config.blockSize * 2 < mouseX &&
                mouseX < width - Config.blockSize * 2 &&
                Config.blockSize * 2 < mouseY &&
                mouseY < height - Config.blockSize * 2 &&
                mouseIsPressed
            ) {

                if (curPedestrianPosition != undefined) {
                    let vObject = new VHuman(curPedestrianPosition.x, curPedestrianPosition.y, Config.visionSize, obstacleAvoidance, goalSeeking, pathSearching, integrationOfMultipleBehaviours, mouseX, mouseY);
                    vObjects.push(vObject);
                    curPedestrianPosition = undefined;
                } else {
                    curPedestrianPosition = createVector(mouseX, mouseY);
                }

            }
            return;

        case ModeEnum.DRAW_PEDESTRIANS:
            if (Config.blockSize * 2 < mouseX &&
                mouseX < width - Config.blockSize * 2 &&
                Config.blockSize * 2 < mouseY &&
                mouseY < height - Config.blockSize * 2 &&
                mouseIsPressed
            ) {

                let vObject = new VHuman(mouseX, mouseY, Config.visionSize, obstacleAvoidance, goalSeeking, pathSearching, integrationOfMultipleBehaviours);
                vObjects.push(vObject);

            }
            return;
    }
}

function keyPressed() {
    switch (keyCode) {
        // SPACE - pause
        case 32:
            pause = !pause;
            return;
        // P - draw pedestrians
        case 80:
            mouseMode = ModeEnum.DRAW_PEDESTRIANS;
            return;
        // C - clear
        case 67:
            createdWalls = new Set();
            vObjects = [];
            return;
        // D - draw
        case 68:
            mouseMode = ModeEnum.DRAW_OBSTACLES;
            return;
        // E - eraser
        case 69:
            mouseMode = ModeEnum.ERASE;
            return;
        // G - set goal
        case 71:
            mouseMode = ModeEnum.SET_GOAL;
            return;
        // I - draw pedestrian with goal
        case 73:
            mouseMode = ModeEnum.DRAW_PEDESTRIAN_WITH_GOAL;
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

            return;

        case ModeEnum.DRAW_OBSTACLES:

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

                        let newBlock = new VBlock(x + i * Config.blockSize, y + j * Config.blockSize, [255, 0, 0]);
                        let isOnSamePositionAsOneOfExistingBlocks = false;
                        for (let block of createdWalls) {
                            if (block.rect.hasSamePosition(newBlock)) {
                                isOnSamePositionAsOneOfExistingBlocks = true;
                                break;
                            }
                        }
                        !isOnSamePositionAsOneOfExistingBlocks && createdWalls.add(newBlock);
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
