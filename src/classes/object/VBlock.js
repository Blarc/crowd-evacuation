class VBlock extends VObject{

    constructor(x, y, color = Config.basicWallColor) {
        super(x, y, color);
        this.rect = new VRect(this.pos, Config.blockSize, Config.blockSize);
    }

    show() {
        this.rect.show(Config.basicWallColor);
    }

}
