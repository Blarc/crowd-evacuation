let quadTree;
let vObjects = [];
let walls = [];
let createdWalls = new Set();

let globalGoal;
let pause = false;
let evacuationMode = false;
let currentSimulation;

let globalSavedPeopleCounter = 0;
let globalDeathTollCounter = 0;
let numberOfPedestrians = 0;
let numberOfAssailants = 0;

let mouseMode;

// Dom elements
let canvas, sizeSlider, fileUploader, fileReader, widthInput, heightInput, sizeButton;

let obstacleAvoidance, pathSearching, goalSeeking, integrationOfMultipleBehaviours;

let curPedestrianPosition = undefined;

function createUI() {
    let w = windowWidth * 0.6;
    let h = windowHeight * 0.4;
    canvas = createCanvas(w - w % Config.blockSize, h - h % Config.blockSize);
    canvas.parent('canvas');

    sizeSlider = createSlider(1,10,1,1);
    sizeSlider.parent('size');
    sizeSlider.style('width', '80px');

    fileUploader = document.getElementById('upload');
    fileUploader.addEventListener('change', uploadMap, false);

    fileReader = new FileReader();
    fileReader.addEventListener('load', readFile, false);

    widthInput = document.getElementById('width')
    heightInput = document.getElementById('height')
    sizeButton = document.getElementById('sizeButton')
    sizeButton.addEventListener('click', onSizeChange, false)
}

function setup(){

    createUI();
    setInterval(() => {
        document.getElementById('frames').innerHTML = round(frameRate(), 2);
        document.getElementById('survivors_count').innerHTML = globalSavedPeopleCounter;
        document.getElementById('killed_count').innerHTML = globalDeathTollCounter;
        document.getElementById('num_pedestrians').innerHTML = numberOfPedestrians;
        document.getElementById('num_assailants').innerHTML = numberOfAssailants;
        document.getElementById('pause_resume').innerHTML = pause ? "Resume" : "Pause";
        document.getElementById('show_hide_pedestrian').innerHTML = Config.showPedestrianArcs ? "Hide" : "Show";
        document.getElementById('show_hide_assailant').innerHTML = Config.showAssailantArcs ? "Hide" : "Show";
        document.getElementById('use_global_and_local_goals').innerHTML = Config.useGlobalAndLocalGoals ? "Unfollow global and local goals: <strong>U</strong>" : "Follow global and local goals: <strong>U</strong>";
    }, 200);


    mouseMode = ModeEnum.SET_GOAL;
    globalGoal = createVector(random(50, width - 50), random(50, height - 50))

    // Create quadtree as big as the room
    quadTree = QuadTree.create();

    let deltaIO = new IOdelta(0.2, 0.4, 0.8);
    let speedIO = new IOSpeed(0.3, 0.5, 0.8);
    let angleIO = new IOAngle(-50, -20, 20, 50);
    let distanceIO = new IODistance(Config.visionSize / 2.5, Config.visionSize);
    let pathSearchingIO = new IOPathSearching(0.0, 1.0, 15, 0.05, 15, 0.4, 0.9);
    let panicCoefficientsIO = new IOPanicCoefficients(0.5, 0.9, 0.9);

    obstacleAvoidance = new ObstacleAvoidance(speedIO, angleIO, distanceIO);
    pathSearching = new PathSearching(speedIO, angleIO, distanceIO, pathSearchingIO, panicCoefficientsIO);
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
    numberOfPedestrians = 0;
    numberOfAssailants = 0;
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
        if (vObject instanceof VHuman) {
            if (vObject.isAssailant) {
                numberOfAssailants += 1;
            } else if (vObject.isAlive) {
                numberOfPedestrians += 1;
            }
        }

        vObject.show();
        !pause && vObject.update();
    }

    drawMouse();
    showGoal();
}

function mousePressed() {
    if (isMouseInBounds(2 * Config.blockSize) && mouseIsPressed) {
        switch (mouseMode) {
            case ModeEnum.SET_GOAL:
                globalGoal = createVector(mouseX, mouseY);
                return;

            case ModeEnum.DRAW_PEDESTRIAN_WITH_GOAL:
                if (curPedestrianPosition !== undefined) {
                    vObjects.push(
                        new VHuman(
                            curPedestrianPosition.x,
                            curPedestrianPosition.y,
                            Config.visionSize,
                            obstacleAvoidance,
                            goalSeeking,
                            pathSearching,
                            integrationOfMultipleBehaviours,
                            mouseX, mouseY)
                        );
                    curPedestrianPosition = undefined;
                } else {
                    curPedestrianPosition = createVector(mouseX, mouseY);
                }
                return;

            case ModeEnum.DRAW_PEDESTRIANS:
                vObjects.push(
                    new VHuman(
                        mouseX,
                        mouseY,
                        Config.visionSize,
                        obstacleAvoidance,
                        goalSeeking,
                        pathSearching,
                        integrationOfMultipleBehaviours
                    )
                );
                return;

            case ModeEnum.DRAW_ASSAILANTS:
                evacuationMode = true;
                vObjects.push(
                        new VHuman(
                        mouseX,
                        mouseY,
                        Config.visionSize,
                        obstacleAvoidance,
                        goalSeeking,
                        pathSearching,
                        integrationOfMultipleBehaviours,
                        -1,
                        -1,
                        true
                    )
                );
                return;
        }
    }
}

