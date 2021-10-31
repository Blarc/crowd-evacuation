const vObjects = [];
let baseVector;

function setup(){
    createCanvas(800, 600);
    baseVector = createVector(1, 0);
    vObjects.push(new VObject())
}

function draw() {
    background(51);

    for (let vObject of vObjects) {
        vObject.show()
        vObject.update()
    }
}

function mousePressed() {
    // TODO
}

function windowResized() {
    // TODO
}
