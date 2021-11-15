class VWall {

    constructor(x, y, width, height, color = Config.basicWallColor) {
        this.pos = createVector(x, y);
        this.width = width;
        this.height = height;
        this.color = color;
    }

    show() {
        fill(this.color);
        stroke(255);
        rectMode(CENTER);
        rect(this.pos.x, this.pos.y, this.width, this.height);

        if (Config.showLines) {
            let w = this.width;
            let h = this.height;

            //rectangle lines
            let upperLine = new VLine(createVector(this.pos.x - w / 2, this.pos.y - h / 2), createVector(this.pos.x + w / 2, this.pos.y - h / 2));
            let leftLine = new VLine(createVector(this.pos.x - w / 2, this.pos.y - h / 2), createVector(this.pos.x - w / 2, this.pos.y + h / 2));
            let rightLine = new VLine(createVector(this.pos.x + w / 2, this.pos.y - h / 2), createVector(this.pos.x + w / 2, this.pos.y + h / 2));
            let bottomLine = new VLine(createVector(this.pos.x - w / 2, this.pos.y + h / 2), createVector(this.pos.x + w / 2, this.pos.y + h / 2));

            upperLine.show();
            leftLine.show();
            rightLine.show();
            bottomLine.show();
        } 
    }

}