class StandardGamepad{

    name = "";
    gp = null;

    //gamepadを受け取って種類を判別する
    constructor(gp){

        this.reloadGamepad(gp);

    }

    //gamepadを受け取ってそれに更新する
    reloadGamepad(gp){

        this.gp = gp;
        if(this.gp.id.includes("PLAYSTATION(R)3 Controller")){
            this.name = "PLAYSTATION(R)3 Controller";
        }else if(this.gp.id.includes("PC Game Controller        (Vendor: 11ff Product: 3331)")){
            this.name = "PC Game Controller        (Vendor: 11ff Product: 3331)";
        }else if(this.gp.id == "Wireless Gamepad (STANDARD GAMEPAD Vendor: 057e Product: 2006)"){
            this.name = "Wireless Gamepad (STANDARD GAMEPAD Vendor: 057e Product: 2006)";
        }else if(this.gp.id == "Wireless Gamepad (STANDARD GAMEPAD Vendor: 057e Product: 2007)"){
            this.name = "Wireless Gamepad (STANDARD GAMEPAD Vendor: 057e Product: 2007)";
        }else if(this.gp.id == "USB 2A8K  GamePad           (Vendor: 040b Product: 6530)"){
            this.name = "USB 2A8K  GamePad           (Vendor: 040b Product: 6530)";
        }

    }

    //standard gamepadにおける配置でbuttonを取得する
    //もともとstandard gamepadならうまく動く
    getButton(index){

        if(index >= this.gp.buttons.length || index < 0){
            return undefined;
        }

        if(this.name == "PLAYSTATION(R)3 Controller"){
            const value = [14, 13, 15, 12, 10, 11, 8, 9, 0, 3, 1, 2, 4, 6, 7, 5, 16];
            if(index >= value.length){
                return undefined;
            }
            return this.gp.buttons[value[index]];                       
        }else if(this.name == "PC Game Controller        (Vendor: 11ff Product: 3331)"){
            //ELECOM JC-U2912FBK
            const value = [2, 3, 0, 1, 4, 5, 6, 7, 10, 11, 8, 9];
            if(index >= value.length){
                return undefined;
            }
            return this.gp.buttons[value[index]]; 
        }else if(this.name == "Wireless Gamepad (STANDARD GAMEPAD Vendor: 057e Product: 2006)"){
            //ジョイコンL
            const value = [0, 1, 2, 3, 4, 5, undefined, undefined, undefined, 9, 10, undefined, undefined, undefined, undefined, undefined, 16];
            if(index >= value.length){
                return undefined;
            }
            return this.gp.buttons[value[index]];
        }else if(this.name == "Wireless Gamepad (STANDARD GAMEPAD Vendor: 057e Product: 2007)"){
            //ジョイコンR
            const value = [0, 1, 2, 3, 4, 5, undefined, undefined, undefined, 9, 10, undefined, undefined, undefined, undefined, undefined, 16];
            if(index >= value.length){
                return undefined;
            }
            return this.gp.buttons[value[index]];
        }else if(this.name == "USB 2A8K  GamePad           (Vendor: 040b Product: 6530)"){
            //ELECOM JC-U1608TWH
            const value = [2, 3, 0, 1, undefined, undefined, 4, 5, 6, 7];
            if(index >= value.length){
                return undefined;
            }
            return this.gp.buttons[value[index]];
        }

        return this.gp.buttons[index];

    }

    //standard gamepadにおける配置でbuttonが押されているかどうかを返す
    //存在しないindexの場合はfalseを返す
    getButtonPressed(index){
        if(this.getButton(index) == undefined){
            return false;
        }
        return this.getButton(index).pressed;

    }

    //standard gamepadにおける配置でAxisを取得する
    //もともとstandard gamepadならうまく動く
    getAxis(index){
        
        if(index >= this.gp.axes.length || index < 0){
            return  undefined;
        }

        if(this.name == "PLAYSTATION(R)3 Controller"){
            const value = [0, 1, 2, 5];
            return this.gp.axes[value[index]];                       
        }

        return this.gp.axes[index];

    }

    //standard gamepadにおける配置でのAxisの値を返す
    //存在しないindexの場合は0を返す
    getAxisValue(index){
        if(this.getAxis(index) == undefined){
            return false;
        }
        return this.getAxis(index);

    }

}