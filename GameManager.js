class GameManager {
    //このGameManagerが管理するMondOperatorの配列
    mondOperators;
    //攻撃処理などを担うnuisanceBlockManagerの配列
    nbm;
    //各MondOperatorに紐づけられたGamaInfoPanelの配列
    gameInfoPanels;
    //現在のmode
    //modeの違いにより様々なゲームシステムを実現できる
    mode = 0;
    //現在のmodeの処理内容が書かれたObject
    //MondOperatorの数だけ用意されている
    nowModeObject;
    //対戦モード
    modeVersus;
    //LINEチャレンジモード
    modeLineCharange;
    //持ち時間制のときの最大持ち時間
    maxCountDownTime = 300;
    //countDownTime時に1count減るまでの時間（ミリ秒）
    countDownRate = 500;
    //攻撃して他にダメージがいくまでの猶予
    attackDelay = 3000;

    //各MondOperatorのscore
    score;
    //各MondOperatorのtrickの名前
    //成立した直後でないなら空文字
    trickName;
    //各MondOperatorのtrick
    //役が成立していない場合はnull
    latestTrick;
    //前回に消去したときのtrick
    prevTrick;
    //各MondOperatorが一列揃えした回数
    line;
    //役を作った回数
    numberOfTrick;
    //連続で役を作った回数
    chain;
    //最大chain
    maxChain;
    //countDownTimeにおいて、timeを減らす値の合計
    penalty;
    //countDownTimeにおいて、timeを増やす値の合計
    bonus;
    //countDownTimeにおいて、timeがmaxCountDownTimeを超えないように調整する
    surplus;

    //攻撃がすでに行われ、damage処理待ちのtask
    scheduledDamage;
    //damage処理を猶予する用のtimeout
    //攻撃が発生してからattackDelayの分だけdamage処理を遅らせる
    damageTimeout;
    //これがtrueの状態でputするとdamage処理が発生する
    damageFlag;
    //連続消去などでの累積中のdamage
    cumulativeDamage;
    //受けたdamageの合計
    receivedDamage;
    //与えたdamageの合計
    gaveDamage;
    //ダメージや時間回復量の値補正
    handicap;

    //musicManager
    mm;

    //GameInfoPanel更新用のrequestAnimationFrameのId
    animationFrameId;
    playing = false;
    pausing = false;
    winner = [];
    solo = false;
    on = {
        finish: () => {},
    };

    constructor(trickSetting, playPanels) {
        this.playPanels = playPanels;
        this.mondOperators = this.playPanels.map((p) => p.pf.getMondOperator());
        this.gameInfoPanels = this.playPanels.map((p) => p.gameInfoPanel);
        this.createModeObject();

        this.nbm = new Array(this.mondOperators.length);
        this.latestTrick = new Array(this.mondOperators.length);
        this.prevTrick = new Array(this.mondOperators.length);

        for (let i = 0; i < this.mondOperators.length; i++) {
            this.nbm[i] = new NuisanceBlockManager(this.mondOperators[i].bm);
            this.latestTrick[i] = new TrickManager(trickSetting);
            this.prevTrick[i] = new TrickManager(trickSetting);
        }

        this.initialize();
    }

    //このGameManagerを初期化する
    initialize() {
        cancelAnimationFrame(this.animationFrameId);
        this.playPanels.forEach((p) => {
            p.removeAnimation("");
        });
        this.mondOperators.forEach((m) => {
            m.initialize();
        });
        this.trickName = this.mondOperators.map(() => "");
        this.latestTrick.forEach((t) => {
            t.initialize();
        });
        this.prevTrick.forEach((t) => {
            t.initialize();
        });
        this.gameInfoPanels.forEach((g) => {
            g.initialize();
        });
        this.nowModeObject = null;
        this.score = this.mondOperators.map(() => 0);
        this.line = this.mondOperators.map(() => 0);
        this.numberOfTrick = this.mondOperators.map(() => 0);
        this.chain = this.mondOperators.map(() => 0);
        this.maxChain = this.mondOperators.map(() => 0);
        this.penalty = this.mondOperators.map(() => 0);
        this.bonus = this.mondOperators.map(() => 0);
        this.surplus = this.mondOperators.map(() => 0);
        this.scheduledDamage = this.mondOperators.map(() => 0);
        this.damageTimeout = this.mondOperators.map(() => null);
        this.damageFlag = this.mondOperators.map(() => false);
        this.cumulativeDamage = this.mondOperators.map(() => 0);
        this.receivedDamage = this.mondOperators.map(() => 0);
        this.gaveDamage = this.mondOperators.map(() => 0);
        this.handicap = this.mondOperators.map(() => 1);
        this.playing = false;
        this.pausing = false;
        this.winner = [];
        this.solo = false;
        this.mode = 0;
    }

    //GameのModeを設定する
    setMode(mode) {
        if (this.mondOperators[0].playing || this.mondOperators[0].finishTime) {
            return;
        }
        this.mode = mode;
        switch (mode) {
            case 1:
                this.setNowModeObject(this.modeVersus);
                this.gameInfoPanels.forEach((g) => {
                    g.setVisible(true, false, false, true, true);
                });
                break;
            case 2:
                this.setNowModeObject(this.modeLineCharange);
                this.gameInfoPanels.forEach((g) => {
                    g.setVisible(false, true, true, false, true);
                });
                break;
        }
    }

    //Gameを開始する
    start() {
        if (this.nowModeObject == null) {
            this.setMode(1);
        }
        this.playing = true;
        this.mondOperators[0].start();
        for (const m of this.mondOperators) {
            m.start();
            m.startTime = this.mondOperators[0].startTime;
        }
        this.reloadGame();
    }

    //Modeごとに、そのの処理を表すObjectを作成する
    createModeObject() {
        this.modeVersus = new Array(this.mondOperators.length);
        this.modeLineCharange = new Array(this.mondOperators.length);

        for (let i = 0; i < this.mondOperators.length; i++) {
            //対戦モード
            this.modeVersus[i] = {
                moveRight: () => {
                    this.mm?.playSe(3);
                },
                moveLeft: () => {
                    this.mm?.playSe(3);
                },
                moveDown: () => {
                    this.mm?.playSe(3);
                },
                slip: () => {
                    this.mm?.playSe(4);
                },
                put: () => {
                    this.score[i] += 10;
                    if (this.cumulativeDamage[i] != 0) {
                        this.attackFrom(i, Math.floor(this.cumulativeDamage[i] / (this.getNumberOfPlayingMondOperators() - 1)));
                        this.cumulativeDamage[i] = 0;
                    }
                    if (this.damageFlag[i]) {
                        this.nbm[i].damage(this.scheduledDamage[i]);
                        this.receivedDamage[i] += this.scheduledDamage[i];
                        this.scheduledDamage[i] = 0;
                        this.damageFlag[i] = false;
                        this.playPanels[i].removeAnimation("preparingDamageAnimation");
                        this.playPanels[i].removeAnimation("waitingDamageAnimation");
                    }
                    this.chain[i] = 0;
                    this.trickName[i] = "";
                    this.mm?.playSe(0);
                },
                spinRight: () => {
                    this.mm?.playSe(1);
                },
                spinLeft: () => {
                    this.mm?.playSe(2);
                },
                hold: () => {
                    this.mm?.playSe(6);
                },
                unPut: () => {
                    this.score[i] -= 10;
                    this.penalty[i] += 3;
                    this.mm?.playSe(5);
                },
                pause: () => {},
                reopen: () => {},
                removeLine: () => {
                    if (this.latestTrick[i].getIndex() == null) {
                        this.prevTrick[i].initialize();
                    } else {
                        this.prevTrick[i].setContents(this.latestTrick[i].contents);
                    }
                    this.latestTrick[i].setContents(this.mondOperators[i].latestRemoveLine);
                    //役がある場合
                    if (this.latestTrick[i].getIndex() != null) {
                        this.score[i] += (this.latestTrick[i].getPoint() + this.latestTrick[i].getAttack()) * 50;
                        this.chain[i]++;
                        this.numberOfTrick[i]++;
                        this.trickName[i] = this.latestTrick[i].getTrickName();
                        //一列揃えのとき
                        if (this.latestTrick[i].getIndex() == 0 || this.latestTrick[i].getIndex() == 1) {
                            this.line[i]++;
                        }
                        this.cumulativeDamage[i] += Math.floor(this.latestTrick[i].getAttack() * this.handicap[i]);
                        this.bonus[i] += Math.floor(this.latestTrick[i].getPoint() * this.handicap[i]);
                        //連続で役が成立したとき
                        if (this.chain[i] >= 2) {
                            this.cumulativeDamage[i] += 1;
                            this.bonus[i] += 1;
                            this.score[i] += (this.chain[i] - 1) * 100;
                        }
                        //bonusによりcountDownTimeがmaxCountDownTimeを超えてしまったとき
                        if (this.maxCountDownTime < this.getCountDownTime(i)) {
                            this.surplus[i] = this.mondOperators[i].getPlayTime() - (this.bonus[i] - this.penalty[i]) * this.countDownRate;
                        }
                        if (this.chain[i] > this.maxChain[i]) {
                            this.maxChain[i] = this.chain[i];
                        }
                        this.mm?.playSe(7);
                        //役がない場合
                    } else {
                        if (this.prevTrick[i].getIndex() == null) {
                            this.penalty[i] += 3;
                        }
                        this.chain[i] = 0;
                        this.mm?.playSe(8);
                    }
                },
                damage: () => {
                    this.mondOperators[i].pm.remove();
                    this.mondOperators[i].pm.setInvalidate(true);
                    this.mondOperators[i].bm.removeGhost();
                },
                destroyBlock: () => {
                    this.playPanels[i].removeAnimation("shakeAnimation");
                    this.mm?.playSe(14);
                },
                damageBoard: () => {
                    this.penalty[i]++;
                    this.playPanels[i].removeAnimation("shakeAnimation");
                    this.playPanels[i].addAnimation("shakeAnimation");
                    this.mm?.playSe(15);
                },
                finishDamage: () => {
                    if (this.mondOperators[i].playing) {
                        this.mondOperators[i].pm.setInvalidate(false);
                        this.mondOperators[i].pm.display();
                        this.mondOperators[i].createGhost();
                        this.playPanels[i].removeAnimation("shakeAnimation");
                    }
                },
                reloadGameInfoPanel: () => {
                    this.gameInfoPanels[i].setLabels("" + this.getCountDownTime(i), "", "", this.trickName[i], "" + this.score[i]);
                },
            };

            //LINEチャレンジモード
            this.modeLineCharange[i] = {
                moveRight: () => {
                    this.mm?.playSe(3);
                },
                moveLeft: () => {
                    this.mm?.playSe(3);
                },
                moveDown: () => {
                    this.mm?.playSe(3);
                },
                slip: () => {
                    this.mm?.playSe(4);
                },
                put: () => {
                    this.score[i] += 10;
                    this.chain[i] = 0;
                    this.trickName[i] = "";
                    this.mm?.playSe(0);
                },
                spinRight: () => {
                    this.mm?.playSe(1);
                },
                spinLeft: () => {
                    this.mm?.playSe(2);
                },
                hold: () => {
                    this.mm?.playSe(6);
                },
                unPut: () => {
                    this.score[i] -= 10;
                    this.mm?.playSe(5);
                },
                pause: () => {},
                reopen: () => {},
                removeLine: () => {
                    if (this.latestTrick[i].getIndex() == null) {
                        this.prevTrick[i].initialize();
                    } else {
                        this.prevTrick[i].setContents(this.latestTrick[i].contents);
                    }
                    this.latestTrick[i].setContents(this.mondOperators[i].latestRemoveLine);
                    //役がある場合
                    if (this.latestTrick[i].getIndex() != null && (this.latestTrick[i].getIndex() == 0 || this.latestTrick[i].getIndex() == 1)) {
                        this.score[i] += (this.latestTrick[i].getPoint() + this.latestTrick[i].getAttack()) * 50;
                        this.chain[i]++;
                        this.numberOfTrick[i]++;
                        this.line[i]++;
                        //連続で役が成立したとき
                        if (this.chain[i] >= 2) {
                            this.cumulativeDamage[i] += 1;
                            this.bonus[i] += 1;
                            this.score[i] += (this.chain[i] - 1) * 100;
                        }
                        if (this.chain[i] > this.maxChain[i]) {
                            this.maxChain[i] = this.chain[i];
                        }
                        this.mm?.playSe(7);
                        //役がない場合
                    } else {
                        this.chain[i] = 0;
                        this.mm?.playSe(8);
                    }
                },
                damage: () => {},
                destroyBlock: () => {},
                damageBoard: () => {},
                finishDamage: () => {},
                reloadGameInfoPanel: () => {
                    this.gameInfoPanels[i].setLabels("", "" + this.getCountUpTime(i), "" + this.line[i], "", "" + this.score[i]);
                },
            };
        }
    }

    //主にタイムアタックで使われる、startからの経過時間を表す文字列を取得する
    getCountUpTime(index) {
        const timeRounded = Math.floor(this.mondOperators[index].getPlayTime() / 10);
        return Math.floor(timeRounded / 100) + "." + (timeRounded % 100 < 10 ? "0" + (timeRounded % 100) : timeRounded % 100);
    }

    //主に対戦などで使われる、Playerの残りの持ち時間を取得する
    getCountDownTime(index) {
        return Math.max(this.maxCountDownTime - Math.floor((this.mondOperators[index].getPlayTime() - this.surplus[index]) / this.countDownRate) - this.penalty[index] + this.bonus[index], 0);
    }

    //このGameManagerに登録されているMondOperatorの数を返す
    getNumberOfPlayingMondOperators() {
        let count = 0;
        for (const m of this.mondOperators) {
            if (m.playing) {
                count++;
            }
        }
        return count;
    }

    //現在のModeを表すNowModeObjectを設定する
    setNowModeObject(modeObject) {
        this.nowModeObject = modeObject;
        for (let i = 0; i < this.mondOperators.length; i++) {
            this.mondOperators[i].setOnProperty(this.nowModeObject[i]);
            this.nbm[i].setOnProperty(this.nowModeObject[i]);
        }
    }

    //GameInfoPanelをreloadする
    //一度呼ぶとfinishするまで繰り返し呼ばれ続ける
    reloadGame() {
        //play中のGameInfoPanelを更新する
        for (let i = 0; i < this.mondOperators.length; i++) {
            if (this.mondOperators[i].playing) {
                this.nowModeObject[i].reloadGameInfoPanel();
            }
        }
        //play中のmondOperatorのList、まだfinishしていないがfinishの要件を満たしたmondOperatorのListを定義する
        const playingList = this.mondOperators.filter((m) => m.playing);
        let finishList = [];
        switch (this.mode) {
            case 1:
                finishList = this.mondOperators.filter((_, i) => (this.getCountDownTime(i) == 0 || Number.isNaN(this.getCountDownTime(i))) && this.mondOperators[i].playing);
                //Play中のMondOperatorが同時にfinishしたとき
                if (playingList.length == finishList.length) {
                    this.winner = this.mondOperators.map((_, i) => i).filter((i) => finishList.includes(this.mondOperators[i]));
                    //一つを除いてfinishしたとき
                } else if (playingList.length - finishList.length == 1 && !this.solo) {
                    finishList.forEach((m) => {
                        m.finish();
                    });
                    this.winner = this.mondOperators.map((_, i) => i).filter((i) => this.mondOperators[i].playing);
                }
                for (let i = 0; i < this.mondOperators.length; i++) {
                    if (this.getCountDownTime(i) <= 20 && !this.playPanels[i].animations.includes("dangerousAnimation")) {
                        this.playPanels[i].addAnimation("dangerousAnimation");
                    } else if (this.getCountDownTime(i) > 20 && this.playPanels[i].animations.includes("dangerousAnimation")) {
                        this.playPanels[i].removeAnimation("dangerousAnimation");
                    }
                }
                break;
            case 2:
                this.winner = this.mondOperators.map((_, i) => i).filter((i) => this.line[i] == 15);
                if (this.winner.length != 0) {
                    finishList = this.mondOperators.filter((_, i) => !this.winner.includes(i));
                    console.log(finishList);
                }
                break;
        }

        //finish予定のmondOperatorをfinishさせる
        finishList.forEach((m) => {
            m.finish();
        });

        //勝敗が決まったとき
        if (this.winner.length != 0) {
            cancelAnimationFrame(this.animationFrameId);
            this.winner.forEach((i) => {
                this.mondOperators[i].finish();
            });
            this.playing = false;
            this.mondOperators
                .map((_, i) => i)
                .filter((i) => finishList.includes(this.mondOperators[i]))
                .forEach((i) => {
                    if (!this.winner.includes(i)) {
                        this.damageTimeout
                            .filter((t, j) => t != null && i == j)
                            .forEach((t) => {
                                t.reset();
                            });
                        this.nbm[i].cancelDamage();
                        this.playPanels[i].removeAnimation("");
                        this.playPanels[i].addAnimation("crushAnimation");
                    }
                });
            this.on.finish();
            return;
            //勝敗が決まらなかったが新たにfinishするmondOperatorがあるとき
        } else if (finishList.length != 0) {
            this.mondOperators
                .map((_, i) => i)
                .filter((i) => finishList.includes(this.mondOperators[i]))
                .forEach((i) => {
                    this.damageTimeout
                        .filter((t, j) => t != null && i == j)
                        .forEach((t) => {
                            t.reset();
                        });
                    this.playPanels[i].removeAnimation("");
                    this.playPanels[i].addAnimation("crushAnimation");
                });
        }

        this.animationFrameId = requestAnimationFrame(this.reloadGame.bind(this));
    }

    //指定したPlayerのPlayを終了させる
    finish(index) {
        if (!this.mondOperators[index].playing || this.pausing) {
            return;
        }
        this.mondOperators[index].finish();
        this.mondOperators[index].bm.turnAllBlocksToNeutral();
    }

    //Gameを一時停止させる
    pause() {
        if (this.pausing || !this.playing) {
            return;
        }
        for (let i = 0; i < this.mondOperators.length; i++) {
            this.mondOperators[i].pause();
        }
        for (let i = 0; i < this.mondOperators.length; i++) {
            this.nbm[i].pause();
        }
        this.damageTimeout
            .filter((t) => t != null)
            .forEach((t) => {
                t.pause();
            });
        this.pausing = true;
    }

    //Gameの一時停止を解除する
    reopening() {
        if (!this.pausing) {
            return;
        }
        this.mondOperators[0].reopening();
        for (let i = 1; i < this.mondOperators.length; i++) {
            this.mondOperators[i].reopening();
            this.mondOperators[i].pauseSpan = this.mondOperators[0].pauseSpan;
        }
        for (let i = 0; i < this.mondOperators.length; i++) {
            this.nbm[i].resume();
        }
        this.damageTimeout
            .filter((t) => t != null)
            .forEach((t) => {
                t.resume();
            });
        this.pausing = false;
    }

    //指定したindex以外のMondOperatorに、指定したdamageを与える
    attackFrom(index, damage) {
        console.log("Player " + index + " attacked");
        //正味のdamage
        let netDamage = damage;
        this.gaveDamage[index] += damage;
        //相殺できるとき
        if (this.scheduledDamage[index] <= damage) {
            if (this.damageTimeout[index] != null) {
                this.damageTimeout[index].reset();
            }
            this.damageTimeout[index] = null;
            this.damageFlag[index] = false;
            netDamage = damage - this.scheduledDamage[index];
            if (this.scheduledDamage[index] != 0) {
                console.log("the damage of Player " + index + " (" + this.scheduledDamage[index] + ")" + " was offset");
                console.log("the rest is " + netDamage);
            }
            if (netDamage == 0) {
                return;
            }
            this.scheduledDamage[index] = 0;
            this.playPanels[index].removeAnimation("");
            //相殺できないとき
        } else {
            this.scheduledDamage[index] -= damage;
            return;
        }
        if (!this.solo) {
            this.mm?.playSe(16);
        }
        for (let i = 0; i < this.mondOperators.length; i++) {
            //攻撃元以外に対して
            if (i != index && this.mondOperators[i].playing) {
                //damageFlagが立っておらず、立てる予定もないとき
                if (this.damageTimeout[i] == null && !this.damageFlag[i]) {
                    this.scheduledDamage[i] = netDamage;
                    this.playPanels[i].removeAnimation("shakeAnimation");
                    this.playPanels[i].addAnimation("preparingDamageAnimation");
                    console.log(this.scheduledDamage[i] + " damage is scheduled to Player " + i + " from Player " + index);
                    this.damageTimeout[i] = new InterruptibleTimeout(
                        function () {
                            this.damageFlag[i] = true;
                            this.damageTimeout[i] = null;
                            this.playPanels[i].removeAnimation("preparingDamageAnimation");
                            this.playPanels[i].addAnimation("waitingDamageAnimation");
                            console.log("damageDelay of Player " + i + " is finished");
                        }.bind(this)
                    );
                    this.damageTimeout[i].setDelay(this.attackDelay);
                    this.damageTimeout[i].start();
                } else {
                    this.scheduledDamage[i] += netDamage;
                }
            }
        }
    }

    kill(index) {
        this.penalty[index] = Infinity;
        this.mm?.playSe(15);
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
