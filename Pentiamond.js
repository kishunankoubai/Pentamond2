class Pentiamond{
    
    //x座標
    x = 0;
    //y座標
    y = 0;
    //向き 0~5の6種類
    dir = 0;
    //種類
    kind = 0;

    //初期出現位置
    initialX;
    initialY;

    //初期位置に出現できなかった
    stop = true;
    //Pentiamondをputして固定されている
    fixed = false;
    //操作受付を無効
    invalidate = false;
    //表示されているか
    visible = false;

    monds = null;

    //モンドの形を指定
    placement =
        
        [
            [ //L
                [[0, 0], [-1, 0], [-2, 0], [1, 0], [1, -1]],
                [[0, 0], [1, 0], [2, 0], [0, -1], [-1, -1]],
                [[0, 0], [1, 0], [1, -1], [0, 1], [1, 1]],
                [[0, 0], [-1, 0], [-1, 1], [1, 0], [2, 0]],
                [[0, 0], [-1, 0], [-2, 0], [0, 1], [1, 1]],
                [[0, 0], [0, -1], [-1, -1], [-1, 0], [-1, 1]],
            ],[ //J
                [[0, 0], [-1, 0], [-1, -1], [1, 0], [2, 0]],
                [[0, 0], [0, -1], [1, -1], [1, 0], [1, 1]],
                [[0, 0], [0, 1], [-1, 1], [1, 0], [2, 0]],
                [[0, 0], [-1, 0], [-2, 0], [1, 0], [1, 1]],
                [[0, 0], [-1, 0], [-1, -1], [0, 1], [-1, 1]],
                [[0, 0], [-1, -0], [-2, -0], [0, -1], [1, -1]],
            ],[ //p
                [[0, -1], [0, 0], [1, 0], [2, 0], [-1, 0]],
                [[-1, 0], [0, 0], [0, 1], [1, 1], [1, 0]],
                [[0, -1], [0, 0], [1, 0], [-1, 1], [-1, 0]],
                [[1, 0], [0, 0], [-1, 0], [-2, 0], [0, 1]],
                [[-1, 0], [0, 0], [1, 0], [-1, -1], [0, -1]],
                [[0, 1], [0, 0], [-1, 0], [1, -1], [1, 0]],
            ],[ //q
                [[0, -1], [0, 0], [1, 0], [-2, 0], [-1, 0]],
                [[0, 1], [0, 0], [1, 0], [-1, -1], [-1, 0]],
                [[-1, 0], [0, 0], [1, 0], [1, -1], [0, -1]],
                [[-1, 0], [0, 0], [1, 0], [2, 0], [0, 1]],
                [[0, -1], [0, 0], [-1, 0], [1, 1], [1, 0]],
                [[-1, 0], [0, 0], [1, 0], [-1, 1], [0, 1]],
            ],[ //U
                [[0, 0], [1, 0], [1, -1], [-1, 0], [-1, -1]],
                [[0, 0], [1, 0], [2, 0], [0, -1], [1, -1]],
                [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1]],
                [[0, 0], [1, 0], [1, 1], [-1, 0], [-1, 1]],
                [[0, 0], [-1, 0], [-2, 0], [0, 1], [-1, 1]],
                [[0, 0], [-1, 0], [-2, 0], [0, -1], [-1, -1]],
            ],[ //I
                [[0, 0], [1, 0], [2, 0], [-1, 0], [-2, 0]],
                [[0, 0], [1, 0], [1, 1], [0, -1], [-1, -1]],
                [[0, 0], [1, 0], [1, -1], [0, 1], [-1, 1]],
                [[0, 0], [1, 0], [2, 0], [-1, 0], [-2, 0]],
                [[0, 0], [0, 1], [1, 1], [-1, 0], [-1, -1]],
                [[0, 0], [0, -1], [1, -1], [-1, 0], [-1, 1]],
            ]
        ];

    //回転に伴う軸の補正 壁際などでの感覚的な回転を可能にする
    correction =
        
        [
            [ //L
                [ //右回転
                    [[0, 0], [-1, 0]], //0 > 1
                    [[0, 0], [0, -1]], //1 > 2
                    [[0, 0], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1]], //2 > 3
                    [[0, 0], [1, 0], [-1, 0], [0, -1], [1, -1]], //3 > 4
                    [[0, 0], [1, 0]], //4 > 5
                    [[0, 0], [-1, 0], [1, 0], [-1, -1], [0, -1]], //5 > 0
               ],[ //左回転
                    [[0, 0], [0, -1]], //0 > 5
                    [[0, 0], [1, 0], [1, -1], [2, -1]], //1 > 0
                    [[0, 0], [1, 0], [-1, 0], [1, -1]], //2 > 1
                    [[0, 0], [-1, 0], [0, -1]], //3 > 2
                    [[0, 0], [-1, 0], [0, -1], [-1, -1]], //4 > 3
                    [[0, 0], [1, 0], [-1, 0], [-1, -1], [1, -1], [-2, -1], [0, -2]], //5 > 4
                ]
            ],[ //J
                [ //右回転
                    [[0, 0], [0, -1]], //0 > 1
                    [[0, 0], [-1, 0], [1, 0], [1, -1], [-1, -1], [2, -1], [0, -2]], //1 > 2
                    [[0, 0], [1, 0], [0, -1], [1, -1]], //2 > 3
                    [[0, 0], [1, 0], [0, -1]], //3 > 4
                    [[0, 0], [-1, 0], [1, 0], [-1, -1]], //4 > 5
                    [[0, 0], [-1, 0], [-1, -1], [-2, -1]], //5 > 0
               ],[ //左回転
                    [[0, 0], [1, 0]], //0 > 5
                    [[0, 0], [1, 0], [-1, 0], [1, -1], [0, -1]], //1 > 0
                    [[0, 0], [-1, 0]], //2 > 1
                    [[0, 0], [-1, 0], [1, 0], [0, -1], [-1, -1]], //3 > 2
                    [[0, 0], [1, 0], [-1, 0], [1, -1], [0, -1], [-1, -1]], //4 > 3
                    [[0, 0], [0, -1]], //5 > 4
                ]
            ],[ //p
                [ //右回転
                    [[0, 0], [0, -1]], //0 > 1
                    [[0, 0], [1, 0], [0, -1]], //1 > 2
                    [[0, 0], [1, 0], [0, -1], [1, -1]], //2 > 3
                    [[0, 0], [-1, 0]], //3 > 4
                    [[0, 0], [0, -1]], //4 > 5
                    [[0, 0], [-1, 0], [1, 0], [0, -1]], //5 > 0
               ],[ //左回転
                    [[0, 0], [0, -1]], //0 > 5
                    [[0, 0], [-1, 0], [1, 0], [0, -1]], //1 > 0
                    [[0, 0], [0, -1]], //2 > 1
                    [[0, 0], [0, -1]], //3 > 2
                    [[0, 0], [1, 0], [0, -1], [1, -1], [2, -1], [1, -2]], //4 > 3
                    [[0, 0], [1, 0], [-1, 0], [0, -1]], //5 > 4
                ]
            ],[ //q
                [ //右回転
                    [[0, 0], [0, -1]], //0 > 1
                    [[0, 0], [-1, 0], [1, 0], [0, -1]], //1 > 2
                    [[0, 0], [-1, 0], [0, -1], [-1, -1], [-2, -1], [-1, -2]], //2 > 3
                    [[0, 0], [0, -1]], //3 > 4
                    [[0, 0], [0, -1]], //4 > 5
                    [[0, 0], [1, 0], [-1, 0], [0, -1]], //5 > 0
               ],[ //左回転
                    [[0, 0], [0, -1]], //0 > 5
                    [[0, 0], [1, 0], [-1, 0], [0, -1]], //1 > 0
                    [[0, 0], [0, -1]], //2 > 1
                    [[0, 0], [1, 0]], //3 > 2
                    [[0, 0], [-1, 0], [0, -1], [-1, -1]], //4 > 3
                    [[0, 0], [-1, 0], [0, -1]], //5 > 4
                ]
            ],[ //U
                [ //右回転
                    [[0, 0], [-1, 0]], //0 > 1
                    [[0, 0], [0, -1]], //1 > 2
                    [[0, 0], [1, 0], [0, -1]], //2 > 3
                    [[0, 0], [1, 0], [0, -1], [1, -1]], //3 > 4
                    [[0, 0], [0, 1]], //4 > 5
                    [[0, 0], [-1, 0]], //5 > 0
               ],[ //左回転
                    [[0, 0], [1, 0]], //0 > 5
                    [[0, 0], [1, 0]], //1 > 0
                    [[0, 0], [0, 1]], //2 > 1
                    [[0, 0], [-1, 0], [0, -1], [-1 ,-1]], //3 > 2
                    [[0, 0], [-1, 0], [0, -1]], //4 > 3
                    [[0, 0], [0, -1]], //5 > 4
                ]
            ],[ //I
                [ //右回転
                    [[0, 0], [0, -1]], //0 > 1
                    [[0, 0], [0, -1], [1, -1], [2, -1]], //1 > 2
                    [[0, 0], [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1]], //2 > 3
                    [[0, 0], [0, -1]], //3 > 4
                    [[0, 0], [1, 0], [0, -1]], //4 > 5
                    [[0, 0], [-1, 0], [1, 0], [-2, 0], [-3, 0], [-2, -1], [0, -1], [1, -1]], //5 > 0
               ],[ //左回転
                    [[0, 0], [0, -1]], //0 > 5
                    [[0, 0], [1, 0], [-1, 0], [2, 0], [3, 0], [2, -1], [0, -1], [-1, -1]], //1 > 0
                    [[0, 0], [-1, 0], [0, -1]], //2 > 1
                    [[0, 0], [0, -1]], //3 > 2
                    [[0, 0], [1, 0], [-1, 0], [0, -1], [1, -1], [-1, -1]], //4 > 3
                    [[0, 0], [0, -1], [-1, -1], [-2, -1]], //5 > 4
                ]
            ]
        ];

    constructor(bm){
        
        this.initialX = bm.setting.initialX || bm.setting.width - 1;
        this.initialY = bm.setting.initialY || bm.setting.hiddenHeight + 1;
        this.monds = new Array(5);
        for(let i = 0; i < 5; i++){
            this.monds[i] = new Monoiamond(bm);
        }
		        
    }

    //指定したkindで、初期位置に回転状態が0で出現を試みる
    //出現できなかったときはstopがtrueになる
    initialize(kind){
        //console.log("Pentiamond:initialize");
        this.kind = kind;
        
        this.x = this.initialX;
        this.y = this.initialY;
        this.dir = 0;
        
        if(this.canPut(this.x, this.y, this.dir, this.kind)){
            this.display();
        }else{
            this.stop = true;
        }
    }

    //指定した位置、状態のモンドが新たに表示できるとき、trueを返す
    canPut(x, y, dir, kind){
        let result = true;
        for(let i = 0; i < 5; i++){
            result = result && this.monds[i].canPut(x + this.placement[kind - 1][dir][i][0], y + this.placement[kind - 1][dir][i][1], ((dir + i) % 2 == 0));
			//console.log((x + this.placement[kind - 1][dir][i][0]) + ", " + (y + this.placement[kind - 1][dir][i][1]) + ", " + ((dir + i) % 2 == 0) + "=>" + result);
        }
        return result;
    }

    //表示されていないPentiamondを出現させる
    //表示できた場合stopはfalseになる
    display(){
                
        if(this.visible || this.fixed || this.invalidate || !this.canPut(this.x, this.y, this.dir, this.kind)){
            //console.log("Pentiamond:display:fail");
            return;
        }
        
        for(let i = 0; i < 5; i++){
            this.monds[i].setProperty(this.x + this.placement[this.kind - 1][this.dir][i][0], this.y + this.placement[this.kind - 1][this.dir][i][1], ((this.dir + i) % 2 == 0), this.kind);
            this.monds[i].display();
        }
        //console.log("Pentiamond:display:success");
        this.stop = false;
        this.visible = true;
        
    }

    //表示されているPentiamondを削除する
    remove(){
        if(!this.visible || this.stop || this.fixed || this.invalidate){
            //console.log("Pentiamond:remove:fail");
            return;
        }
        
        for(let i = 0; i < 5; i++){
            this.monds[i].remove();
        }
        //console.log("Pentiamond:remove:success");
        this.visible = false;
    }

    //表示されているPentiamondを指定した絶対位置に移動する
    move(x, y){
        
        if(!this.visible || this.stop || this.fixed || this.invalidate){
            return false;
        }
        
        this.remove();
        if(this.canPut(this.x + x, this.y + y, this.dir, this.kind)){
            this.x += x;
            this.y += y;
			this.display();
			return true;
        }else{
			this.display();
			return false;
		}
                
    }

    //表示されているPentiamondを一マスだけ真下か斜め下に移動する
    //真下が最優先で、次に斜め左下、最後に斜め右下の順で移動できるか試みる
    //移動できなかった場合は0、真下の場合は1、斜め下の場合は2を返す
    fall(){
        
        if(!this.visible || this.stop || this.fixed || this.invalidate){
            return 0;
        }
        
        if(!this.move(0, 1)){
            if(!this.move(-1, 1)){
                if(!this.move(1, 1)){
                    return 0;
                }
            }
            return 2;
        }
        return 1;
    }

    //地面につくまで真下に移動し、そのあとこのPentiamondを固定する
    put(){
        if(!this.visible || this.stop || this.fixed || this.invalidate){
            return;
        }
        
        while(this.move(0, 1));
        this.fixed = true;
    }

    //表示されたPentiamondを回転する
    //指定した数だけ右回転する　負の値は左回転する
    //回転できない場合は回転しない
    spin(dir){
        
        if(!this.visible || this.stop || this.fixed || this.invalidate){
            return false;
        }
        
        this.remove();
        let buffer = false;
        
        if(this.canPut(this.x, this.y, ((this.dir + dir) % 6 + 6) % 6, this.kind)){
            this.dir = ((this.dir + dir) % 6 + 6) % 6;
            buffer = true;
        }
        
        this.display();  
        return buffer;
        
    }

    //スーパーローテーションシステムによる回転を行う
    //correctionによる軸の補正を行った後の回転を順に試し、最初に成功したものを実際に実行する
    //trueを入れると右回転、falseを入れると左回転
    SRS(right){

        if(!this.visible || this.stop || this.fixed || this.invalidate){
            return false;
        }

        this.remove();
        let buffer = false;
        
        for(let i = 0; i < this.correction[this.kind - 1][right ? 0 : 1][this.dir].length; i++){
            if(this.canPut(this.x + this.correction[this.kind - 1][right ? 0 : 1][this.dir][i][0], this.y + this.correction[this.kind - 1][right ? 0 : 1][this.dir][i][1], ((this.dir + (right ? 1 : -1)) % 6 + 6) % 6, this.kind)){
                this.x += this.correction[this.kind - 1][right ? 0 : 1][this.dir][i][0];
                this.y += this.correction[this.kind - 1][right ? 0 : 1][this.dir][i][1];
                this.dir = ((this.dir + (right ? 1 : -1)) % 6 + 6) % 6;
                buffer = true;
                break;
            }
        }            
        this.display();  
        return buffer;

    }

    //pentiamondに対する操作を無効化するかどうかを設定する
    setInvalidate(invalidate){
        this.invalidate = invalidate;
    }

    //Pentiamondの位置、回転状態、種類を設定する
    setProperty(x, y, dir, kind){
        if(this.visible){
            this.remove();
            this.x = x;
            this.y = y;
            this.dir = dir;
            this.kind = kind;
        }else{
            this.x = x;
            this.y = y;
            this.dir = dir;
            this.kind = kind;
        }
	}

    //すでに表示されているかどうかにかかわらず、設定先がPentiamondと認識できる場合はそれを補足する
    //trueが返ってきたなら成功で、そのときは必ず表示状態になっている
    catch(x, y, dir, kind){

        if(this.invalidate){
            return false;
        }

        for(let i = 0; i < 5; i++){
            if(this.monds[0].canPut(x + this.placement[kind - 1][dir][i][0], y + this.placement[kind - 1][dir][i][1], ((dir + i) % 2 == 0))){
                return false;
            }
        }

        this.visible = false;
        this.setProperty(x, y, dir, kind);
        for(let i = 0; i < 5; i++){
            this.monds[i].setProperty(this.x + this.placement[this.kind - 1][this.dir][i][0], this.y + this.placement[this.kind - 1][this.dir][i][1], ((this.dir + i) % 2 == 0), this.kind);
            this.monds[i].visible = true;
        }

        this.stop = false;
        this.fixed = false; 
        this.visible = true;
        return true;

	}

    //表示されているPentiamondをGhostに変える
    //成功したらtrueが返る
    turnToGhost(){
        if(!this.visible || this.stop || !this.fixed || this.invalidate){ 
            return false;
        }
		        
        for(let i = 0; i < 5; i++){
            this.monds[i].turnToGhost();
        }
        return true;
    }

}