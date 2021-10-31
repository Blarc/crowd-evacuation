class VObject {

    constructor() {
        this.position = createVector(width / 2, height / 2);
        this.velocity = p5.Vector.random2D();
        this.acceleration = createVector(0, 0);
        this.angle = degrees(baseVector.angleBetween(this.velocity));
    }

    update() {
        this.checkBoundaries()
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.angle = degrees(baseVector.angleBetween(this.velocity));

    }

    show() {
        strokeWeight(14);
        stroke(255);
        point(this.position.x, this.position.y);

        strokeWeight(0)
        fill(255, 0, 0)
        arc(
            this.position.x,
            this.position.y,
            100,
            100,
            radians(this.angle - 30),
            radians(this.angle + 30)
        )
    }

    checkBoundaries() {
        if (this.position.x <= 0 ||
            this.position.x >= width ||
            this.position.y <= 0 ||
            this.position.y >= height
        ) {
            this.velocity = createVector(-this.velocity.x, -this.velocity.y);
        }
    }
}
