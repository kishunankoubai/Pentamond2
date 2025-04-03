class MusicManager {
    //現在流れているbgm
    nowBgm = null;
    //現在流れているbgmのindex
    nowBgmIndex = null;
    //bgmの内容と設定
    //[bgmのindex][IBGM, 音量]
    bgm;
    //seの内容と設定
    //[seのindex][IBGM, 音量]
    se;
    //bgmのマスターvolume
    bgmVolume = 1;
    //seのマスターvolume
    seVolume = 1;
    //bgm変更時のfadeoutにかかる時間(ms)
    bgmChangeDelay = 400;
    //操作可能かどうかを設定できるfunction
    setCanOperate = (canOperate) => {};
    //onプロパティ
    on = {
        setBgm: () => {},
        playSe: () => {},
    };

    MusicManager() {}

    //音楽ファイルをすべて読み込む
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

    //bgmを変更する
    //bgmChangeDelayの分だけ時間がかかる
    async setBgm(index) {
        this.setCanOperate(false);
        //再生中ならfadeoutさせる
        if (this.nowBgm != null) {
            await this.nowBgm.fade(0, this.bgmChangeDelay).then(async () => {
                await this.nowBgm.reset();
                this.nowBgm = null;
                this.nowBgmIndex = null;
            });
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

    //seを再生する
    playSe(index) {
        this.se[index][0].audio.currentTime = 0;
        this.se[index][0].setVolume(this.se[index][1] * this.seVolume);
        this.se[index][0].play();
        this.on.playSe();
    }

    //bgmVolumeを変更する
    //この変更は保持される
    changeBgmVolume(bgmVolume) {
        this.bgmVolume = bgmVolume;
        if (this.nowBgm != null) {
            this.nowBgm.fade(this.bgm[this.nowBgmIndex][1] * this.bgmVolume, 10);
        }
        console.log("bgm volume was changed to " + this.bgm[this.nowBgmIndex][1] * this.bgmVolume);
    }

    //bgmVolumeを本来の音量から割合で一時的に変更する
    //この変更は保持されない
    changeBgmVolumeTemporarily(magnification) {
        if (this.nowBgm != null) {
            this.nowBgm.fade(this.bgm[this.nowBgmIndex][1] * this.bgmVolume * magnification, 10);
        }
        console.log("bgm volume was temporarily changed to " + this.bgm[this.nowBgmIndex][1] * this.bgmVolume * magnification);
    }
}
