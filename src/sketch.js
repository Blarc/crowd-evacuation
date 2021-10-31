const vObjects = [];
let baseVector;

function setup(){
    createCanvas(800, 600);
    baseVector = createVector(1, 0);

    for (let i = 0; i < 20; i++) {
        vObjects.push(new VObject())
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
