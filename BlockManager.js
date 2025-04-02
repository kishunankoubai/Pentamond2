class BlockManager {
    setting;
    //Blockの配列
    blocks;
    //Blockを実際に配置するElement
    base;
    //プレイ領域の幅
    //実際にMonoiamondが移動できる幅
    //盤面のwidthに対して、width * 2 - 1
    width;
    //プレイ領域の高さ
    height;

    constructor(base, setting) {
        this.setting = setting;
        this.base = base;
        //盤面のwidthに対して半ブロック移動を考慮したプレイ領域としての幅
        this.width = this.setting.width * 2 - 1;
        //盤面の高さに対して非表示領域も含めたプレイ領域としての高さ
        this.height = this.setting.height + this.setting.hiddenHeight;

        //blocksの定義
        this.blocks = new Array(this.width);
        for (let i = 0; i < this.width; i++) {
            this.blocks[i] = new Array(this.height);
            for (let j = 0; j < this.height; j++) {
                this.blocks[i][j] = new Block(this.setting);
                this.blocks[i][j].canvas.style.left = (i * 100) / (this.width + 1) + "%";
                this.blocks[i][j].canvas.style.top = ((j - this.setting.hiddenHeight + this.setting.displayMargin) * 100) / (this.setting.height + this.setting.displayMargin) + 0.005 + "%";
                this.blocks[i][j].canvas.style.width = 100 / this.setting.width + "%";
                if (j > 0) {
                    this.blocks[i][j].canvas.style.height = Math.max(100 / (this.setting.height + this.setting.displayMargin), 100 / (this.setting.height + this.setting.displayMargin) + 0.005) + "%";
                } else {
                    this.blocks[i][j].canvas.style.height = 100 / (this.setting.height + this.setting.displayMargin) + "%";
                }
                this.base.appendChild(this.blocks[i][j].canvas);
            }
        }
    }

    //指定した位置、向きが現在表示されているものと干渉しないならtrueを返す
    //Ghostは表示されていないものとして判定する
    canPut(x, y, direction) {
        //プレイ領域外の位置には表示できない
        if (x < 0 || this.width <= x || y < 0 || this.height <= y) {
            return false;
        }
        //指定した位置にBlockがない
        if (!this.blocks[x][y].visible || this.blocks[x][y].isGhost) {
            //どちらの端でもないとき
            if (x > 0 && x < this.width - 1) {
                //隣のBlockが、表示されているなら指定した向きと逆向き
                if (
                    (!this.blocks[x - 1][y].visible || this.blocks[x - 1][y].isGhost || this.blocks[x - 1][y].direction != direction) &&
                    (!this.blocks[x + 1][y].visible || this.blocks[x + 1][y].isGhost || this.blocks[x + 1][y].direction != direction)
                ) {
                    return true;
                } else {
                    return false;
                }
                //右端で、左端ではないとき
            } else if (x > 0) {
                //隣のBlockが、表示されているなら指定した向きと逆向き
                if (!this.blocks[x - 1][y].visible || this.blocks[x - 1][y].isGhost || this.blocks[x - 1][y].direction != direction) {
                    return true;
                } else {
                    return false;
                }
                //左端で、右端ではないとき
            } else if (x < this.width - 1) {
                //隣のBlockが、表示されているなら指定した向きと逆向き
                if (!this.blocks[x + 1][y].visible || this.blocks[x + 1][y].isGhost || this.blocks[x + 1][y].direction != direction) {
                    return true;
                } else {
                    return false;
                }
                //左端かつ右端のとき　つまりwidthが1のとき
            } else {
                return true;
            }
        }
        return false;
    }

    //指定した位置、向き、種類で、Ghostを上書きしながら強制的に表示する
    display(x, y, direction, kind) {
        //プレイ領域外の位置には表示できない
        if (x < 0 || this.width <= x || y < 0 || this.height <= y) {
            return false;
        }
        this.blocks[x][y].setDirection(direction);
        this.blocks[x][y].setKind(kind);
        this.blocks[x][y].removeGhost();
        this.blocks[x][y].setVisible(true);
    }

    //指定した位置のBlockを削除する
    remove(x, y) {
        this.blocks[x][y].setVisible(false);
    }

    //指定した位置のBlockをGhostに変える
    turnToGhost(x, y) {
        return this.blocks[x][y].turnToGhost();
    }

    //指定した矩形を表示画面としてキャンバスの解像度を調整する
    adjustCanvas(rect) {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                this.blocks[i][j].canvas.width = (rect.width * window.devicePixelRatio * this.setting.resolution) / this.setting.width;
                this.blocks[i][j].canvas.height = (rect.height * window.devicePixelRatio * this.setting.resolution) / (this.setting.height + this.setting.displayMargin);
            }
        }
        this.paint();
    }

    //すべての表示されているBlockをpaintする
    paint() {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (this.blocks[i][j].visible) {
                    this.blocks[i][j].paint();
                }
            }
        }
    }

    //すべてのGhostを削除する
    removeGhost() {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (this.blocks[i][j].isGhost) {
                    this.blocks[i][j].removeGhost();
                }
            }
        }
    }

    //すべてのBlockを削除する
    //removeGhostも自動的に実行される
    removeAll() {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (this.blocks[i][j].isGhost) {
                    this.blocks[i][j].removeGhost();
                }
                if (this.blocks[i][j].visible) {
                    this.blocks[i][j].setVisible(false);
                }
            }
        }
    }

    //すべての表示されているBlockのkindをneutralにする
    //removeGhostも自動的に実行される
    turnAllBlocksToNeutral() {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (this.blocks[i][j].isGhost) {
                    this.blocks[i][j].removeGhost();
                }
                if (this.blocks[i][j].visible) {
                    this.blocks[i][j].setKind(0);
                    this.blocks[i][j].paint();
                }
            }
        }
    }

    //上からy番目の列の内容を取得する
    getContentsOfLine(y) {
        y = ((y % this.height) + this.height) % this.height;
        let result = [];
        for (let i = 0; i < this.width; i++) {
            result.push([this.blocks[i][y].visible && !this.blocks[i][y].isGhost, this.blocks[i][y].direction]);
        }
        return result;
    }

    //上からy番目の列の内容を設定する
    setContentsOfLine(y, contents) {
        y = ((y % this.height) + this.height) % this.height;
        for (let i = 0; i < this.width; i++) {
            this.blocks[i][y].setPropaty([contents[i][0], contents[i][1], contents[i][2], contents[i][3]]);
        }
    }

    //指定した列を消去し、下詰めする
    //特に指定しない場合は最下列を消去する
    //消去した列の内容を返す
    removeLine(y = this.height - 1) {
        y = ((y % this.height) + this.height) % this.height;
        const line = this.getContentsOfLine(y);
        for (let i = 0; i < this.width; i++) {
            for (let j = this.height - 1; j > 0; j--) {
                if (j <= y) {
                    this.blocks[i][j].setPropaty(this.blocks[i][j - 1].getPropaty());
                }
            }
            this.blocks[i][0].setPropaty([false, true, 1, false]);
        }
        this.paint();
        return line;
    }

    //プレイ領域にブロックがなければtrueを返す
    isEmpty() {
        for (let y = this.height - 1; y >= 0; y--) {
            for (let x = 0; x < this.width; x++) {
                if (this.blocks[x][y].visible && !this.blocks[x][y].isGhost) {
                    return false;
                }
            }
        }
        return true;
    }
}
