class InterruptibleTimeout{
    //実行する用の関数
    handler;
    //handlerを実行する遅延時間(ms)
    delay = 0;
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
    //すでにこのTimeoutが終了したならtrue
    isFinished = false;

    //実行する関数を設定する
    constructor(handler){
        this.handler = handler;
    }

    //delayを設定する
    setDelay(delay){
        if(this.started && !this.isFinished){
            console.log("You cannot change delay of InterruptibleTimeout after start before finish");
            return;
        }
        this.delay = delay;
    }

    //Timeoutを開始する
    start(){
        this.reset();
        this.started = true;
        this.startTime =  Date.now();
        this.check();
    }

    //Timeoutの経過時間を取得する
    getElapsedTime(){
        return Date.now() - this.startTime - this.pauseSpan;
    }

    //Timeoutを一時中断する
    pause(){
        if(this.pausing || !this.started || this.isFinished){
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
        if(!this.pausing || !this.started || this.isFinished){
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
        this.started = false;
        this.pausing = false;
        this.isFinished = false;
    }

    //経過時間をチェックする
    check(){
        if(this.getElapsedTime() >= this.delay){
            this.isFinished = true;
            this.handler();
            return;
        }
        if(this.stop){
            this.stop = false;
            this.checkRequest = null;
        }else{
            this.checkRequest = requestAnimationFrame(function(){this.check()}.bind(this));
        }
    }
}