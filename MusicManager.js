class MusicManager {
    fadingBgm = [];
    nowBgm = null;
    nowBgmIndex = null;
    bgm;
    se;
    bgmVolume = 1;
    seVolume = 1;
    bgmChangeDelay = 400;
    setCanOperate = (canOperate) => {};
    on = {
        setBgm: () => {},
        playSe: () => {},
    };

    MusicManager() {}

    async readMusics() {
        this.bgm = [
            [new IBGM("BGM/無音.m4a", { loop: true }), 1],
            [new IBGM("BGM/ならべてトライアングル.m4a", { loopStart: 3.692, loopEnd: 143.98 }), 0.5],
            [new IBGM("BGM/さよならさんかく.m4a", { loopEnd: 132.9 }), 0.57],
            [new IBGM("BGM/つみきのおしろ.m4a", { loopEnd: 133.348 }), 0.8],
            [new IBGM("BGM/Top of the Pyramid.m4a", { loopEnd: 108.896 }), 0.6],
            [new IBGM("BGM/おかたづけ.m4a", { loopEnd: 90 }), 0.8],
        ];
        await Promise.all(this.bgm.map((b) => b[0].fetch()));

        this.se = [
            [new IBGM("SoundEffects/モンド設置音.m4a"), 1],
            [new IBGM("SoundEffects/モンド右回転音.m4a"), 1],
            [new IBGM("SoundEffects/モンド左回転音.m4a"), 1],
            [new IBGM("SoundEffects/モンド移動音.m4a"), 1],
            [new IBGM("SoundEffects/モンド滑り移動音.m4a"), 1],
            //5
            [new IBGM("SoundEffects/一手戻し音.m4a"), 1],
            [new IBGM("SoundEffects/ホールド音.m4a"), 1],
            [new IBGM("SoundEffects/役有り列消去音.m4a"), 1],
            [new IBGM("SoundEffects/役無し列消去音.m4a"), 1],
            [new IBGM("SoundEffects/通常ボタン.m4a"), 0.6],
            //10
            [new IBGM("SoundEffects/サブページボタン.m4a"), 0.6],
            [new IBGM("SoundEffects/戻るボタン.m4a"), 0.6],
            [new IBGM("SoundEffects/ゲーム開始音1.m4a"), 0.2],
            [new IBGM("SoundEffects/ゲーム開始音2.m4a"), 0.2],
            [new IBGM("SoundEffects/ブロック破壊音.m4a"), 1],
            //15
            [new IBGM("SoundEffects/ダメージ音.m4a"), 1],
            [new IBGM("SoundEffects/攻撃音.m4a"), 0.7],
        ];
        await Promise.all(this.se.map((s) => s[0].fetch()));
    }

    async setBgm(index) {
        this.setCanOperate(false);
        if (this.nowBgm != null) {
            this.fadingBgm.push(this.nowBgm);
            await this.nowBgm.fade(0, this.bgmChangeDelay).then(async () => {
                await this.nowBgm.reset();
                this.fadingBgm = this.fadingBgm.filter((fbgm) => fbgm != this.nowBgm);
                this.nowBgm = null;
                this.nowBgmIndex = null;
            });
        }
        if (this.fadingBgm.includes(this.bgm[index])) {
            this.bgm[index][0].cancelFading();
            await this.bgm[index][0].reset();
            this.fadingBgm = this.fadingBgm.filter((fbgm) => fbgm != this.bgm[index][0]);
        }
        this.nowBgm = this.bgm[index][0];
        this.nowBgmIndex = index;
        this.nowBgm.setVolume(0);
        await this.nowBgm.play();
        await this.nowBgm.fade(this.bgm[index][1] * this.bgmVolume, 10);
        this.on.setBgm();
        this.setCanOperate(true);
        console.log("bgm was set " + index);
    }

    playSe(index) {
        this.se[index][0].audio.currentTime = 0;
        this.se[index][0].setVolume(this.se[index][1] * this.seVolume);
        this.se[index][0].play();
        this.on.playSe();
    }

    changeBgmVolume(bgmVolume) {
        this.bgmVolume = bgmVolume;
        if (this.nowBgm != null) {
            this.nowBgm.fade(this.bgm[this.nowBgmIndex][1] * this.bgmVolume, 10);
        }
        console.log("bgm volume was changed to " + this.bgm[this.nowBgmIndex][1] * this.bgmVolume);
    }

    changeBgmVolumeTemporarily(magnification) {
        if (this.nowBgm != null) {
            this.nowBgm.fade(this.bgm[this.nowBgmIndex][1] * this.bgmVolume * magnification, 10);
        }
        console.log("bgm volume was temporarily changed to " + this.bgm[this.nowBgmIndex][1] * this.bgmVolume * magnification);
    }
}
