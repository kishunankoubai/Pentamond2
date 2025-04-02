class NuisanceBlockManager{

    //実際にnuisanceBlockを表示するblockManager
    bm;
    //現在盤面上にあるnuisanceBlockを持つ配列
    nuisanceBlocks = [];
    //前回のdamageによるpenalty
    //どのブロックも破壊しないまま地面に着いたnuisanceBlockの数
    penalty = 0;
    //damage処理中ならtrue
    damaging = false;
    //progressを繰り返し実行する用のinterval
    progressInterval = null;
    //一度のdamage処理にかかる時間の目安(ミリ秒)
    damageTime = 2000;
    //damage用に生成するnuisanceBlockの個数
    task = 0;
    //一回のdamage中のnuisanceBlockの生成の進行度合い
    taskCount = 0;
    //nuisanceBlockを三回に一回にする用のcount
    progressCount = 0;
    on = {
        damage: () => {},
        destroyBlock: () => {},
        damageBoard: () => {},
        finishDamage: () => {},
    }

    constructor(bm){
        this.bm = bm;
    }

    //指定した座標でNuisanceBlockを生成する
    createNuisanceBlock(x, y){
        const nb = new Monoiamond(this.bm);
        if(this.bm.canPut(x, y, false)){
            nb.setProperty(x, y, false, 0);
            nb.display();
            this.nuisanceBlocks.push(nb);
        }else if(!this.bm.blocks[x][y].direction){
            this.bm.remove(x, y);
        }else if(0 < x){
            this.bm.remove(x - 1, y);
        }else if(x < this.bm.width - 1){
            this.bm.remove(x + 1, y);
        }else{
            this.bm.remove(x, y);
        }
    }

    //taskの分だけNuisanceBlockによるdamage処理を行う
    damage(task){
        //すでにdamage処理中のとき、taskを増やす
        if(this.damaging && task > 0){
            this.task += task;
            this.progressInterval.reset();
            this.progressInterval.setDelay(this.getProgressFrequency());
            this.progressInterval.start();
            return;
        }

        this.damaging = true;
        this.penalty = 0;
        this.task = task;
        this.progressCount = 0;
        this.progressInterval = new InterruptibleInterval(this.damageProcess.bind(this));
        this.progressInterval.setDelay(this.getProgressFrequency());
        this.progressInterval.start();
        this.on.damage();
    }

    //damage処理中でないときは前回のdamageによるpenaltyを返す
    //damage処理中のときは-1を返す
    getPenalty(){
        if(this.damaging){
            return -1;
        }
        return this.penalty;
    }

    //NuisanceBlockを進行させて、すでにあるブロックとぶつかった場合は対消滅する
    progress(){
        let damageBoard = false;
        for(const nb of this.nuisanceBlocks){
            damageBoard = false;
            //左端でも右端でもないとき
            if(0 < nb.x && nb.x < this.bm.width - 1){
                //左隣が存在するとき
                if(this.bm.blocks[nb.x - 1][nb.y].visible){
                    this.bm.remove(nb.x - 1, nb.y);
                    nb.remove();
                //右隣が存在するとき
                }else if(this.bm.blocks[nb.x + 1][nb.y].visible){
                    this.bm.remove(nb.x + 1, nb.y);
                    nb.remove();
                //一番下に着いたとき
                //このときは対消滅するブロックがないため、代わりにpenaltyを受ける
                }else if(nb.y == this.bm.height - 1){
                    damageBoard = true;
                    nb.remove();
                //真下が下向きで存在するとき
                }else if(this.bm.blocks[nb.x][nb.y + 1].visible && !this.bm.blocks[nb.x][nb.y + 1].direction){
                    this.bm.remove(nb.x, nb.y + 1);
                    nb.remove();
                //左下が下向きで存在するとき
                }else if(this.bm.blocks[nb.x - 1][nb.y + 1].visible && !this.bm.blocks[nb.x - 1][nb.y + 1].direction){
                    this.bm.remove(nb.x - 1, nb.y + 1);
                    nb.remove();
                //右下が下向きで存在するとき
                }else if(this.bm.blocks[nb.x + 1][nb.y + 1].visible && !this.bm.blocks[nb.x + 1][nb.y + 1].direction){
                    this.bm.remove(nb.x + 1, nb.y + 1);
                    nb.remove();
                //真下が上向きで存在するとき
                }else if(this.bm.blocks[nb.x][nb.y + 1].visible){
                    this.bm.remove(nb.x, nb.y + 1);
                    nb.remove();
                }
            //左端ではないとき
            }else if(0 < nb.x){
                //左隣が存在するとき
                if(this.bm.blocks[nb.x - 1][nb.y].visible){
                    this.bm.remove(nb.x - 1, nb.y);
                    nb.remove();
                //一番下に着いたとき
                //このときは対消滅するブロックがないため、代わりにpenaltyを受ける
                }else if(nb.y == this.bm.height - 1){
                    damageBoard = true;
                    nb.remove();
                //真下が下向きで存在するとき
                }else if(this.bm.blocks[nb.x][nb.y + 1].visible && !this.bm.blocks[nb.x][nb.y + 1].direction){
                    this.bm.remove(nb.x, nb.y + 1);
                    nb.remove();
                //左下が下向きで存在するとき
                }else if(this.bm.blocks[nb.x - 1][nb.y + 1].visible && !this.bm.blocks[nb.x - 1][nb.y + 1].direction){
                    this.bm.remove(nb.x - 1, nb.y + 1);
                    nb.remove();
                //真下が上向きで存在するとき
                }else if(this.bm.blocks[nb.x][nb.y + 1].visible){
                    this.bm.remove(nb.x, nb.y + 1);
                    nb.remove();
                }
            //右端ではないとき
            }else if(nb.x < this.bm.width - 1){
                //右隣が存在するとき
                if(this.bm.blocks[nb.x + 1][nb.y].visible){
                    this.bm.remove(nb.x + 1, nb.y);
                    nb.remove();
                //一番下に着いたとき
                //このときは対消滅するブロックがないため、代わりにpenaltyを受ける
                }else if(nb.y == this.bm.height - 1){
                    damageBoard = true;
                    nb.remove();
                //真下が下向きで存在するとき
                }else if(this.bm.blocks[nb.x][nb.y + 1].visible && !this.bm.blocks[nb.x][nb.y + 1].direction){
                    this.bm.remove(nb.x, nb.y + 1);
                    nb.remove();
                //右下が下向きで存在するとき
                }else if(this.bm.blocks[nb.x + 1][nb.y + 1].visible && !this.bm.blocks[nb.x + 1][nb.y + 1].direction){
                    this.bm.remove(nb.x + 1, nb.y + 1);
                    nb.remove();
                //真下が上向きで存在するとき
                }else if(this.bm.blocks[nb.x][nb.y + 1].visible){
                    this.bm.remove(nb.x, nb.y + 1);
                    nb.remove();
                }
            //右端かつ左端のとき
            }else{
                //一番下に着いたとき
                if(nb.y == this.bm.height - 1){
                    damageBoard = true;
                    nb.remove();
                //真下が存在するとき
                }else if(this.bm.blocks[nb.x][nb.y + 1].visible){
                    this.bm.remove(nb.x, nb.y + 1);
                    nb.remove();
                }
            }

            //上記の条件に一つも引っかからなかったとき
            if(nb.visible){
                nb.remove();
                nb.y = nb.y + 1;
                nb.display();
            }else{
                if(damageBoard){
                    this.on.damageBoard();
                    this.penalty++;
                }else{
                    this.on.destroyBlock();
                }
            }
        }

        //対消滅したnuisanceBlockをリストから削除する
        this.nuisanceBlocks = this.nuisanceBlocks.filter((nb) => (nb.visible));
    }

    //progressFrequencyの頻度でNuisanceBlockを進行させつつ、三回に一回の割合で、taskの分だけNuisanceBlockを生成する
    damageProcess(){
        if(this.progressCount == 0){
            //指定されたtaskの量の生成が完了していないとき
            if(this.taskCount < this.task){
                this.progress();
                this.createNuisanceBlock(Math.floor(Math.random() * this.bm.width), 0);
                this.progressCount++;
                this.taskCount++;
            //すでにtaskの量の生成を完了していて、盤面に残っているnuisanceBlockが存在しないとき
            }else if(this.nuisanceBlocks.length == 0){
                this.finishDamage();
            //すでにtaskの量の生成を完了しているが盤面にnuisanceBlockが残っているとき
            }else{
                this.progress();
            }
        }else{
            //盤面に残っているnuisanceBlockが存在しないとき
            if(this.nuisanceBlocks.length == 0){
                this.progressCount = 0;
            //盤面にnuisanceBlockが残っているとき
            }else{
                this.progress();
                this.progressCount++;
            }

            if(this.progressCount == 3){
                this.progressCount = 0;
            }
        }
    }

    //damage処理を終了させる
    finishDamage(){
        this.progressInterval.reset();
        this.task = 0;
        this.progressCount = 0;
        this.taskCount = 0;
        this.on.finishDamage();
        this.damaging = false;
    }

    //progressを呼び出す頻度を取得する
    getProgressFrequency(){
        const frequency = Math.floor(this.damageTime / (3 * (this.task - 1) + this.bm.height));
        if(frequency < 5){
            return 5;
        }else{
            return frequency;
        }
    }

    //damage処理を中止する
    cancelDamage(){
        if(this.progressInterval != null){
            this.progressInterval.reset();
        }
        for(const nb of this.nuisanceBlocks){
            nb.remove();
        }
        this.task = 0;
        this.progressCount = 0;
        this.taskCount = 0;
        this.damaging = false;
    }

    //damage処理を一時中断する
    pause(){
        if(!this.damaging){
            return;
        }
        this.progressInterval.pause();
    }

    //一時中断していたdamage処理を再開する
    resume(){
        if(!this.damaging){
            return;
        }
        this.progressInterval.resume();
    }

    //onプロパティをObjectにより設定する
    setOnProperty(property){
        for(const onDo in this.on){
            if(property[onDo] != null){
                this.on[onDo] = property[onDo];
            }
        }
    }    

}