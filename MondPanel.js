class MondPanel{

    //このMondPanelが表示しているPentiamondのKind
    kind;
    //Mondを実際に表示するPlayField
    pf;
    //表示しているPentiamond
    pm;

    constructor(setting){
        //settingをコピーする
        this.mpSetting = window.structuredClone(setting);

        //MondPanel用設定に置き換える
        this.mpSetting.width = 3;
        this.mpSetting.height = 3;
        this.mpSetting.hiddenHeight = 0;
        this.mpSetting.displayMargin = 0;
        this.mpSetting.verticalGridWidth = 0;
        this.mpSetting.initialX = 2;
        this.mpSetting.initialY = 2;
        this.mpSetting.createMondPanels = false;

        //MondPanel用設定でPlayFieldを作成する
        this.pf = new PlayField(this.mpSetting);

        //クラス名を変更する
        this.pf.getBase().className = "base mondPanel";
        this.pf.canvasLayerBase.className = "canvasLayerBase mondPanelCanvasLayerBase";
    }

    //指定したKindのPentiamondを表示する
    setKind(kind){
        this.kind = kind;
        if(this.pm != null){
            this.pm.remove();
        }
        if(kind == 0){
            return;
        }
        this.pm = new Pentiamond(this.pf.bm);
        this.pm.initialize(kind);
    }

    //Pentiamondを表示していた場合は削除する
    remove(){
        this.setKind(0);
    }

    //現在の表示状況に合わせて描画を最適化する
    //DOMに追加した後に1回は呼んだほうがいい
    //表示の大きさが変わるたびに呼んでおいたほうがいい
    adjustMondPanel(){
        this.pf.adjustPlayField();
    }

    //このPentiamondのBaseを返す
    getBase(){
        return this.pf.getBase();
    }

}