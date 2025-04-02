class MondOperater {
    //このMondOperatorが操作するBlockManager
    bm;
    //BlockManagerに設定されているsetting
    setting;
    //操作を開始した時間
    startTime;
    //操作の一時中断を開始した時間
    pauseTime;
    //操作を一時中断していた時間の合計
    pauseSpan;
    //操作を終了した時間
    finishTime;
    //現在操作しているPentiamond
    pm;
    //前回操作していたPentiamond
    //removeLine後は情報が失われる
    prevPm;
    //holdしているPentiamondのkind
    holdKind;
    //Pentiamondの種類の数
    kindsOfPm;
    //6-bag方式で管理される次に出現するPentiamondの種類
    //実際に出現する順番で並んでいる
    nextMonds;
    //nextMondsの準備用
    prepareNextMonds;
    //出現予定のPentiamondを表示するPlayField
    nextPanels;
    //操作が可能か
    playing = false;
    //操作を一時中断中か
    pausing = false;
    //Pentiamondを置いた回数
    putCount = 0;
    //unPutした回数
    unPutCount = 0;
    //6-bagの何番目か
    nextCount = 0;
    //列を消去した回数
    removeLineCount = 0;
    //最新の消去した列の内容
    latestRemoveLine;
    //nextを表示する用のmondPanel
    nextPanels;
    //holdを表示する用のmondPanel
    holdPanel;
    //名前に対応した操作を行う際に呼ばれる関数を保持する
    //ここにfunctionを入れておくと特定の操作が行われたときに実行される
    on = {
        moveRight: null,
        moveLeft: null,
        moveDown: null,
        slip: null,
        put: null,
        spinRight: null,
        spinLeft: null,
        hold: null,
        unPut: null,
        pause: null,
        reopen: null,
        removeLine: null,
    };

    constructor(bm) {
        //このMondOperatorが操作するBlockManagerを保持する
        this.bm = bm;
        //BlockManagerのsettingを引き継ぐ
        this.setting = this.bm.setting;
        //このMondOperatorが実際に操作するPentiamondを定義する
        this.pm = new Pentiamond(this.bm);
        //Pentiamondの種類の数を取得する
        this.kindsOfPm = this.pm.placement.length;

        //onプロパティの中身を初期化する
        for (const key in this.on) {
            this.on[key] = () => {};
        }

        //mondPanelを生成する設定のときは生成する
        if (this.setting.createMondPanels) {
            //next用MondPanelを定義する
            this.nextPanels = new Array(this.kindsOfPm);
            for (let i = 0; i < this.kindsOfPm; i++) {
                this.nextPanels[i] = new MondPanel(this.setting);
                this.nextPanels[i].getBase().className = "base mondPanel nextPanel";
                this.nextPanels[i].pf.canvasLayerBase.className = "canvasLayerBase mondPanelCanvasLayerBase nextPanelCanvasLayerBase";
            }

            //hold用MondPanelを定義する
            this.holdPanel = new MondPanel(this.setting);
            this.holdPanel.getBase().className = "base mondPanel holdPanel";
            this.holdPanel.pf.canvasLayerBase.className = "canvasLayerBase mondPanelCanvasLayerBase holdPanelCanvasLayerBase";
        }
    }

    //操作を開始する
    start() {
        if (this.pm != null) {
            this.initialize();
        }
        this.startTime = Date.now();
        this.playing = true;
        this.shiftNext();
    }

    //初期状態に戻す
    initialize() {
        this.bm.removeAll();
        this.pm = null;
        this.prevPm = null;
        this.holdKind = 0;
        this.startTime = null;
        this.pauseTime = null;
        this.pauseSpan = 0;
        this.finishTime = null;
        this.playing = false;
        this.pausing = false;
        this.nextMonds = [...Array(this.kindsOfPm)].map((i, j) => j + 1);
        this.prepareNextMonds = [...Array(this.kindsOfPm)].map((i, j) => j + 1);
        this.putCount = 0;
        this.unPutCount = 0;
        this.nextCount = 0;
        this.removeLineCount = 0;
        this.latestRemoveLine = null;
        this.mix(this.nextMonds);
        this.mix(this.prepareNextMonds);

        for (const np of this.nextPanels) {
            np.remove();
        }
        this.holdPanel.remove();
    }

    //配列arrayの中身をランダムに入れ替える
    mix(array) {
        for (let i = 0; i < array.length ** 2; i++) {
            let a = Math.floor(Math.random() * array.length);
            let b = Math.floor(Math.random() * array.length);
            let c = array[a];
            let d = array[b];
            array[a] = d;
            array[b] = c;
        }
    }

    //指定したkindで現在のPentiamondを設定し、表示する
    createNewMond(kind) {
        if (this.pm != null && this.holdKind != -1) {
            this.prevPm = new Pentiamond(this.bm);
            this.prevPm.catch(this.pm.x, this.pm.y, this.pm.dir, this.pm.kind);
        }
        this.pm = new Pentiamond(this.bm);
        this.pm.initialize(kind);
        this.pm.display();
        this.createGhost();
    }

    //ひとつ前のkindで現在のPentiamondを設定し、表示する
    prevMond() {
        if (this.prevPm == null) {
            return;
        }
        this.prevPm.remove();
        this.pm.remove();
        this.pm.initialize(this.prevPm.kind);
        this.pm.display();
        this.createGhost();
        this.prevPm = null;
    }

    //次のPentiamondを6-bag方式で設定する
    shiftNext() {
        //操作中でないときreturn
        if (!this.playing || this.pausing) {
            return;
        }

        //nextのうち最新のKindで新しいPentiamondを出現
        this.createNewMond(this.nextMonds[0]);

        //nextMondを一つずつ前に押し出す
        for (let i = 0; i < this.nextMonds.length - 1; i++) {
            this.nextMonds[i] = this.nextMonds[i + 1];
        }
        //空いたところはPrepareNextMondsを参照する
        this.nextMonds[this.kindsOfPm - 1] = this.prepareNextMonds[this.nextCount];
        //nextCountを増加させる
        this.nextCount++;

        //nextが一周したとき
        if (this.nextCount == this.kindsOfPm) {
            //prepareNextMondsを再生成する
            this.prepareNextMonds = [...Array(this.kindsOfPm)].map((i, j) => j + 1);
            this.mix(this.prepareNextMonds);
            this.nextCount = 0;
        }

        //nextPanelにnextの状態を反映させる
        for (let i = 0; i < this.kindsOfPm; i++) {
            this.nextPanels[i].setKind(this.nextMonds[i]);
        }
    }

    //shiftNextしたのをもとに戻す
    //removeLineを実行した後は失敗する
    unShiftNext() {
        //操作中でないときreturn
        if (!this.playing || this.prevPm == null || this.pm == null || this.pausing) {
            return;
        }

        //nextMondを一つずつ後ろに押し戻す
        for (let i = this.nextMonds.length - 1; i > 0; i--) {
            this.nextMonds[i] = this.nextMonds[i - 1];
        }
        //先頭に現在のKindを入れる
        this.nextMonds[0] = this.pm.kind;
        //nextCountを減少させる
        this.nextCount--;

        //あと一回で一周する番号に置き換える
        if (this.nextCount == -1) {
            this.nextCount = this.kindsOfPm - 1;
        }

        //nextPanelにnextを反映させる
        for (let i = 0; i < this.kindsOfPm; i++) {
            this.nextPanels[i].setKind(this.nextMonds[i]);
        }

        //一つ前のPentamondを表示する
        this.prevMond();
    }

    //現在操作している、出現しているPentiamondのGhostを生成する
    createGhost() {
        this.bm.removeGhost();
        if (this.pm == null || ((!this.pm.visible || this.pm.stop || this.pm.fixed || this.pm.invalidate) && !this.pausing)) {
            return;
        }

        this.pm.setInvalidate(false);
        this.pm.remove();
        let clone = new Pentiamond(this.bm);
        clone.setProperty(this.pm.x, this.pm.y, this.pm.dir, this.pm.kind);
        clone.display();
        clone.put();
        clone.turnToGhost();
        this.pm.display();

        if (this.pausing) {
            this.pm.setInvalidate(true);
        }
    }

    //操作している時間をミリ秒で取得
    getPlayTime() {
        if (this.playing) {
            if (this.pausing) {
                return this.pauseTime - this.startTime - this.pauseSpan;
            } else {
                return Date.now() - this.startTime - this.pauseSpan;
            }
        } else {
            if (this.finishTime != null) {
                return this.finishTime - this.startTime - this.pauseSpan;
            } else {
                return null;
            }
        }
    }

    //現在操作しているPentiamondを右に移動する
    moveRight() {
        if (!this.playing || this.pausing) {
            return;
        }
        if (this.pm.move(1, 0)) {
            this.on.moveRight();
        }
        this.createGhost();
    }

    //現在操作しているPentiamondを左に移動する
    moveLeft() {
        if (!this.playing || this.pausing) {
            return;
        }
        if (this.pm.move(-1, 0)) {
            this.on.moveLeft();
        }
        this.createGhost();
    }

    //現在操作しているPentiamondを下または斜め下に移動する
    //真下が最優先で、次に斜め左下、最後に斜め右下の順で移動できるか試みる
    fall() {
        if (!this.playing || this.pausing) {
            return;
        }
        switch (this.pm.fall()) {
            case 1:
                this.on.moveDown();
                break;
            case 2:
                this.on.slip();
                break;
        }
        this.createGhost();
    }

    //現在操作しているPentiamondを設置する
    //もし次のPentiamondが出現できないならば出現できるまでRemoveLine以外のPentiamondに関する操作を受け付けない
    put() {
        if (!this.playing || this.pausing) {
            return;
        }
        this.pm.put();
        if (this.pm.fixed) {
            this.putCount++;
            this.shiftNext();
            this.on.put();
        }
    }

    //現在操作しているPentiamondを右回転する
    spinRight() {
        if (!this.playing || this.pausing) {
            return;
        }
        if (this.pm.SRS(true)) {
            this.on.spinRight();
        }
        this.createGhost();
    }

    //現在操作しているPentiamondを左回転する
    spinLeft() {
        if (!this.playing || this.pausing) {
            return;
        }
        if (this.pm.SRS(false)) {
            this.on.spinLeft();
        }
        this.createGhost();
    }

    //現在操作しているPentiamondをholdと入れ替える
    hold() {
        if (!this.playing || this.pausing || !this.pm.visible || this.pm.stop || this.pm.fixed || this.pm.invalidate) {
            return;
        }

        if (this.holdKind == 0) {
            let buffer = this.pm.kind;
            this.holdKind = -1;
            this.pm.remove();
            this.shiftNext();
            this.holdKind = buffer;
        } else {
            this.pm.remove();
            let buffer = this.pm.kind;
            this.pm.initialize(this.holdKind);
            this.pm.display();
            this.holdKind = buffer;
        }
        this.holdPanel.setKind(this.holdKind);
        //this.prevPm = null;
        this.createGhost();
        this.on.hold();
    }

    //putしたのを元に戻す
    unPut() {
        if (!this.playing || this.pausing || this.prevPm == null || this.pm.fixed || this.pm.invalidate) {
            return;
        }
        this.putCount--;
        this.unPutCount++;
        this.unShiftNext();
        this.on.unPut();
    }

    //現在操作しているPentiamondを初期位置に戻したうえで最下列を消す
    removeLine() {
        if (!this.playing || this.pausing || this.pm.fixed || this.pm.invalidate) {
            return;
        }
        this.pm.remove();
        if (this.bm.isEmpty()) {
            this.pm.display();
            return;
        }
        this.latestRemoveLine = this.bm.removeLine();
        this.removeLineCount++;

        this.pm.initialize(this.pm.kind);
        this.pm.display();
        this.createGhost();
        this.prevPm = null;
        this.on.removeLine();
    }

    //操作を一時中断する
    //pause中はplayTimeとしては加算されない
    pause() {
        if (!this.playing || this.pausing || this.pm.invalidate) {
            return;
        }
        this.pm.setInvalidate(true);
        this.pauseTime = Date.now();
        this.pausing = true;
        this.on.pause();
    }

    //pauseを解除する
    reopening() {
        if (!this.playing || !this.pausing) {
            return;
        }
        this.pauseSpan += Date.now() - this.pauseTime;
        this.pm.setInvalidate(false);
        this.pausing = false;
        this.on.reopen();
    }

    //操作を終了する
    finish() {
        if (!this.playing || this.pausing) {
            return;
        }
        this.finishTime = Date.now();
        this.pm.remove();
        this.pm.setInvalidate(true);
        this.bm.removeGhost();
        this.playing = false;
    }

    //nextPanelおよびholdPanelのajustMondPanelを呼び出す
    adjustPanels() {
        if (!this.setting.createMondPanels) {
            return;
        }
        for (const np of this.nextPanels) {
            np.adjustMondPanel();
        }
        this.holdPanel.adjustMondPanel();
    }

    //nextPanelのbaseを取得する
    getNextPanelBase(index) {
        if (!this.setting.createMondPanels) {
            return null;
        }
        return this.nextPanels[index].getBase();
    }

    //holdPanelのbaseを取得する
    getHoldPanelBase() {
        if (!this.setting.createMondPanels) {
            return null;
        }
        return this.holdPanel.getBase();
    }

    //onプロパティをObjectにより設定する
    setOnProperty(property) {
        for (const onDo in this.on) {
            if (property[onDo] != null) {
                this.on[onDo] = property[onDo];
            }
        }
    }
}
