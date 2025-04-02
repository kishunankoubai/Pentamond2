class TrickPanel {
    trickPanelSetting;
    trickSetting;
    playField;
    base;
    trickManager;
    numberOfTricks;
    index = 0;

    constructor(setting, trickSetting) {
        this.trickPanelSetting = structuredClone(setting);
        this.trickPanelSetting.width = 9;
        this.trickPanelSetting.height = 1;
        this.trickPanelSetting.hiddenHeight = 0;
        this.trickPanelSetting.displayMargin = 0;
        this.trickPanelSetting.verticalGridWidth = 2;
        this.trickPanelSetting.createMondPanels = false;
        this.playField = new PlayField(this.trickPanelSetting);
        this.base = this.playField.getBase();
        this.base.className = "base playFieldBase trickPanel";

        this.trickSetting = trickSetting;
        this.numberOfTricks = Object.keys(this.trickSetting).length;
        this.trickManager = new TrickManager(this.trickSetting);
        this.setIndex(0);
    }

    setIndex(index) {
        index = (((this.numberOfTricks + index) % this.numberOfTricks) + this.numberOfTricks) % this.numberOfTricks;
        this.trickManager.setIndex(index);
        this.playField.bm.setContentsOfLine(0, this.trickManager.getContents());
        this.index = index;
    }

    getIndex() {
        return this.index;
    }

    getTrickName() {
        return this.trickManager.getTrickName();
    }

    getPoint() {
        return this.trickManager.getPoint();
    }

    getAttack() {
        return this.trickManager.getAttack();
    }

    adjustTrickPanel() {
        this.playField.adjustPlayField();
    }

    getBase() {
        return this.base;
    }
}
