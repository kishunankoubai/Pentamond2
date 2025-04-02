class InterruptibleInterval{
    //実行する用の関数
    handler;
    //handlerを実行する遅延時間(ms)
    delay = 1000;
    //Timeoutの開始時刻
    startTime = 0;
    //直前のpauseの実行時刻
    pauseTime = 0;
    //pauseの合計時間(ms)
    pauseSpan = 0;
    //経過時間をチェックする用のrequestAnimationFrame
    checkRequest;
    //すでにstartしているならtrue
    started = false;
    //pause中ならtrue
    pausing = false;
    //checkを止める用のフラグ
    stop = false;
    //前回の実行が何番目か
    prevousIndex = 0;

    //実行する関数を設定する
    constructor(handler){
        this.handler = handler;
    }

    //delayを設定する
    setDelay(delay){
        if(this.started){
            console.log("You cannot change delay of InterruptibleInterval after start");
            return;
        }
        if(delay == 0){
            console.log("You cannot set delay to 0");
        }
        this.delay = delay;
    }

    //Intervalを開始する
    start(){
        this.reset();
        this.started = true;
        this.startTime =  Date.now();
        this.check();
    }

    //Intervalの経過時間を取得する
    getElapsedTime(){
        return Date.now() - this.startTime - this.pauseSpan;
    }

    //Intervalを一時中断する
    pause(){
        if(this.pausing || !this.started){
            return;
        }
        if(this.checkRequest != null){
            this.stop = true;
        }
        this.pauseTime = Date.now();
        this.pausing = true;
    }

    //pauseにより一時中断していた場合は再開する
    resume(){
        if(!this.pausing || !this.started){
            return;
        }
        this.pauseSpan += Date.now() - this.pauseTime;
        this.pausing = false;
        this.check();
    }

    //delayとhandlerはそのままでstart前に戻す
    reset(){
        if(this.checkRequest != null){
            this.stop = true;
        }
        this.startTime = 0;
        this.pauseTime = 0;
        this.pauseSpan = 0;
        this.prevousIndex = 0;
        this.started = false;
        this.pausing = false;
    }

    //経過時間をチェックする
    check(){
        if(Math.floor(this.getElapsedTime() / this.delay) != this.prevousIndex){
            this.prevousIndex = Math.floor(this.getElapsedTime() / this.delay);
            this.handler();
        }
        if(this.stop){
            this.stop = false;
            this.checkRequest = null;
        }else{
            this.checkRequest = requestAnimationFrame(function(){this.check()}.bind(this));
        }
    }
}