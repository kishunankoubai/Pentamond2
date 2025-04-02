class Block{

    setting;
    //このBlockを表示するcanvas
    canvas;
    //表示状態 trueなら表示
    visible;
    //Blockの種類　色を表す
    kind;
    //Ghostかどうか trueならGhost
    isGhost = false;
    //Blockの向き trueなら上向き(尖っている方が上)
    direction = true;

    constructor(setting){
        this.setting = setting;
        this.canvas = document.createElement("canvas");
        this.canvas.className = "mondBlock";
        this.setVisible(false);
    }

    //kindを設定
    setKind(kind){
        this.kind = kind;
    }

    //向きを設定
    setDirection(direction){
        this.direction = direction;
    }

    //表示状態を設定
    setVisible(visible){
        this.canvas.style.visibility = visible ? "visible" : "hidden";
        this.visible = visible;
        if(this.visible){
            this.paint();
        }
    }

    //Propatyを強制的に設定する
    setPropaty(propaty){
        [this.visible, this.direction, this.kind, this.isGhost] = propaty;
        this.setVisible(this.visible);
    }
    
    //このBlockのPropatyを出力する
    getPropaty(){
        return [this.visible, this.direction, this.kind, this.isGhost];
    }

    //すでに表示されているBlockをGhostに変える
    turnToGhost(){
        if(this.visible){
            this.isGhost = true;
            this.paint();
            return true;
        }
        return false;
    }

    //このBlockがGhostのとき、表示されている場合は削除したうえでGhost化を解除する
    removeGhost(){
        if(this.isGhost){
            this.isGhost = false;
            this.setVisible(false);
        }
    }

    //Blockを描画する
    //変更がある度に呼び出す必要がある
    paint(){
        const ct = this.canvas.getContext("2d");
        ct.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if(this.isGhost){
            ct.fillStyle = Object.values(this.setting.ghostMondColor)[this.kind] || "#ffffff";
            ct.strokeStyle = this.setting.ghostMondBorderColor || "#bbbbbb";
        }else{
            ct.fillStyle = Object.values(this.setting.mondColor)[this.kind] || "#ffffff";
            ct.strokeStyle = this.setting.mondBorderColor || "#bbbbbb";
        }
        ct.lineWidth = this.setting.mondBorderWidth * (this.canvas.height / document.getElementById("pentamondBase").clientHeight * 25);
        this.writeTriangle(ct);
        ct.fill();
        if(this.setting.mondBorderWidth != 0){
            ct.stroke();
        }
    }

    //指定したContextで現在のdirectionに依った三角形を書く
    writeTriangle(ct){
        ct.beginPath();
        if(this.direction){
            ct.moveTo(0, this.canvas.height);
            ct.lineTo(this.canvas.width, this.canvas.height);
            ct.lineTo(this.canvas.width / 2, 0);
        }else{
            ct.moveTo(0, 0);
            ct.lineTo(this.canvas.width, 0);
            ct.lineTo(this.canvas.width / 2, this.canvas.height);
        }
        ct.closePath();
    }

}