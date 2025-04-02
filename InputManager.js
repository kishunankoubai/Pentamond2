class InputManager {
    gm;
    pm;
    repeatTime = 35;
    delayTime = 165;
    sensitivity = 0.5;

    repeatFunction;
    timeoutId;
    intervalId;
    repeatKey;

    gamepads = [];
    standardGamepads = [];
    numberOfButtons = [];
    numberOfAxes = [];
    buttons = [];
    axes = [];

    gamepadMode = [];
    gc;
    animationFrameId;
    gamepadLoopStarted = false;

    inputLog = false;

    constructor(gm) {
        this.gm = gm;
        this.repeatFunction = new Array(this.gm.mondOperators.length);
        this.timeoutId = new Array(this.gm.mondOperators.length);
        this.intervalId = new Array(this.gm.mondOperators.length);
        this.repeatKey = new Array(this.gm.mondOperators.length);
        this.gc = new GamepadConfig();
    }

    keyDown(index, e) {
        if ((!e.repeat && this.repeatKey[index] != e.code) || (this.repeatKey[index] == undefined && (e.code == "ArrowLeft" || e.code == "ArrowRight" || e.code == "ArrowDown"))) {
            this.startInput(index, e.code);
        }
    }

    keyUp(index, e) {
        if (e.code == this.repeatKey[index]) {
            this.endInput(index, e.code);
        }
    }

    startInput(index, kind) {
        switch (kind) {
            case "ArrowRight":
                clearInterval(this.intervalId[index]);
                clearTimeout(this.timeoutId[index]);
                this.gm.mondOperators[index].moveRight();
                this.repeatKey[index] = kind;
                this.repeatFunction[index] = function () {
                    this.gm.mondOperators[index].moveRight();
                }.bind(this);
                this.timeoutId[index] = setTimeout(
                    function () {
                        this.intervalId[index] = setInterval(this.repeatFunction[index], this.repeatTime);
                    }.bind(this),
                    this.delayTime
                );
                break;

            case "ArrowLeft":
                clearInterval(this.intervalId[index]);
                clearTimeout(this.timeoutId[index]);
                this.gm.mondOperators[index].moveLeft();
                this.repeatKey[index] = kind;
                this.repeatFunction[index] = function () {
                    this.gm.mondOperators[index].moveLeft();
                }.bind(this);
                this.timeoutId[index] = setTimeout(
                    function () {
                        this.intervalId[index] = setInterval(this.repeatFunction[index], this.repeatTime);
                    }.bind(this),
                    this.delayTime
                );
                break;

            case "ArrowUp":
                this.gm.mondOperators[index].put();
                break;

            case "ArrowDown":
                clearInterval(this.intervalId[index]);
                clearTimeout(this.timeoutId[index]);
                this.gm.mondOperators[index].fall();
                this.repeatKey[index] = kind;
                this.repeatFunction[index] = function () {
                    this.gm.mondOperators[index].fall();
                }.bind(this);
                this.timeoutId[index] = setTimeout(
                    function () {
                        this.intervalId[index] = setInterval(this.repeatFunction[index], this.repeatTime);
                    }.bind(this),
                    this.delayTime
                );
                break;

            case "KeyV":
                this.gm.mondOperators[index].spinRight();
                break;

            case "KeyC":
                this.gm.mondOperators[index].spinLeft();
                break;

            case "KeyB":
                this.gm.mondOperators[index].unPut();
                break;

            case "KeyS":
                clearInterval(this.intervalId[index]);
                clearTimeout(this.timeoutId[index]);
                this.repeatFunction[index] = undefined;
                this.repeatKey[index] = undefined;
                break;

            case "KeyR":
                break;

            case "KeyP":
                clearInterval(this.intervalId[index]);
                clearTimeout(this.timeoutId[index]);
                this.repeatFunction[index] = undefined;
                this.repeatKey[index] = undefined;
                if (this.gm.playing) {
                    if (this.gm.pausing) {
                        this.gm.reopening();
                        this.pm.setPrevPage(2);
                        this.pm.setSize();
                        this.pm.musicManager.playSe(9);
                        this.pm.musicManager.changeBgmVolumeTemporarily(1);
                    } else {
                        this.gm.pause();
                        this.pm.setPage("pause");
                        this.pm.musicManager.playSe(9);
                        this.pm.musicManager.changeBgmVolumeTemporarily(0.3);
                    }
                }

                break;

            case "KeyA":
                clearInterval(this.intervalId[index]);
                clearTimeout(this.timeoutId[index]);
                this.repeatFunction[index] = undefined;
                this.repeatKey[index] = undefined;
                break;

            case "Space":
                this.gm.mondOperators[index].hold();
                break;

            case "Enter":
                clearInterval(this.intervalId[index]);
                clearTimeout(this.timeoutId[index]);
                this.repeatFunction[index] = undefined;
                this.repeatKey[index] = undefined;
                this.gm.mondOperators[index].removeLine();
                break;
        }
    }

    endInput(index, kind) {
        switch (kind) {
            case "ArrowRight":
                clearInterval(this.intervalId[index]);
                clearTimeout(this.timeoutId[index]);
                this.repeatFunction[index] = undefined;
                this.repeatKey[index] = undefined;
                break;

            case "ArrowLeft":
                clearInterval(this.intervalId[index]);
                clearTimeout(this.timeoutId[index]);
                this.repeatFunction[index] = undefined;
                this.repeatKey[index] = undefined;
                break;

            case "ArrowUp":
                break;

            case "ArrowDown":
                clearInterval(this.intervalId[index]);
                clearTimeout(this.timeoutId[index]);
                this.repeatFunction[index] = undefined;
                this.repeatKey[index] = undefined;
                break;

            case "KeyV":
                break;

            case "KeyC":
                break;

            case "KeyB":
                break;

            case "KeyS":
                break;

            case "KeyR":
                break;

            case "KeyP":
                break;

            case "KeyA":

            case "Space":
                break;

            case "Enter":
                break;
        }
    }

    addGamepad(e) {
        this.gamepads[e.gamepad.index] = e.gamepad;
        this.standardGamepads[e.gamepad.index] = new StandardGamepad(e.gamepad);
        this.gamepadMode[e.gamepad.index] = this.gamepadMode[e.gamepad.index] || 1;
        this.numberOfButtons[e.gamepad.index] = e.gamepad.buttons.length;
        this.numberOfAxes[e.gamepad.index] = e.gamepad.axes.length;
        this.buttons[e.gamepad.index] = [...Array(this.numberOfButtons[e.gamepad.index])].map(() => false);
        this.axes[e.gamepad.index] = [...Array(this.numberOfAxes[e.gamepad.index])].map(() => false);
        if (!this.gamepadLoopStarted) {
            this.gamepadLoopStarted = true;
            this.gamepadLoop();
        }
    }

    gamepadLoop() {
        //nullじゃないgamepadの配列
        const validGamepads = navigator.getGamepads().filter((g) => g != null);

        //pnはplayerNumberを表す
        for (let pn = 0; pn < validGamepads.length && pn < this.gm.mondOperators.length; pn++) {
            //gamepadのindexを取得
            const index = validGamepads[pn].index;
            //接続が切れた場合処理を飛ばす
            if (this.gamepads[index] == null) {
                continue;
            }
            this.gamepads[index] = validGamepads[pn];
            this.standardGamepads[index].reloadGamepad(this.gamepads[index]);
            this.gc.setMode(this.gamepadMode[index]);
            if (!validGamepads[pn]) {
                return;
            }

            for (let i = 0; i < this.numberOfButtons[index]; i++) {
                //直前の入力と現在の入力が異なっているとき
                if (this.buttons[index][i] != this.standardGamepads[index].getButtonPressed(i)) {
                    //新たに入力されたとき
                    if (this.standardGamepads[index].getButtonPressed(i)) {
                        //ここはkeydownとほぼ同様の挙動をする
                        if (this.inputLog) {
                            console.log("player" + (pn + 1) + ":button" + i);
                        }
                        this.startInput(pn, this.gc.getButtonKeyCode(i));
                        //入力がなくなったとき
                    } else {
                        //ここはkeyupと同様の挙動をする
                        this.endInput(pn, this.gc.getButtonKeyCode(i));
                    }
                    //直前の入力と現在の入力が一致するとき
                } else {
                    if (
                        this.standardGamepads[index].getButtonPressed(i) &&
                        this.repeatKey[pn] == undefined &&
                        (this.gc.getButtonKeyCode(i) == "ArrowLeft" || this.gc.getButtonKeyCode(i) == "ArrowRight" || this.gc.getButtonKeyCode(i) == "ArrowDown")
                    ) {
                        if (this.inputLog) {
                            console.log("player" + (pn + 1) + ":button" + i);
                        }
                        this.startInput(pn, this.gc.getButtonKeyCode(i));
                    }
                }
            }
            for (let i = 0; i < this.numberOfAxes[index]; i++) {
                if (
                    (Math.abs(this.axes[index][i]) < this.sensitivity && Math.abs(this.standardGamepads[index].getAxisValue(i)) >= this.sensitivity) ||
                    (this.axes[index][i] * this.standardGamepads[index].getAxisValue(i) < 0 && Math.abs(this.standardGamepads[index].getAxisValue(i)) >= this.sensitivity)
                ) {
                    //ここはkeydownとほぼ同様の挙動をする
                    if (this.inputLog) {
                        console.log("player" + (pn + 1) + ":axis" + i + (this.standardGamepads[index].getAxis(i) > 0 ? "+" : "-"));
                    }
                    if (this.standardGamepads[index].getAxisValue(i) > 0) {
                        if (this.repeatKey[pn] != "ArrowLeft" && this.repeatKey[pn] != "ArrowRight") {
                            this.startInput(pn, this.gc.getAxisKeyCode(i, true));
                        }
                    } else {
                        this.startInput(pn, this.gc.getAxisKeyCode(i, false));
                    }
                } else if (Math.abs(this.standardGamepads[index].getAxisValue(i)) >= this.sensitivity) {
                    if (this.repeatKey[pn] == undefined) {
                        if (
                            this.gc.getAxisKeyCode(i, true) == "ArrowLeft" ||
                            this.gc.getAxisKeyCode(i, true) == "ArrowRight" ||
                            this.gc.getAxisKeyCode(i, true) == "ArrowDown" ||
                            this.gc.getAxisKeyCode(i, false) == "ArrowLeft" ||
                            this.gc.getAxisKeyCode(i, false) == "ArrowRight" ||
                            this.gc.getAxisKeyCode(i, false) == "ArrowDown"
                        ) {
                            if (this.inputLog) {
                                console.log("player" + (pn + 1) + ":axis" + i + (this.standardGamepads[index].getAxisValue(i) > 0 ? "+" : "-"));
                            }
                            if (this.standardGamepads[index].getAxisValue(i) > 0) {
                                this.startInput(pn, this.gc.getAxisKeyCode(i, true));
                            } else {
                                this.startInput(pn, this.gc.getAxisKeyCode(i, false));
                            }
                        }
                    }
                }
                if (Math.abs(this.axes[index][i]) >= this.sensitivity && Math.abs(this.standardGamepads[index].getAxisValue(i)) < this.sensitivity) {
                    //ここはkeyupとほぼ同様の挙動をする
                    //console.log("axis" + i + " : off");
                    this.endInput(pn, this.gc.getAxisKeyCode(i, true));
                    this.endInput(pn, this.gc.getAxisKeyCode(i, false));
                }
            }
            this.buttons[index] = [...Array(this.numberOfButtons[index])].map((i, j) => j).map((e) => this.standardGamepads[index].getButtonPressed(e));
            this.axes[index] = [...Array(this.numberOfAxes[index])].map((i, j) => j).map((e) => this.standardGamepads[index].getAxisValue(e));
        }
        this.animationFrameId = requestAnimationFrame(this.gamepadLoop.bind(this));
    }

    addAllGamepad() {
        for (const g of navigator.getGamepads().filter((g) => g != null)) {
            this.gamepads[g.index] = g;
            this.standardGamepads[g.index] = new StandardGamepad(g);
            this.gamepadMode[g.index] = this.gamepadMode[g.index] || 0;
            this.numberOfButtons[g.index] = g.buttons.length;
            this.numberOfAxes[g.index] = g.axes.length;
            this.buttons[g.index] = [...Array(this.numberOfButtons[g.index])].map(() => false);
            this.axes[g.index] = [...Array(this.numberOfAxes[g.index])].map(() => false);
        }
    }

    stopGamepadLoop() {
        if (this.gamepadLoopStarted) {
            cancelAnimationFrame(this.animationFrameId);
            this.gamepadLoopStarted = false;
        }
        for (let i = 0; i < this.gm.mondOperators.length; i++) {
            clearInterval(this.intervalId[i]);
            clearTimeout(this.timeoutId[i]);
        }
    }

    startGamepadLoop() {
        if (!this.gamepadLoopStarted) {
            this.gamepadLoopStarted = true;
            this.gamepadLoop();
        }
    }

    setPageManager(pm) {
        this.pm = pm;
    }

    setGamepadMode(pn, mode) {
        //console.log("Player" + (pn + 1) + "'s gamepad mode was set to " + mode);
        const validGamepads = navigator.getGamepads().filter((g) => g != null);
        if (validGamepads.length <= pn || pn < 0) {
            return;
        }
        this.gamepadMode[validGamepads[pn].index] = mode;
    }
}
