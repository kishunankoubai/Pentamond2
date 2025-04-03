class PageManager {
    //現在のpageの名前
    page;
    //現在のpageのelement
    pageElement;
    //開いたpageの記録
    //pageを戻る処理に必要になる
    pageMemory = [];
    //page内のpage、subPageで、今表示するのは何番目かを表す
    //subPageを含むpageで用いられる
    subPageIndex = 1;
    //gameにおけるplayerの人数
    numberOfPlayers;
    //playFieldの設定
    setting;
    //trickの設定
    trickSetting;
    //各trickの形を表すpanel
    //trickSettingの順番に入っている
    trickPanels = [];
    //Pentamondの大本となるpentamondBaseのelement
    pentamondBase;
    //実際にgameをするplayPanel
    //numberOfPlayersの分だけ生成される
    playPanels = [];
    //playPanelを表示するpage要素
    playBase;
    //game部分を担うgameManager
    gameManager;
    //gameManagerを動かす用の入力を受け付けるinputManager
    inputManager;
    //設定されたmode
    mode = 0;
    //ソロプレイかどうか
    solo = false;
    //音楽の再生処理関連を扱うmusicManager
    musicManager = new MusicManager();
    //play中のbgm
    //[ソロ, マルチ]
    playBgm = [1, 4];
    //流れたbgmの記録
    //pageを戻る処理の際に必要となる
    bgmMemory = [];
    //ページが読み込まれてからstartをまだ押していないならtrue
    firstStart = true;
    //デバッグ用
    debug = false;

    constructor(setting, trickSetting) {
        this.pentamondBase = document.getElementById("pentamondBase");
        this.setSettings(setting, trickSetting);
        this.addEventListeners();
        this.setButtonsOnClick();
        this.setTrickDisplay();
        this.musicManager.on.setBgm = () => {
            this.bgmMemory[this.bgmMemory.length - 1] = this.musicManager.nowBgmIndex;
        };
        this.musicManager.setCanOperate = this.setCanOperate;
    }

    //このpageを始めるときに呼ぶ
    //pageがtitleに設定される
    pageStart() {
        this.page = "title";
        for (const p of document.getElementsByClassName("page")) {
            p.style.display = "none";
        }
        for (const p of document.getElementsByClassName("subPage")) {
            p.style.display = "none";
        }
        this.pageElement = document.getElementById(this.page);
        this.pageElement.style.display = "flex";
        this.pageMemory.push(this.page);
        this.bgmMemory.push(0);
        this.pentamondBase.style.visibility = "visible";
        this.setSize();
        this.setCanOperate(true);
    }

    //pageを設定する
    setPage(page, index = 1) {
        if (!this.setPageVisibility(page)) {
            return;
        }
        this.pageMemory.push(page);
        this.page = page;
        this.setSubPageIndex(index);
        this.setSize();
        this.bgmMemory.push(this.bgmMemory[this.bgmMemory.length - 1]);
    }

    //指定したpageを表示し、それ以外を非表示にする
    setPageVisibility(page) {
        if (document.getElementById(page) == null) {
            return false;
        }
        for (const p of document.getElementsByClassName("page")) {
            this.removeClassName(p, "fadein");
            this.addClassName(p, "fadeout");
        }
        for (const p of document.getElementsByClassName("subPage")) {
            this.removeClassName(p, "subPageFadein");
            this.addClassName(p, "subPageFadeout");
        }
        this.pageElement = document.getElementById(page);
        this.removeClassName(this.pageElement, "fadeout");
        this.addClassName(this.pageElement, "fadein");
        this.pageElement.style.display = "flex";
        return true;
    }

    //具体的なindexを指定してsubPageを表示する
    setSubPageIndex(index) {
        if (this.pageElement.className.includes("subPageParent")) {
            for (const child of this.pageElement.children) {
                if (child.className.split(" ").includes("subPage")) {
                    if (child.dataset.index == index) {
                        child.style.display = "flex";
                        this.removeClassName(child, "subPageFadeout");
                        this.addClassName(child, "subPageFadein");
                        child.style.display = "flex";
                    } else {
                        child.style.display = "none";
                    }
                }
                if (child.className.includes("subPageControler")) {
                    Array.from(child.children).filter((e) => e.className.includes("subPageLabel"))[0].innerText = index + "/" + this.pageElement.dataset.maxpage;
                }
            }
        }
        this.subPageIndex = index;
        this.setSize();
        this.setCanOperate(false);
        setTimeout(() => {
            this.setCanOperate(true);
        }, 200);
    }

    //現在のsubPageIndexから指定した分だけ、表示するsubPageを相対的に変更する
    setSubPage(number) {
        const maxPage = +this.pageElement.dataset.maxpage;
        this.setSubPageIndex((((maxPage + this.subPageIndex + number) % maxPage) + maxPage) % maxPage || maxPage);
    }

    //指定したプレイ人数でPlayBaseを作成する
    //まあまあ時間がかかる(30msぐらい)
    createPlayBase(numberOfPlayers) {
        this.removePlayBase();
        this.numberOfPlayers = numberOfPlayers;
        this.playBase = document.createElement("div");
        this.playBase.id = "playBase";
        this.playBase.className = "page";
        document.getElementById("pentamondBase").appendChild(this.playBase);
        switch (this.numberOfPlayers) {
            case 1:
                this.playBase.style.height = 95 + "%";
                break;
            case 2:
                this.playBase.style.height = 82 + "%";
                break;
            case 3:
                this.playBase.style.height = 54 + "%";
                break;
            case 4:
                this.playBase.style.height = 39 + "%";
                break;
            case 5:
                this.playBase.style.height = 31 + "%";
                break;
        }
        this.playPanels = new Array(this.numberOfPlayers);
        for (let i = 0; i < this.numberOfPlayers; i++) {
            this.playPanels[i] = new PlayPanel(this.setting);
            this.playBase.append(this.playPanels[i].getPlayPanel());
            this.playPanels[i].adjustPlayPanel();
        }
        this.gameManager = new GameManager(this.trickSetting, this.playPanels);
        this.gameManager.solo = this.solo;
        this.gameManager.mm = this.musicManager;
        this.inputManager = new InputManager(this.gameManager);
        this.inputManager.setPageManager(this);
        this.inputManager.addAllGamepad();
        this.inputManager.startGamepadLoop();
        this.playBase.style.display = "none";
        for (const selectorPanel of document.getElementsByClassName("handicapSelectorPanel")) {
            if (+selectorPanel.dataset.index <= this.numberOfPlayers) {
                selectorPanel.style.display = "flex";
            } else {
                selectorPanel.style.display = "none";
            }
        }
        for (const selectorPanel of document.getElementsByClassName("controlerSelectorPanel")) {
            if (+selectorPanel.dataset.index <= this.numberOfPlayers) {
                selectorPanel.style.display = "flex";
            } else {
                selectorPanel.style.display = "none";
            }
        }
        if (this.mode == 1) {
            document.getElementById("timeSettingButton").style.display = "block";
            document.getElementById("handicapButton").style.display = "block";
        } else {
            document.getElementById("timeSettingButton").style.display = "none";
            document.getElementById("handicapButton").style.display = "none";
        }

        if (!this.solo) {
            switch (this.mode) {
                case 1:
                    this.gameManager.on.finish = () => {
                        this.musicManager.setBgm(0);
                        setTimeout(() => {
                            //勝者が一人のとき
                            if (this.gameManager.winner.length == 1) {
                                document.getElementById("resultLabel").innerText = "Player " + (this.gameManager.winner[0] + 1) + " Won!";
                                //全員勝利のとき
                            } else if (this.gameManager.winner.length == this.numberOfPlayers) {
                                document.getElementById("resultLabel").innerText = "Draw";
                                //それ以外
                            } else {
                                let winnerWord = "Player " + (this.gameManager.winner[0] + 1);
                                for (let i = 1; i < this.gameManager.winner.length; i++) {
                                    winnerWord += ", " + (this.gameManager.winner[i] + 1);
                                }
                                document.getElementById("resultLabel").innerText = winnerWord + " Won!";
                            }
                            this.setPage("result");
                            this.musicManager.setBgm(5);
                        }, 2000);

                        //detailResultの内容の設定
                        const detailResult = document.getElementById("detailResult");
                        detailResult.dataset.maxpage = this.numberOfPlayers + "";
                        for (const child of Array.from(detailResult.children)) {
                            if (child.className.split(" ").includes("subPage")) {
                                const index = +child.dataset.index;
                                for (const grandChild of Array.from(child.children)) {
                                    if (grandChild.className.includes("selectPanel") && index <= this.numberOfPlayers) {
                                        for (const greatGrandChild of Array.from(grandChild.children)) {
                                            if (greatGrandChild.className.includes("text")) {
                                                if (+greatGrandChild.dataset.index == 1) {
                                                    greatGrandChild.innerHTML =
                                                        "" +
                                                        "Player " +
                                                        index +
                                                        "<br>" +
                                                        "プレイ時間:" +
                                                        this.gameManager.getCountUpTime(index - 1) +
                                                        "<br>" +
                                                        "Score:" +
                                                        this.gameManager.score[index - 1] +
                                                        "<br>" +
                                                        "最大Chain:" +
                                                        Math.max(this.gameManager.maxChain[index - 1] - 1, 0) +
                                                        "<br>" +
                                                        "一列揃えの回数:" +
                                                        this.gameManager.line[index - 1] +
                                                        "<br>" +
                                                        "役を揃えた回数:" +
                                                        this.gameManager.numberOfTrick[index - 1] +
                                                        "<br>" +
                                                        "減ったTimeの合計:" +
                                                        this.gameManager.penalty[index - 1] +
                                                        "<br>" +
                                                        "回復したTimeの合計:" +
                                                        this.gameManager.bonus[index - 1] +
                                                        "<br>";
                                                } else if (+greatGrandChild.dataset.index == 2) {
                                                    greatGrandChild.innerHTML =
                                                        "" +
                                                        "<br>" +
                                                        "受けたダメージの合計:" +
                                                        this.gameManager.receivedDamage[index - 1] +
                                                        "<br>" +
                                                        "与えたダメージの合計:" +
                                                        this.gameManager.gaveDamage[index - 1] +
                                                        "<br>" +
                                                        "モンドを設置した回数:" +
                                                        this.gameManager.mondOperators[index - 1].putCount +
                                                        "<br>" +
                                                        "一手戻しした回数:" +
                                                        this.gameManager.mondOperators[index - 1].unPutCount +
                                                        "<br>";
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    };
                    break;

                case 2:
                    this.gameManager.on.finish = () => {
                        this.musicManager.setBgm(0);
                        setTimeout(() => {
                            //勝者が一人のとき
                            if (this.gameManager.winner.length == 1) {
                                document.getElementById("resultLabel").innerText = "Player " + (this.gameManager.winner[0] + 1) + " Won!";
                                //全員勝利のとき
                            } else if (this.gameManager.winner.length == this.numberOfPlayers) {
                                document.getElementById("resultLabel").innerText = "Draw";
                                //それ以外
                            } else {
                                let winnerWord = "Player " + (this.gameManager.winner[0] + 1);
                                for (let i = 1; i < this.gameManager.winner.length; i++) {
                                    winnerWord += ", " + (this.gameManager.winner[i] + 1);
                                }
                                document.getElementById("resultLabel").innerText = winnerWord + " Won!";
                            }
                            this.setPage("result");
                            this.musicManager.setBgm(5);
                        }, 2000);

                        //detailResultの内容の設定
                        const detailResult = document.getElementById("detailResult");
                        detailResult.dataset.maxpage = this.numberOfPlayers + "";
                        for (const child of Array.from(detailResult.children)) {
                            if (child.className.split(" ").includes("subPage")) {
                                const index = +child.dataset.index;
                                for (const grandChild of Array.from(child.children)) {
                                    if (grandChild.className.includes("selectPanel") && index <= this.numberOfPlayers) {
                                        for (const greatGrandChild of Array.from(grandChild.children)) {
                                            if (greatGrandChild.className.includes("text")) {
                                                if (+greatGrandChild.dataset.index == 1) {
                                                    greatGrandChild.innerHTML =
                                                        "" +
                                                        "Player " +
                                                        index +
                                                        "<br>" +
                                                        "Time:" +
                                                        this.gameManager.getCountUpTime(index - 1) +
                                                        "<br>" +
                                                        "Score:" +
                                                        this.gameManager.score[index - 1] +
                                                        "<br>" +
                                                        "最大Chain:" +
                                                        Math.max(this.gameManager.maxChain[index - 1] - 1, 0) +
                                                        "<br>" +
                                                        "一列揃えの回数:" +
                                                        this.gameManager.line[index - 1] +
                                                        "<br>";
                                                } else if (+greatGrandChild.dataset.index == 2) {
                                                    greatGrandChild.innerHTML =
                                                        "" +
                                                        "<br>" +
                                                        "モンドを設置した回数:" +
                                                        this.gameManager.mondOperators[index - 1].putCount +
                                                        "<br>" +
                                                        "一手戻しした回数:" +
                                                        this.gameManager.mondOperators[index - 1].unPutCount +
                                                        "<br>";
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    };
                    break;
            }
        } else {
            switch (this.mode) {
                case 1:
                    this.gameManager.on.finish = () => {
                        this.musicManager.setBgm(0);
                        setTimeout(() => {
                            document.getElementById("resultLabel").innerText = "Score: " + this.gameManager.score[0] + "";
                            this.setPage("result");
                            this.musicManager.setBgm(5);
                        }, 2000);

                        //detailResultの内容の設定
                        const detailResult = document.getElementById("detailResult");
                        detailResult.dataset.maxpage = this.numberOfPlayers + "";
                        for (const child of Array.from(detailResult.children)) {
                            if (child.className.split(" ").includes("subPage")) {
                                const index = +child.dataset.index;
                                for (const grandChild of Array.from(child.children)) {
                                    if (grandChild.className.includes("selectPanel") && index <= this.numberOfPlayers) {
                                        for (const greatGrandChild of Array.from(grandChild.children)) {
                                            if (greatGrandChild.className.includes("text")) {
                                                if (+greatGrandChild.dataset.index == 1) {
                                                    greatGrandChild.innerHTML =
                                                        "" +
                                                        "Player " +
                                                        index +
                                                        "<br>" +
                                                        "プレイ時間:" +
                                                        this.gameManager.getCountUpTime(index - 1) +
                                                        "<br>" +
                                                        "Score:" +
                                                        this.gameManager.score[index - 1] +
                                                        "<br>" +
                                                        "最大Chain:" +
                                                        Math.max(this.gameManager.maxChain[index - 1] - 1, 0) +
                                                        "<br>" +
                                                        "一列揃えの回数:" +
                                                        this.gameManager.line[index - 1] +
                                                        "<br>" +
                                                        "役を揃えた回数:" +
                                                        this.gameManager.numberOfTrick[index - 1] +
                                                        "<br>" +
                                                        "減ったTimeの合計:" +
                                                        this.gameManager.penalty[index - 1] +
                                                        "<br>" +
                                                        "回復したTimeの合計:" +
                                                        this.gameManager.bonus[index - 1] +
                                                        "<br>";
                                                } else if (+greatGrandChild.dataset.index == 2) {
                                                    greatGrandChild.innerHTML =
                                                        "" +
                                                        "<br>" +
                                                        "モンドを設置した回数:" +
                                                        this.gameManager.mondOperators[index - 1].putCount +
                                                        "<br>" +
                                                        "一手戻しした回数:" +
                                                        this.gameManager.mondOperators[index - 1].unPutCount +
                                                        "<br>";
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    };
                    break;

                case 2:
                    this.gameManager.on.finish = () => {
                        this.musicManager.setBgm(0);
                        setTimeout(() => {
                            document.getElementById("resultLabel").innerText = "Time: " + this.gameManager.getCountUpTime(this.gameManager.winner[0]) + "";
                            this.setPage("result");
                            this.musicManager.setBgm(5);
                        }, 2000);

                        //detailResultの内容の設定
                        const detailResult = document.getElementById("detailResult");
                        detailResult.dataset.maxpage = this.numberOfPlayers + "";
                        for (const child of Array.from(detailResult.children)) {
                            if (child.className.split(" ").includes("subPage")) {
                                const index = +child.dataset.index;
                                for (const grandChild of Array.from(child.children)) {
                                    if (grandChild.className.includes("selectPanel") && index <= this.numberOfPlayers) {
                                        for (const greatGrandChild of Array.from(grandChild.children)) {
                                            if (greatGrandChild.className.includes("text")) {
                                                if (+greatGrandChild.dataset.index == 1) {
                                                    greatGrandChild.innerHTML =
                                                        "" +
                                                        "Player " +
                                                        index +
                                                        "<br>" +
                                                        "Time:" +
                                                        this.gameManager.getCountUpTime(index - 1) +
                                                        "<br>" +
                                                        "Score:" +
                                                        this.gameManager.score[index - 1] +
                                                        "<br>" +
                                                        "最大Chain:" +
                                                        Math.max(this.gameManager.maxChain[index - 1] - 1, 0) +
                                                        "<br>" +
                                                        "一列揃えの回数:" +
                                                        this.gameManager.line[index - 1] +
                                                        "<br>";
                                                } else if (+greatGrandChild.dataset.index == 2) {
                                                    greatGrandChild.innerHTML =
                                                        "" +
                                                        "<br>" +
                                                        "モンドを設置した回数:" +
                                                        this.gameManager.mondOperators[index - 1].putCount +
                                                        "<br>" +
                                                        "一手戻しした回数:" +
                                                        this.gameManager.mondOperators[index - 1].unPutCount +
                                                        "<br>";
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    };
                    break;
            }
        }
    }

    //すでにPlayBaseがある場合、それを削除してPlayにまつわる部分を初期化する
    removePlayBase() {
        if (this.playBase != null) {
            this.playBase.remove();
            this.numberOfPlayers = 0;
            this.playPanels = [];
            if (this.gameManager != null) {
                this.gameManager.initialize();
                this.gameManager = null;
            }
            if (this.inputManager != null) {
                this.inputManager.stopGamepadLoop();
                this.inputManager = null;
            }
        }
    }

    //各設定を読み込む
    setSettings(setting, trickSetting) {
        this.setting = setting;
        this.trickSetting = trickSetting;
    }

    //操作可能かどうかを設定する
    setCanOperate(canOperate) {
        document.getElementById("waitPanel").style.zIndex = "" + (canOperate ? -1 : 10000);
    }

    //sizeを調整する
    setSize() {
        for (const label of document.getElementsByClassName("label")) {
            label.style.fontSize = (this.pentamondBase.clientWidth / 40) * (label.dataset.size || 1) + "px";
            label.style.lineHeight = label.clientHeight + "px";
        }

        for (const label of document.getElementsByClassName("headingLabel")) {
            label.style.fontSize = (this.pentamondBase.clientWidth / 24) * (label.dataset.size || 1) + "px";
            label.style.lineHeight = label.clientHeight + "px";
        }

        for (const text of document.getElementsByClassName("text")) {
            text.style.fontSize = (this.pentamondBase.clientWidth / 50) * (text.dataset.size || 1) + "px";
        }

        for (const button of document.getElementsByClassName("button")) {
            button.style.fontSize = this.pentamondBase.clientWidth / 34 + "px";
        }

        for (const button of document.getElementsByClassName("littleButton")) {
            button.style.fontSize = this.pentamondBase.clientWidth / 40 + "px";
        }

        for (const button of document.getElementsByClassName("returnButton")) {
            button.style.fontSize = this.pentamondBase.clientWidth / 36 + "px";
        }

        for (const button of document.getElementsByClassName("prevSubPageButton")) {
            button.style.fontSize = this.pentamondBase.clientWidth / 36 + "px";
        }

        for (const button of document.getElementsByClassName("nextSubPageButton")) {
            button.style.fontSize = this.pentamondBase.clientWidth / 36 + "px";
        }

        for (const select of document.getElementsByClassName("selector")) {
            select.style.fontSize = (this.pentamondBase.clientWidth / 50) * (select.dataset.size || 1) + "px";
        }

        document.getElementById("titleButton").style.fontSize = this.pentamondBase.clientWidth / 28 + "px";
        document.getElementById("playStartButton").style.fontSize = this.pentamondBase.clientWidth / 28 + "px";

        for (const p of this.playPanels) {
            p.adjustPlayPanel();
        }

        for (const t of this.trickPanels) {
            t.adjustTrickPanel();
        }
    }

    //設定などを適用した上でPlayを開始する
    gameStart() {
        //ハンデ設定を読み込む
        for (const handicapSelector of document.getElementsByClassName("handicapSelector")) {
            const index = +handicapSelector.dataset.index;
            if (index <= this.numberOfPlayers) {
                this.gameManager.handicap[index - 1] = +handicapSelector.value;
            }
        }
        //コントローラー設定を読み込む
        for (const controlerSelector of document.getElementsByClassName("controlerSelector")) {
            const index = +controlerSelector.dataset.index;
            if (index <= this.numberOfPlayers) {
                this.inputManager.setGamepadMode(index - 1, +controlerSelector.value - 1);
            }
        }
        //時間設定を読み込む
        this.gameManager.maxCountDownTime = +document.getElementById("timeSelector").value;
        //modeを読み込む
        this.gameManager.setMode(this.mode);
        this.gameManager.solo = this.solo;

        for (const p of this.playPanels) {
            p.gameInfoPanel.setSize();
        }

        //開始時の演出をする
        this.setCanOperate(false);
        const startEffectPanel = document.getElementById("startEffectPanel");
        startEffectPanel.style.zIndex = "1000";
        const startEffectBackground = document.getElementById("startEffectBackground");
        startEffectBackground.style.zIndex = "990";
        let count = 0;
        const countString = ["", "3", "2", "1", "START!"];
        const countDown = () => {
            let startEffectLabel = document.createElement("div");
            startEffectLabel.id = "startEffectLabel";
            startEffectLabel.innerHTML = countString[count];
            startEffectLabel.classList.add("label");
            startEffectLabel.dataset.size = "5";
            if (count == countString.length - 1) {
                startEffectLabel.style.color = "#ff8800";
                this.musicManager.playSe(13);
            } else if (countString[count] != "") {
                this.musicManager.playSe(12);
            }
            startEffectPanel.appendChild(startEffectLabel);
            this.setSize();
            startEffectLabel.classList.add("startEffectAnimation");
            startEffectLabel.onanimationend = () => {
                count++;
                startEffectLabel.remove();
                if (count < countString.length) {
                    countDown();
                } else {
                    //ゲームを開始する
                    startEffectPanel.style.zIndex = "-1";
                    startEffectBackground.style.zIndex = "-1";
                    this.gameManager.start();
                    this.setCanOperate(true);
                }
            };
        };
        countDown();
    }

    //各種EventListenerを追加する
    addEventListeners() {
        window.addEventListener("resize", () => {
            this.setSize();
        });

        document.addEventListener("keydown", (e) => {
            if (this.inputManager == null) {
                return;
            }
            this.inputManager.keyDown(0, e);
        });

        document.addEventListener("keyup", (e) => {
            if (this.inputManager == null) {
                return;
            }
            this.inputManager.keyUp(0, e);
        });

        window.addEventListener("gamepadconnected", (e) => {
            if (this.inputManager == null) {
                return;
            }
            console.log("gamepad connected");
            this.inputManager.addGamepad(e);
        });

        window.addEventListener("gamepaddisconnected", (e) => {
            console.log("gamepad disconnected");
        });
    }

    //trickDisplayのpageの中身を設定する
    setTrickDisplay() {
        //trickDisplayのheadinglabel取得する
        let headingPanel = null;
        for (const child of Array.from(document.getElementById("trickDisplay").children)) {
            if (child.className.includes("headingPanel")) {
                headingPanel = child;
            }
        }
        //取得できなければreturn
        if (headingPanel == null) {
            return;
        }
        //trickの数を取得する
        const numberOfTricks = Object.keys(this.trickSetting).length;
        //maxpageを設定する
        document.getElementById("trickDisplay").dataset.maxpage = numberOfTricks + "";
        //各subPageの中身を設定する
        this.trickPanels = new Array(numberOfTricks);
        for (let i = numberOfTricks - 1; i >= 0; i--) {
            this.trickPanels[i] = new TrickPanel(this.setting, this.trickSetting);
            this.trickPanels[i].setIndex(i);
            const subPage = document.createElement("div");
            subPage.className = "subPage trickDisplaySubPage";
            subPage.dataset.index = i + 1 + "";
            const selectPanel = document.createElement("div");
            selectPanel.className = "selectPanel";
            selectPanel.style.flexDirection = "column";
            const text = document.createElement("div");
            text.className = "text";
            text.style.textAlign = "left";
            text.style.height = 50 + "%";
            text.dataset.size = "1.5";
            text.innerHTML =
                "" + "役の名前:" + this.trickPanels[i].getTrickName() + "<br>" + "時間回復量:" + this.trickPanels[i].getPoint() + "<br>" + "攻撃力:" + this.trickPanels[i].getAttack() + "<br>";

            selectPanel.appendChild(this.trickPanels[i].getBase());
            selectPanel.appendChild(text);
            subPage.appendChild(selectPanel);
            headingPanel.after(subPage);
        }
    }

    //Button要素などのOnClickを設定する
    setButtonsOnClick() {
        for (const returnButton of document.getElementsByClassName("returnButton")) {
            returnButton.onclick = () => {
                this.setPrevPage(2);
            };
        }

        //buttonのse
        for (const button of document.getElementsByClassName("button")) {
            if (button.classList.contains("returnButton")) {
                button.addEventListener("click", () => {
                    this.musicManager.playSe(11);
                });
            } else if (button.classList.contains("prevSubPageButton")) {
                button.addEventListener("click", () => {
                    this.musicManager.playSe(10);
                });
            } else if (button.classList.contains("nextSubPageButton")) {
                button.addEventListener("click", () => {
                    this.musicManager.playSe(10);
                });
            } else {
                button.addEventListener("click", () => {
                    if (!this.firstStart) {
                        this.musicManager.playSe(9);
                    }
                });
            }
        }

        for (const prevSubPageButton of document.getElementsByClassName("prevSubPageButton")) {
            prevSubPageButton.onclick = () => {
                this.setSubPage(-1);
            };
        }

        for (const nextSubPageButton of document.getElementsByClassName("nextSubPageButton")) {
            nextSubPageButton.onclick = () => {
                this.setSubPage(1);
            };
        }

        for (const musicSettingSelector of document.getElementsByClassName("musicSettingSelector")) {
            musicSettingSelector.onchange = () => {
                if (musicSettingSelector.dataset.index == "1") {
                    this.musicManager.changeBgmVolume(Number.parseFloat(musicSettingSelector.value));
                } else {
                    this.musicManager.seVolume = Number.parseFloat(musicSettingSelector.value);
                    this.musicManager.playSe(0);
                }
            };
        }

        for (const playBgmSelector of document.getElementsByClassName("playBgmSelector")) {
            playBgmSelector.onchange = () => {
                const musicIndex = Number.parseInt(playBgmSelector.value);
                this.musicManager.setBgm(musicIndex);
                this.playBgm[Number.parseInt(playBgmSelector.dataset.index) - 1] = musicIndex;
            };
        }

        for (const selector of document.getElementsByClassName("selector")) {
            selector.addEventListener("change", () => {
                this.musicManager.playSe(9);
            });
        }

        document.getElementById("titleButton").onclick = async () => {
            if (this.firstStart) {
                await this.musicManager.readMusics();
                this.firstStart = false;
                this.musicManager.playSe(9);
            }
            this.setPage("modeSelect");
            this.musicManager.setBgm(3);
        };

        document.getElementById("soloButton").onclick = () => {
            this.solo = true;
            this.setPage("soloModeSelect");
        };

        document.getElementById("survivalButton").onclick = () => {
            this.mode = 1;
            this.createPlayBase(1);
            this.setPage("preparePlay");
        };

        document.getElementById("lineCharangeButton").onclick = () => {
            this.mode = 2;
            this.createPlayBase(1);
            this.setPage("preparePlay");
        };

        document.getElementById("multiButton").onclick = () => {
            this.solo = false;
            this.setPage("multiModeSelect");
        };

        document.getElementById("versusButton").onclick = () => {
            this.mode = 1;
            this.setPage("numberOfPlayerSelect");
        };

        document.getElementById("versusLineCharangeButton").onclick = () => {
            this.mode = 2;
            this.setPage("numberOfPlayerSelect");
        };

        document.getElementById("2peopleButton").onclick = () => {
            if (navigator.getGamepads().filter((g) => g != null).length < 2 && !this.debug) {
                console.log("the number of Gamepad is " + navigator.getGamepads().filter((g) => g != null).length);
                this.setPage("controlerAlert");
                return;
            }
            if (this.debug) {
                console.log("debug:接続されているコントローラーの数が不足しています");
            }
            this.createPlayBase(2);
            this.setPage("preparePlay");
        };

        document.getElementById("3peopleButton").onclick = () => {
            if (navigator.getGamepads().filter((g) => g != null).length < 3 && !this.debug) {
                console.log("the number of Gamepad is " + navigator.getGamepads().filter((g) => g != null).length);
                this.setPage("controlerAlert");
                return;
            }
            if (this.debug) {
                console.log("debug:接続されているコントローラーの数が不足しています");
            }
            this.createPlayBase(3);
            this.setPage("preparePlay");
        };

        document.getElementById("4peopleButton").onclick = () => {
            if (navigator.getGamepads().filter((g) => g != null).length < 4 && !this.debug) {
                console.log("the number of Gamepad is " + navigator.getGamepads().filter((g) => g != null).length);
                this.setPage("controlerAlert");
                return;
            }
            if (this.debug) {
                console.log("debug:接続されているコントローラーの数が不足しています");
            }
            this.createPlayBase(4);
            this.setPage("preparePlay");
        };

        document.getElementById("playSettingButton").onclick = () => {
            this.setPage("playSetting");
        };

        document.getElementById("handicapButton").onclick = () => {
            this.setPage("handicapSetting");
        };

        document.getElementById("controlerButton").onclick = () => {
            this.setPage("controlerSetting");
        };

        document.getElementById("timeSettingButton").onclick = () => {
            this.setPage("timeSetting");
        };

        document.getElementById("ToTrickDisplayFromPreparePlayButton").onclick = () => {
            this.setPage("trickDisplay");
        };

        document.getElementById("modeDescriptionButton").onclick = () => {
            if (this.solo) {
                this.setPage("howToPlaySoloMode", this.mode + 1);
            } else {
                this.setPage("howToPlayMultiMode", this.mode + 1);
            }
            this.musicManager.setBgm(2);
        };

        document.getElementById("playStartButton").onclick = () => {
            this.setPage("playBase");
            this.gameStart();
            this.musicManager.setBgm(this.playBgm[this.solo ? 0 : 1]);
        };

        document.getElementById("reopeningButton").onclick = () => {
            this.gameManager.reopening();
            this.setPrevPage(2);
            this.musicManager.changeBgmVolumeTemporarily(1);
        };

        document.getElementById("restartButton").onclick = () => {
            this.gameManager.initialize();
            this.setPrevPage(2);
            this.gameStart();
            this.musicManager.setBgm(this.bgmMemory[this.bgmMemory.length - 1]);
        };

        document.getElementById("ToPreparePlayFromPauseButton").onclick = () => {
            this.gameManager.initialize();
            this.setPrevPage(3);
        };

        document.getElementById("ToTitleFromPauseButton").onclick = () => {
            this.setPrevPage(-1);
        };

        document.getElementById("retryButton").onclick = () => {
            this.gameManager.initialize();
            this.setPrevPage(2);
            this.gameStart();
            this.musicManager.setBgm(this.playBgm[this.solo ? 0 : 1]);
        };

        document.getElementById("ToPreparePlayFromResultButton").onclick = () => {
            this.gameManager.initialize();
            this.setPrevPage(3);
        };

        document.getElementById("ToMultiModeSelectButton").onclick = () => {
            this.removePlayBase();
            this.setPrevPage(5);
        };

        document.getElementById("detailResultButton").onclick = () => {
            this.setPage("detailResult");
        };

        document.getElementById("ToTitleFromResultButton").onclick = () => {
            this.setPrevPage(-1);
        };

        document.getElementById("settingButton").onclick = () => {
            this.mode = 0;
            document.getElementById("handicapButton").style.display = "block";
            document.getElementById("timeSettingButton").style.display = "block";
            this.setPage("setting");
        };

        document.getElementById("helpButton").onclick = () => {
            this.setPage("help");
            this.musicManager.setBgm(2);
        };

        document.getElementById("howToPlayButton").onclick = () => {
            this.setPage("howToPlay");
        };

        document.getElementById("howToPlayBasicButton").onclick = () => {
            this.setPage("howToPlayBasic");
        };

        document.getElementById("howToPlayAdvancedButton").onclick = () => {
            this.setPage("howToPlayAdvanced");
        };

        document.getElementById("howToPlaySoloModeButton").onclick = () => {
            this.setPage("howToPlaySoloMode");
        };

        document.getElementById("howToPlayMultiModeButton").onclick = () => {
            this.setPage("howToPlayMultiMode");
        };

        document.getElementById("ToTrickDisplayFromHelpButton").onclick = () => {
            this.setPage("trickDisplay");
        };

        document.getElementById("howToOperateButton").onclick = () => {
            this.setPage("howToOperate");
        };

        document.getElementById("functionDescriptionButton").onclick = () => {
            this.setPage("functionDescription");
        };

        document.getElementById("ToPlaySettingButton").onclick = () => {
            this.setPage("playSetting");
            for (const selectorPanel of document.getElementsByClassName("selectorPanel")) {
                selectorPanel.style.display = "flex";
            }
        };

        document.getElementById("musicSettingButton").onclick = () => {
            this.setPage("musicSetting");
        };

        document.getElementById("volumeSettingButton").onclick = () => {
            this.setPage("volumeSetting");
        };

        document.getElementById("playBgmSettingButton").onclick = () => {
            this.setPage("playBgmSetting");
        };
    }

    //指定した数だけページ遷移を戻す
    //setPageでもその画面に遷移できるが、returnButtonと両立させるためにはいくつかの画面遷移はこれで行う必要がある
    //-1を指定するとtitleに行く
    setPrevPage(number) {
        if (number == -1) {
            this.pageMemory = [];
            this.bgmMemory = [];
            this.removePlayBase();
            this.setPage("title");
            this.musicManager.setBgm(0);
        }
        if (this.pageMemory.length < number) {
            return;
        }
        this.setPage(this.pageMemory[this.pageMemory.length - number]);
        this.pageMemory = this.pageMemory.slice(0, -number);
        if (this.bgmMemory[this.bgmMemory.length - 1] != this.bgmMemory[this.bgmMemory.length - number - 1]) {
            this.musicManager.setBgm(this.bgmMemory[this.bgmMemory.length - number - 1]);
        }
        this.bgmMemory = this.bgmMemory.slice(0, -number);
    }

    addClassName(element, className) {
        if (element.className.includes(className)) {
            return;
        }
        element.className = element.className + " " + className;
    }

    removeClassName(element, className) {
        element.className = element.className
            .split(" ")
            .filter((name) => name != className)
            .join(" ");
    }
}
