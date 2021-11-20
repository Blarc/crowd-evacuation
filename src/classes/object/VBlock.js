class VBlock extends VObject{

    constructor(x, y, deletable = false, color = Config.basicWallColor, ) {
        super(x, y, color);
        this.deletable = deletable;
        this.rect = new VRect(this.pos, Config.blockSize, Config.blockSize);
    }

    show() {
        this.rect.show(Config.basicWallColor);
    }

}
