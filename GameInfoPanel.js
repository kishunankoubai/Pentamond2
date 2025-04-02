class GameInfoPanel{

    gameInfoPanel;
    gameInfoPanelModel;
    countDownTimePanel;
    countDownTimeLabel;
    countUpTimePanel;
    countUpTimeLabel;
    trickInfoPanel
    trickInfoLabel;
    linePanel;
    lineLabel;
    scorePanel;
    scoreLabel;
    countDownTime;
    countUpTime;
    line;
    trick;
    score;

    constructor(){
        this.gameInfoPanel = document.createElement("div");
        this.gameInfoPanel.className = "gameInfoPanel";

        this.gameInfoPanelModel = document.getElementById("gameInfoPanelModel");
        for(const child of this.gameInfoPanelModel.children){
            if(child.className.includes("countDownTimePanel")){
                this.countDownTimePanel = child.cloneNode(true);
            }
            if(child.className.includes("countUpTimePanel")){
                this.countUpTimePanel = child.cloneNode(true);
            }
            if(child.className.includes("trickInfoPanel")){
                this.trickInfoPanel = child.cloneNode(true);
            }
            if(child.className.includes("linePanel")){
                this.linePanel = child.cloneNode(true);
            }
            if(child.className.includes("scorePanel")){
                this.scorePanel = child.cloneNode(true);
            }
        }

        for(const child of this.countDownTimePanel.children){
            if(child.className.includes("countDownTimeInnerPanel")){
                for(const grandChild of child.children){
                    if(grandChild.className.includes("gameInfoLabel")){
                        this.countDownTimeLabel = grandChild;
                        break;
                    }
                }
            }
        }

        for(const child of this.countUpTimePanel.children){
            if(child.className.includes("countUpTimeInnerPanel")){
                for(const grandChild of child.children){
                    if(grandChild.className.includes("gameInfoLabel")){
                        this.countUpTimeLabel = grandChild;
                        break;
                    }
                }
            }
        }

        for(const child of this.trickInfoPanel.children){
            if(child.className.includes("trickInfoInnerPanel")){
                for(const grandChild of child.children){
                    if(grandChild.className.includes("gameInfoLabel")){
                        this.trickInfoLabel = grandChild;
                        break;
                    }
                }
            }
        }

        for(const child of this.linePanel.children){
            if(child.className.includes("lineInnerPanel")){
                for(const grandChild of child.children){
                    if(grandChild.className.includes("gameInfoLabel")){
                        this.lineLabel = grandChild;
                        break;
                    }
                }
            }
        }

        for(const child of this.scorePanel.children){
            if(child.className.includes("scoreInnerPanel")){
                for(const grandChild of child.children){
                    if(grandChild.className.includes("gameInfoLabel")){
                        this.scoreLabel = grandChild;
                        break;
                    }
                }
            }
        }

        this.gameInfoPanel.appendChild(this.countDownTimePanel);
        this.gameInfoPanel.appendChild(this.countUpTimePanel);
        this.gameInfoPanel.appendChild(this.trickInfoPanel);
        this.gameInfoPanel.appendChild(this.linePanel);
        this.gameInfoPanel.appendChild(this.scorePanel);
    }

    initialize(){
        this.setVisible(false, false, false, false, false);
        this.setLabels("", "", "", "", "");
    }

    setSize(){
        for(const label of document.getElementsByClassName("gameInfoLabel")){
            label.style.fontSize = (this.gameInfoPanel.clientHeight / 20 * (label.dataset.size || 1)) + "px";
            label.style.lineHeight = label.clientHeight + "px";
        }
    }

    setVisible(countDownTimeVisible, countUpTimeVisible, lineVisible, trickVisible, scoreVisible){
        if(countDownTimeVisible){
            this.countDownTimePanel.style.display = "flex";
        }else{
            this.countDownTimePanel.style.display = "none";
        }
        if(countUpTimeVisible){
            this.countUpTimePanel.style.display = "flex";
        }else{
            this.countUpTimePanel.style.display = "none";
        }
        if(lineVisible){
            this.linePanel.style.display = "flex";
        }else{
            this.linePanel.style.display = "none";
        }
        if(trickVisible){
            this.trickInfoPanel.style.display = "flex";
        }else{
            this.trickInfoPanel.style.display = "none";
        }
        if(scoreVisible){
            this.scorePanel.style.display = "flex";
        }else{
            this.scorePanel.style.display = "none";
        }
    }

    setLabels(countDownTime, countUpTime, line, trick, score){
        if(this.countDownTime != countDownTime){
            this.countDownTimeLabel.innerHTML = "<b>" + countDownTime + "</b>";
            this.countDownTime = countDownTime;
        }
        if(this.countUpTime != countUpTime){
            this.countUpTimeLabel.innerHTML = "<b>" + countUpTime + "</b>";
            this.countUpTime = countUpTime;
        }
        if(this.line != line){
            this.lineLabel.innerHTML = "<b>" + line + "</b>";
            this.line = line;
        }
        if(this.trick != trick){
            this.trickInfoLabel.innerHTML = "<b>" + trick + "</b>";
            this.trick = trick;
        }
        if(this.score != score){
            this.scoreLabel.innerHTML = "<b>" + score + "</b>";
            this.score = score;
        }
    }

    getPanel(){
        return this.gameInfoPanel;
    }
}