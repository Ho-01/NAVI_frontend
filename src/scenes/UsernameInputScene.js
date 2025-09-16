// UsernameInputScene.js
import Phaser from "phaser";
import TouchEffect from "../ui/TouchEffect";
import UserService  from "../features/user/service";
import UserStorage from "../core/userStorage";

export default class UsernameInputScene extends Phaser.Scene {
  constructor() {
    super({ key: "UsernameInputScene" });
  }

  create() {
    const { width: W, height: H } = this.scale;

    // --- 배경(검정 오버레이) ---
    const overlay = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.6)
      .setInteractive(); // 뒤쪽 입력 차단

    TouchEffect.init(this); // 터치 이펙트

    // --- 카드 컨테이너 ---
    const cardW = W * 0.8;
    const cardH = cardW*0.7;
    const radius = 16;

    // 카드 배경 텍스처 생성 (흰색 + 연한 테두리)
    const cardKey = `card_${cardW}x${cardH}_r${radius}`;
    if (!this.textures.exists(cardKey)) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xfffaee, 1);
      g.fillRoundedRect(0, 0, cardW, cardH, radius);
      g.lineStyle(2, 0xE5E7EB, 1);
      g.strokeRoundedRect(1, 1, cardW - 2, cardH - 2, radius - 1);
      g.generateTexture(cardKey, cardW, cardH);
      g.destroy();
    }

    const card = this.add.container(W/2, H/2);
    const cardBg = this.add.image(0, 0, cardKey).setOrigin(0.5);
    if (cardBg.preFX) cardBg.preFX.addShadow(6, 8, 0x000000, 0.25, 10, 1);
    card.add(cardBg);

    // 타이틀 텍스트
    const title = this.add.text(0, -cardH*0.5+cardH*0.1, "당신의 이름은?", {
        fontFamily: "Pretendard",
        fontSize: Math.round(W*0.06),
        color: "#111",
        fontStyle: "bold"
    }).setOrigin(0.5, 0);
    card.add(title);

    // --- DOM 입력 필드 (모바일 키보드용) ---
    // 게임 설정에 dom: { createContainer: true } 가 켜져 있어야 함!
    const inputStyle = `
      width:${Math.min(cardW *0.7)}px; height:${Math.min(cardH *0.5)};
      padding: 8px 12px; font-size:${Math.round(W*0.05)}px;
      border:1px solid #e5e7eb; border-radius:10px; outline:none;
      box-sizing:border-box; background:#fff;
    `;
    const nameInput = this.add.dom(0, 0, "input", inputStyle, "");
    nameInput.setOrigin(0.5);
    // placeholder & 모바일 힌트
    nameInput.node.setAttribute("placeholder", "이름을 입력");
    nameInput.node.setAttribute("maxlength", "20");
    nameInput.node.setAttribute("inputmode", "text");
    nameInput.node.setAttribute("enterkeyhint", "done");
    // 포커스 유도(모바일은 사용자 제스처 후 포커스되는게 안전)
    nameInput.addListener("pointerdown").on("pointerdown", () => nameInput.node.focus());
    card.add(nameInput);

    // --- 결정 버튼 ---
    const btnW = cardW*0.3, btnH = btnW*0.35, br = 10;
    const btn = this.add.container(0, cardH*0.35);

    const btnKey = `btn_${btnW}x${btnH}_r${br}`;
    if (!this.textures.exists(btnKey)) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xd1ac72, 1); // 딥그레이
      g.fillRoundedRect(0, 0, btnW, btnH, br);
      g.generateTexture(btnKey, btnW, btnH);
      g.destroy();
    }
    const btnBg = this.add.image(0, 0, btnKey).setOrigin(0.5);
    const btnText = this.add.text(0, 0, "확인", {
      fontFamily: "Pretendard", fontSize: Math.round(W*0.04), color: "#000000ff"
    }).setOrigin(0.5);

    btn.add([btnBg, btnText]);
    btn.setSize(btnW, btnH).setInteractive({ useHandCursor: true });
    btn.on("pointerover", () => btnBg.setAlpha(0.9));
    btn.on("pointerout",  () => btnBg.setAlpha(1));
    btn.on("pointerdown", () => submit());
    card.add(btn);

    // 엔터 키로 제출
    nameInput.node.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit();
    });

    // --- 제출 로직 ---
    const loadingTxt = this.add.text(0, cardH*0.2, "", {
      fontFamily: "Pretendard", fontSize: Math.round(W*0.04), color: "#6b7280"
    }).setOrigin(0.5);
    card.add(loadingTxt);

    const showMsg = (msg, ok=false) => {
      loadingTxt.setText(msg).setColor(ok ? "#16a34a" : "#ef4444");
    };

    const setUIEnabled = (enabled) => {
      btn.disableInteractive();
      nameInput.node.disabled = true;
      if (enabled) {
        btn.setInteractive({ useHandCursor: true });
        nameInput.node.disabled = false;
      }
    };

    const submit = async () => {
      const raw = nameInput.node.value || "";
      const value = raw.trim();

      if (!value) { showMsg("이름을 입력해주세요."); return; }
      if (value.length < 2) { showMsg("이름은 2자 이상으로 입력해주세요."); return; }

      setUIEnabled(false);
      showMsg("저장 중...", true);

      try {
        const res = await UserService.updateMyName(value);
        console.log("[UsernameInputScene] 이름 저장 : "+res);
        UserStorage.setName(res);
        showMsg("저장 완료! : "+res, true);
        this.scene.start("CutScene", { json: this.cache.json.get("cutscene_오프닝1")});
      } catch (err) {
        console.error(err);
        showMsg(err.message || "저장 실패. 다시 시도해주세요.");
      } finally {
        setUIEnabled(true);
      }
    };

    // 최초 포커스(데스크톱에서만 살짝 지연 포커스)
    this.time.delayedCall(200, () => nameInput.node.focus());
  }
}
