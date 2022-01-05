let quadTree;

let walls = [];
let vObjects = new Set();
let vKilledObjects = new Set();
let createdWalls = new Set();

let globalGoal;
let pause = false;
let evacuationMode = false;
let currentSimulation;

let showPedestrianArcs = true;
let showAssailantArcs = true;
let useGlobalAndLocalGoals = true;
let showLines = false;

let globalSavedPeopleCounter = 0;
let numberOfPedestrians = 0;
let numberOfAssailants = 0;

let startTime = 0;
let pauseTime = 0;

let mouseMode;
let runSimulations = false
let simulation = []
let simulations = []

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

    document.getElementById('run_simulation').addEventListener('input', e => {
        runSimulations = !runSimulations;
    })

    setInterval(() => {
        document.getElementById('frames').innerHTML = round(frameRate(), 2);
        document.getElementById('survivors_count').innerHTML = globalSavedPeopleCounter;
        document.getElementById('killed_count').innerHTML = vKilledObjects.size;
        document.getElementById('num_pedestrians').innerHTML = vObjects.size - numberOfAssailants;
        document.getElementById('num_assailants').innerHTML = numberOfAssailants;
        document.getElementById('time').innerHTML = pause ?  round(pauseTime / 1000, 2) : round((millis() - (startTime - pauseTime)) / 1000, 2);
        document.getElementById('pause_resume').innerHTML = pause ? "Resume" : "Pause";
        document.getElementById('show_hide_pedestrian').innerHTML = showPedestrianArcs ? "Hide" : "Show";
        document.getElementById('show_hide_assailant').innerHTML = showAssailantArcs ? "Hide" : "Show";
        document.getElementById('use_global_and_local_goals').innerHTML = useGlobalAndLocalGoals ? "Unfollow global and local goals: <strong>U</strong>" : "Follow global and local goals: <strong>U</strong>";
    }, 300);

    setInterval(() => {
        if (runSimulations && !pause) {
            simulation.push({
                numberOfPedestrians: (vObjects.size - numberOfAssailants),
                numberOfAssailants,
                killed: vKilledObjects.size,
                saved: globalSavedPeopleCounter
            })
        }
    }, 1000)


    mouseMode = ModeEnum.SET_GOAL;
    globalGoal = createVector(random(50, width - 50), random(50, height - 50))

    // Create quadtree as big as the room
    quadTree = QuadTree.create();

    let deltaIO = new IOdelta(0.2, 0.4, 0.8);
    let speedIO = new IOSpeed(0.3, 0.5, 0.8);
    let angleIO = new IOAngle(-50, -20, 20, 50);
    let distanceIO = new IODistance(Config.visionSize / 3.0, Config.visionSize);
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
        vObjects.add(vObject);
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

    for (let vKilledObject of vKilledObjects) {
        vKilledObject.show();
    }

    numberOfAssailants = 0;
    for (let vObject of vObjects) {
        if (vObject instanceof VHuman) {
            if (vObject.isAssailant) {
                numberOfAssailants += 1;
            }
        }

        vObject.show();
        !pause && vObject.update();
    }

    if (vObjects.size === numberOfAssailants && !pause) {
        if (runSimulations) {
            simulations.push(simulation);
            simulation = []
            setSimulation();
            console.log(simulations)
        }
        else {
            pauseIt();
        }
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
                    vObjects.add(
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
                vObjects.add(
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
                vObjects.add(
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

function pauseIt() {
    pause = true;
    pauseTime = millis() - (startTime - pauseTime);
}

function unpauseIt() {
    pause = false;
    startTime = millis();
}

function clearSimulation() {
    createdWalls = new Set();
    vObjects = new Set();
    vKilledObjects = new Set();
    startTime = 0;
    pauseTime = 0;
    evacuationMode = false;
    globalSavedPeopleCounter = 0;
}

function keyPressed() {
    switch (keyCode) {
        // SPACE - pause
        case 32:
            pause ? unpauseIt() : pauseIt()
            return;
        // A - draw assailants
        case 65:
            mouseMode = ModeEnum.DRAW_ASSAILANTS;
            return;
        // C - reset
        case 67:
            clearSimulation();
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
            showAssailantArcs = !showAssailantArcs;
            return;
        // P - draw pedestrians
        case 80:
            mouseMode = ModeEnum.DRAW_PEDESTRIANS;
            return;
        // R - reset simulation
        case 82:
            setSimulation();
            return;
        // T - download simulations
        case 84:
            downloadSimulations();
            return;
        // U - follow unfollow global and local goals when not in pannic
        case 85:
            useGlobalAndLocalGoals = !useGlobalAndLocalGoals;
            return;
        // V - show/hide pedestrian arcs
        case 86:
            showPedestrianArcs = !showPedestrianArcs;
            return;
        // S - save
        case 83:
            downloadMap();
            return;
    }
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
                    if (object instanceof VHuman && vObjects.has(object)) {
                        vObjects.delete(object);
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

                        let newBlock = new VBlock(x + i * Config.blockSize, y + j * Config.blockSize, Config.createdWallColor);
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

function downloadSimulations() {
    let data = JSON.stringify(simulations);
    download(data, 'simulations.json');
}

function downloadMap() {
    let data = JSON.stringify({width: width, height: height, walls: [...createdWalls], vObjects: [...vObjects], globalGoalX: globalGoal.x, globalGoalY: globalGoal.y, useGlobalAndLocalGoals: useGlobalAndLocalGoals, showAssailantArcs: showAssailantArcs, showPedestrianArcs: showPedestrianArcs});
    download(data, 'save.json');
}

function download(data, name) {
    let a = document.createElement('a');
    let file = new Blob([data], {type: 'application/json'});
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.click();
}

function uploadMap() {
    let file = fileUploader.files[0]
    if (file.type === 'application/json') {
        fileReader.readAsText(file);
    }
    simulations = []
}

function readFile(e) {
    currentSimulation = JSON.parse(e.target.result);
    setSimulation();
    fileUploader.value = null;
}

function setSimulation() {
    clearSimulation();

    if (!currentSimulation) {
        return;
    }

    setSize(currentSimulation.width, currentSimulation.height);
    currentSimulation.vObjects.forEach(vObject => {
        vObjects.add(
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
        let tmp = new VBlock(wall.pos.x, wall.pos.y, Config.createdWallColor, wall.isOuterWall);
        createdWalls.add(tmp);
    })

    globalGoal = createVector(currentSimulation.globalGoalX, currentSimulation.globalGoalY);

    useGlobalAndLocalGoals = currentSimulation.useGlobalAndLocalGoals;
    showAssailantArcs = currentSimulation.showAssailantArcs;
    showPedestrianArcs = currentSimulation.showPedestrianArcs;
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
    vObjects = new Set();
    globalGoal = createVector(random(50, width - 50), random(50, height - 50))
    createWallBoundaries();
}
