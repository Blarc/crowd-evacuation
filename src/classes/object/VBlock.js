class VBlock extends VObject{

    constructor(x, y, color = Config.basicWallColor, isOuterWall = false) {
        super(x, y, color);
        this.rect = new VRect(this.pos, Config.blockSize, Config.blockSize);
        this.isOuterWall = isOuterWall;
    }

    show() {
        this.rect.show(this.color);
    }

    toJSON() {
        return {
            pos: {x: this.pos.x, y: this.pos.y, isOuterWall: this.isOuterWall}
        }
    }

}