function keyPressed() {
    switch (keyCode) {
        // SPACE - pause
        case 32:
            pause = !pause;
            return;
        // A - draw assailants
        case 65:
            mouseMode = ModeEnum.DRAW_ASSAILANTS;
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
        // K - show/hide pedestrian arcs
        case 75:
            Config.showAssailantArcs = !Config.showAssailantArcs;
            return;
        // P - draw pedestrians
        case 80:
            mouseMode = ModeEnum.DRAW_PEDESTRIANS;
            return;
        // R - reset simulation
        case 82:
            setSimulation();
            return;
        // U - follow unfollow global and local goals when not in pannic
        case 85:
            Config.useGlobalAndLocalGoals = !Config.useGlobalAndLocalGoals;
            return;
        // V - show/hide pedestrian arcs
        case 86:
            Config.showPedestrianArcs = !Config.showPedestrianArcs;
            return;
        // S - save
        case 83:
            downloadMap();
            return;
    }
}

function windowResized() {
    // TODO
}

function showGoal() {
    fill(0, 255, 0);
    noStroke();
    ellipse(globalGoal.x, globalGoal.y, 10);
}

function isMouseInBounds(padding) {
    return padding < mouseX &&
    mouseX < width - padding &&
        padding < mouseY &&
    mouseY < height - padding
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
                    if (object instanceof VHuman && vObjects.includes(object)) {
                        vObjects.splice(vObjects.indexOf(object), 1);
                    }
                }
            }

            return;

        case ModeEnum.DRAW_OBSTACLES:

            let size = sizeSlider.value();

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

            if (isMouseInBounds(Config.blockSize) && mouseIsPressed) {
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
        let wallLeft = new VBlock(Config.blockSize / 2, y + Config.blockSize / 2, Config.basicWallColor, true);
        let wallRight = new VBlock(width - Config.blockSize / 2, y + Config.blockSize / 2, Config.basicWallColor, true);
        walls.push(wallLeft, wallRight);
    }

    for (let x = 0; x <= width - Config.blockSize; x += Config.blockSize) {
        let wallTop = new VBlock(x + Config.blockSize / 2, Config.blockSize / 2, Config.basicWallColor, true);
        let wallBottom = new VBlock(x + Config.blockSize / 2, height - Config.blockSize / 2, Config.basicWallColor, true);
        walls.push(wallTop, wallBottom);
    }
}

function downloadMap() {
    let data = JSON.stringify({width: width, height: height, walls: [...createdWalls], vObjects, globalGoalX: globalGoal.x, globalGoalY: globalGoal.y, useGlobalAndLocalGoals: Config.useGlobalAndLocalGoals, showAssailantArcs: Config.showAssailantArcs, showPedestrianArcs: Config.showPedestrianArcs});
    let a = document.createElement('a');
    let file = new Blob([data], {type: 'application/json'});
    a.href = URL.createObjectURL(file);
    a.download = 'save.json';
    a.click();
}

function uploadMap() {
    let file = fileUploader.files[0]
    if (file.type === 'application/json') {
        fileReader.readAsText(file);
    }
}

function readFile(e) {
    currentSimulation = JSON.parse(e.target.result);
    setSimulation();
    fileUploader.value = null;
}

function setSimulation() {
    pause = true;
    evacuationMode = false;
    globalSavedPeopleCounter = 0;
    globalDeathTollCounter = 0;

    if (!currentSimulation) {
        return;
    }

    setSize(currentSimulation.width, currentSimulation.height);
    currentSimulation.vObjects.forEach(vObject => {
        vObjects.push(
            new VHuman(
                vObject.pos.x,
                vObject.pos.y,
                Config.visionSize,
                obstacleAvoidance,
                goalSeeking,
                pathSearching,
                integrationOfMultipleBehaviours,
                vObject.goal ? vObject.goal.x : -1,
                vObject.goal ? vObject.goal.y : -1,
                vObject.isAssailant
            )
        );

        if (vObject.isAssailant) {
            evacuationMode = true;
        }
    });

    currentSimulation.walls.forEach(wall => {
        let tmp = new VBlock(wall.pos.x, wall.pos.y, Config.basicWallColor, wall.isOuterWall);
        createdWalls.add(tmp);
    })

    globalGoal = createVector(currentSimulation.globalGoalX, currentSimulation.globalGoalY);

    Config.useGlobalAndLocalGoals = currentSimulation.useGlobalAndLocalGoals;
    Config.showAssailantArcs = currentSimulation.showAssailantArcs;
    Config.showPedestrianArcs = currentSimulation.showPedestrianArcs;
}

function onSizeChange(e) {
    if (widthInput.value && heightInput.value && widthInput.value <= 3000 && heightInput.value <= 3000) {
        setSize(parseInt(widthInput.value), parseInt(heightInput.value));
    }
}

function setSize(newWidth, newHeight) {
    resizeCanvas(newWidth, newHeight);
    walls = [];
    createdWalls = new Set();
    vObjects = [];
    globalGoal = createVector(random(50, width - 50), random(50, height - 50))
    createWallBoundaries();
}
