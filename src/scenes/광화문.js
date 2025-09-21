import Phaser from "phaser";

export default class 광화문 extends Phaser.Scene {
    constructor() {
        super({ key: "광화문" });
    }

    preload(){
        this.load.image("bg_광화문", "assets/bg/bg_광화문.png");
    }
    create() {
        console.log("광화문 맵");
        const { width, height } = this.scale;

        const stage = this.add.container(width/2, height/2).setDepth(-1);

        const bg = this.add.image(0, 0, "bg_광화문").setOrigin(0.5);
        stage.add(bg);

        const 해태테두리 = this.add.image(0, 0, "해태테두리").setOrigin(0.5).setDepth(1);
        const HAE = { cx: 0.250, cy: 0.613, wRatio: 490 / 1024, hRatio: 720 / 1820 };
        해태테두리.x = (HAE.cx - 0.5) * bg.width;
        해태테두리.y = (HAE.cy - 0.5) * bg.height;
        해태테두리.displayWidth  = HAE.wRatio * bg.width;
        해태테두리.displayHeight = HAE.hRatio * bg.height;
        this.tweens.add({ targets: 해태테두리, alpha: { from: 1, to: 0.4 }, duration: 400, yoyo: true, repeat: -1, hold: 50, repeatDelay: 50, ease: "Quad.easeInOut" });
        stage.add(해태테두리);

        const hit = this.add.image(0, 0, "해태_hit").setOrigin(0.5).setDepth(1).setAlpha(0.001);
        hit.x = (HAE.cx - 0.5) * bg.width;
        hit.y = (HAE.cy - 0.5) * bg.height;
        hit.displayWidth  = HAE.wRatio * bg.width;
        hit.displayHeight = HAE.hRatio * bg.height;
        stage.add(hit);

        const interaction = this.add.image(hit.x, hit.y, "interaction").setOrigin(0.5).setAlpha(0).setDepth(3);
        stage.add(interaction);

        hit.setInteractive({ useHandCursor: true })
        .once("pointerdown", () => {
            this.tweens.add({ targets: interaction, y: "-=32", alpha: { from: 0, to: 1 }, scale: { from: 0.35, to: 0.5 },
                duration: 200, yoyo: true, hold: 120, ease: "Quad.easeOut",
                onComplete: () => { interaction.destroy(); this.scene.start("DialogScene", { json: this.cache.json.get("dialog_광화문_1") }); }
            });
        });
        
        const s = Math.max(width / bg.width, height / bg.height);
        stage.setScale(s);


        // 맵 타이틀
        const mapTitle = this.add.image(width * 0.3, height * 0.07, "맵_타이틀").setOrigin(0.5).setScale(0.7).setAlpha(0);
        this.tweens.add({ targets: mapTitle, alpha: 1.0, duration: 800, ease: "Quad.easeOut" });
        const mapTitleText = this.add.text(width * 0.3, height * 0.065, "광화문", { fontSize: width * 0.05, color: "#333" }).setOrigin(0.5).setAlpha(0);
        this.tweens.add({ targets: mapTitleText, alpha: 1.0, duration: 800, ease: "Quad.easeOut" });

    //     "nextScene": "DialogScene",
    // "nextParam": "dialog_광화문_1",

        this.cameras.main.fadeIn(50, 0, 0, 0);
    }
}