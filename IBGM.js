const IBGM = class {
    path;
    audio;
    source;
    context;
    gain;
    #volume;
    loopStart;
    loopEnd;
    loop;
    checkInterval;

    constructor(path, { loop, loopStart, loopEnd } = { loop: false }) {
        this.path = path;
        this.#volume = 1;
        this.loop = loop;
        this.loopStart = loopStart;
        this.loopEnd = loopEnd;
        if (this.loopStart != null || this.loopEnd != null) {
            this.loop = true;
        }
        if (this.loop) {
            this.loopStart = this.loopStart ?? 0;
            this.loopEnd = this.loopEnd ?? -1;
        }
        this.checkInterval = new InterruptibleInterval(() => {
            if (this.audio) {
                if (this.audio.currentTime >= this.loopEnd && loopEnd != -1) {
                    this.audio.currentTime = this.loopStart;
                }
            }
        });
        this.checkInterval.setDelay(20);
    }

    fetch() {
        this.reset();

        this.audio = new Audio(this.path);
        this.audio.loop = this.loop;

        this.source = this.context.createMediaElementSource(this.audio);
        this.source.connect(this.gain);

        return new Promise((resolve) => {
            this.audio.oncanplay = () => {
                resolve();
            };
        });
    }

    reset() {
        if (!this.context) {
            this.context = new AudioContext();
            this.gain = this.context.createGain();
            this.gain.connect(this.context.destination);
        }

        if (this.audio) {
            this.audio.pause();
            this.checkInterval.pause();
            this.checkInterval.reset();
            this.audio.currentTime = 0;
            this.setVolume(this.#volume);
        }
    }

    play() {
        if (!this.audio) return;
        if (this.loop && this.loopEnd != -1) {
            this.checkInterval.start();
        }
        return this.audio.play();
    }

    pause() {
        if (!this.audio) return;
        if (this.loop) {
            this.checkInterval.pause();
        }
        return this.audio.pause();
    }

    fade(value, ms) {
        if (!this.gain) return;

        this.gain.gain.cancelScheduledValues(0);
        this.gain.gain.exponentialRampToValueAtTime(value || 0.001, this.context.currentTime + ms / 1000);

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this);
                if (value == 0) {
                    this.gain.gain.value = 0;
                }
            }, ms);
        });
    }

    async fadeout(ms) {
        await this.fade(0, ms);
        this.pause();
    }

    setVolume(value) {
        if (!this.gain) return;
        this.gain.gain.cancelScheduledValues(0);
        this.gain.gain.value = value;
        this.#volume = value;
    }

    cancelFading() {
        this.gain.gain.cancelScheduledValues(0);
    }
};
