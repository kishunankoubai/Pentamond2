class Monoiamond{
    
    //実際に操作を反映させるBlockManager
    bm;
    //プレイ領域の幅
    width;
    //プレイ領域の高さ
    height;

    //x座標
    x = 1;
    //y座標
    y = 20;
    //種類
    kind = 0;
    //向き trueなら上向き、尖っているほうが上
    direction = true;
    //表示状態
    visible = false;
    
    constructor(bm){
        this.bm = bm;
        this.width = bm.width;
        this.height = bm.height;
    }

    //指定した位置、directionがすでに表示されている部分と干渉しない場合trueを返す
    canPut(x, y, direction){
        return this.bm.canPut(x, y, direction);
    }

    //このMonoiamondが表示できる(canPutがtrue)の場合に表示
    display(){
        if(this.visible || !this.canPut(this.x, this.y, this.direction)){
            return false;   
        }
        this.bm.display(this.x, this.y, this.direction, this.kind);
        this.visible = true;
        return true;
    }

    //このMonoiamondが表示されているなら削除する
    remove(){
        if(!this.visible){
            return;
        }
        this.bm.remove(this.x, this.y);
        this.visible = false;
    }

    //このMonoiamondの位置、向き、種類を設定する
    //すでに表示されていた場合は非表示にしてから設定する
    //これを実行した後は必ず非表示になる
    setProperty(x, y, direction, kind){
        if(this.visible){
            this.remove();
        }
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.kind = kind;
    }

    //すでに表示されているMonoiamondをGhostに変える
    turnToGhost(){
        return this.bm.turnToGhost(this.x, this.y);
    }
    
}