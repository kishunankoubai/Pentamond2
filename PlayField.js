class PlayField{

    //設定用オブジェクト
    setting;
    //このPlayFieldの大元となる要素
    base;
    //canvas用レイヤーのdiv要素の大元となる要素
    canvasLayerBase;
    //canvas用レイヤーの枚数
    theNumberOfCanvasLayer;
    //canvas用レイヤーのdiv要素の配列　indexが大きいほど上に表示される
    canvasLayers;
    //grid用canvas
    gridCanvas;
    //Blockを総括して様々な操作を可能にするやつ
    bm;
    //このPlayFieldで使われているBlockManagerを管理するMondOperator
    mo;

    constructor(setting){

        //settingを保持
        this.setting = setting;

        //設定されていない場合は自動的に解釈する
        if(this.setting.width == null){
            this.setting.width = 9;
        }
        if(this.setting.height == null){
            this.setting.height = 20;
        }
        if(this.setting.hiddenHeight == null){
            this.setting.hiddenHeight = 0;
        }
        if(this.setting.displayMargin == null){
            this.setting.displayMargin = 0;
        }
        if(this.setting.resolution == null){
            this.setting.resolution = 1;
        }
        if(this.setting.ghostMondColor == null || Object.values(this.setting.ghostMondColor).length < 7){
            this.setting.ghostMondColor = {
                neutral : "#AAAAAA",
                L : "#440000",
                J : "#3E1E00",
                p : "#444400",
                q : "#004400",
                U : "#000044",
                I : "#220022",
            }
        }
        if(this.setting.mondColor == null || Object.values(this.setting.mondColor).length < 7){
            this.setting.mondColor = {
                neutral : "#AAAAAA",
                L : "#FF0000",
                J : "#FA7800",
                p : "#FFFF00",
                q : "#00FF00",
                U : "#0000FF",
                I : "#880088",
            }
        }
        if(this.setting.createMondPanels == null){
            this.setting.createMondPanels = true;
        }

        //baseの定義
        this.base = document.createElement("div");
        this.base.className = "base playFieldBase";

        //canvasLayerBaseの定義
        this.canvasLayerBase = document.createElement("div");
        this.canvasLayerBase.className = "canvasLayerBase";
        this.base.appendChild(this.canvasLayerBase);

        //canvasLayersの定義
        //プレイ画面で用いるcanvas用のレイヤー
        this.theNumberOfCanvasLayer = 4;
        this.canvasLayers = new Array(this.theNumberOfCanvasLayer - 1);
        for(let i = 0; i < this.theNumberOfCanvasLayer; i++){
            if(i == 0){
                this.canvasLayers[i] = this.canvasLayerBase;
                continue;
            }
            this.canvasLayers[i] = document.createElement("div");
            this.canvasLayers[i].className = "canvasLayer";
            this.canvasLayers[i].style.zIndex = i;
            this.canvasLayers[i - 1].appendChild(this.canvasLayers[i]);
        }

        //一番下のcanvasLayer(canvasLayerBase)の色を設定する
        this.canvasLayers[0].style.backgroundColor = this.setting.canvasColor;

        //gridCanvasの定義
        //後ろのグリッド線などを描画する
        this.gridCanvas = document.createElement("canvas");
        this.gridCanvas.className = "canvas";
        this.canvasLayers[1].appendChild(this.gridCanvas);

        //BlockManagerの定義
        //プレイ領域の表示を担うBlockの管理をする
        this.bm = new BlockManager(this.canvasLayers[2], this.setting);

        //MondOperaterの定義
        this.mo = new MondOperater(this.bm);

    }

    //BlockManagerの描画の更新
    blockPaint(){
        this.bm.paint();
    }

    //canvasの解像度を上げる処理
    //baseをDOMに追加する前に呼び出すと失敗する
    adjustCanvas(){
        const rect = this.canvasLayerBase.getBoundingClientRect();
        if(rect != null && rect.width != 0){
            this.fitCanvas(this.gridCanvas, rect);
            this.bm.adjustCanvas(rect);
            return true;
        }
        return false;
    }

    //指定したRectangleに合わせてcanvasのサイズと解像度を調整する
    fitCanvas(canvas, rect){
        canvas.width = Math.floor(rect.width * window.devicePixelRatio * this.setting.resolution);
        canvas.height = Math.floor(rect.height * window.devicePixelRatio * this.setting.resolution);
        canvas.style.width = rect.width;
        canvas.style.height = rect.height;
    }

    //画面のGridを描画する
    //横Gridより縦Gridが上に表示される
    gridPaint(){
        let gridW = this.gridCanvas.width / this.setting.width;
        let gridH = this.gridCanvas.height / (this.setting.height + this.setting.displayMargin);
        let ct = this.gridCanvas.getContext("2d");
        ct.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);

        if(!this.setting.holizontalGridWidth == 0){
            ct.strokeStyle = this.setting.holizontalGridColor;
            ct.lineWidth = this.setting.holizontalGridWidth * this.setting.resolution;
    
            for(let i = 0; i < this.setting.height + this.setting.displayMargin; i++){
                ct.beginPath();
                ct.moveTo(0, this.gridCanvas.height - i * gridH);
                ct.lineTo(this.gridCanvas.width, this.gridCanvas.height - i * gridH);
                ct.stroke();
                
                ct.beginPath();
                ct.moveTo(0, this.gridCanvas.height - (i + 1) * gridH);
                ct.lineTo(this.gridCanvas.width, this.gridCanvas.height - (i + 1) * gridH);
                ct.stroke();
            }
        }

        if(!this.setting.verticalGridWidth == 0){
            ct.strokeStyle = this.setting.verticalGridColor;
            ct.lineWidth = this.setting.verticalGridWidth * this.setting.resolution;
    
            for(let i = 0; i < this.setting.width; i++){
                ct.beginPath();
                ct.moveTo(i * gridW, 0);
                ct.lineTo(i * gridW, this.gridCanvas.height);
                ct.stroke();
                
                ct.beginPath();
                ct.moveTo((i + 1) * gridW, 0);
                ct.lineTo((i + 1) * gridW, this.gridCanvas.height);
                ct.stroke();
            }    
        }
    }

    //現在の表示状況に合わせて描画を最適化する
    //DOMに追加した後に1回は呼んだほうがいい
    //表示の大きさが変わるたびに呼んでおいたほうがいい
    adjustPlayField(){
        const result = this.adjustCanvas();
        this.gridPaint();
        this.blockPaint();
        this.mo.adjustPanels();
        return result;
    }

    //baseを取得する
    getBase(){
        return this.base;
    }

    //mondOperatorを取得する
    getMondOperator(){
        return this.mo;
    }

}