class GamepadConfig {
    mode = 0;

    constructor() {}

    setMode(mode) {
        this.mode = mode;
    }

    getButtonKeyCode(index) {
        if (index >= 17 || index < 0) {
            return "";
        }

        if (this.mode == 1) {
            let value = ["KeyC", "KeyV", "Space", "KeyB", "Enter", "ArrowUp", "Enter", "ArrowUp", "KeyA", "KeyP", "", "", "", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyR"];

            return value[index];
        }

        if (this.mode == 2) {
            let value = ["KeyB", "ArrowUp", "Space", "Enter", "KeyC", "KeyV", "KeyC", "KeyV", "KeyA", "KeyP", "", "", "", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyR"];

            return value[index];
        }

        let value = ["KeyC", "KeyV", "KeyB", "Enter", "ArrowUp", "Space", "ArrowUp", "Space", "KeyA", "KeyP", "", "", "", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyR"];

        return value[index];
    }

    getAxisKeyCode(index, dir) {
        if (index >= 2 || index < 0) {
            return "";
        }

        let value = [
            ["ArrowLeft", "ArrowRight"],
            ["", "ArrowDown"],
        ];

        return value[index][dir ? 1 : 0];
    }
}
