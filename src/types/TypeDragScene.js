// 드래그 배치 공용 씬
import theme from "../styles/theme.js";
import { addDim, makeFrame, makeButton, makeHintModal, buildCommonShell } from "../ui/components.js";
import runResultFlow from "../flows/resultFlow.js";

export default class TypeDragScene extends Phaser.Scene {
  constructor(key){ super(key); }
  init(data){ this.cfg = data; }

  preload(){
    // 공통 UI
    this.load.image("frame_plain_9","assets/ui/frame_plain_9.png");
    this.load.image("modal_plain_9","assets/ui/modal_plain_9.png");
    this.load.image("scroll_plain_9","assets/ui/scroll_plain_9.png");
    this.load.image("btn_primary_9","assets/ui/btn_primary_9.png");
    this.load.image("btn_secondary_9","assets/ui/btn_secondary_9.png");
    this.load.image("stamp_correct_temp","assets/fx/stamp_correct_temp.png");
    this.load.image("stamp_wrong_temp","assets/fx/stamp_wrong_temp.png");

    // 배경
    if (this.cfg.bgKey && this.cfg.bgPath) this.load.image(this.cfg.bgKey, this.cfg.bgPath);

    // 조각/슬롯 이미지
    (this.cfg.pieces||[]).forEach(p=>{
      if (p.imgKey && p.imgPath) this.load.image(p.imgKey, p.imgPath);
    });
    (this.cfg.slots||[]).forEach(s=>{
      if (s.imgKey && s.imgPath) this.load.image(s.imgKey, s.imgPath);
    });

    // “그거 아시나요”
    if (this.cfg.infoTextCorrectPath){
      const key = this.cfg.infoTextCorrectKey || (this.scene.key + "_info_correct");
      this.load.text(key, this.cfg.infoTextCorrectPath);
    }
    if (this.cfg.infoTextWrongPath){
      const key = this.cfg.infoTextWrongKey || (this.scene.key + "_info_wrong");
      this.load.text(key, this.cfg.infoTextWrongPath);
    }
  }

  create(){
    const C=this.cfg;
    const W=this.scale.width, H=this.scale.height;
    theme.spacing.safeTop = this.game.device.os.iOS ? 44 : 24;
    theme.spacing.safeBottom = 24;

    // 공통 셸
    const shell = buildCommonShell(this, {
      num2: C.num2, place: C.place,
      bgKey: C.bgKey, bgAlpha: (C.bgAlpha ?? 0.30),
      questionText: C.question,
      halfStartRatio: (C.halfStartRatio ?? 0.5),
      sizes: { labelH: 88 }
    }, {
      onHelp: ()=> openHelp(),
      onDecide: ()=> submit()
    });

    // 패널 내부 배치 시작 Y
    const panelTop = shell.contentBox.y - shell.contentBox.height/2;
    let cursorY = panelTop + 48;

    // (옵션) 예시/문제용 이미지
    if (C.problemImgKey){
      const img = this.add.image(W/2, cursorY, C.problemImgKey).setOrigin(0.5,0);
      cursorY += (img.displayHeight || img.height || 160) + 24;
    }

    // 슬롯 그리기
    // 슬롯 = { id, x, y, r, imgKey? }
    const slotMap = new Map(); // id -> {x,y,r, sprite, occupiedBy:null|pieceId}
    (C.slots||[]).forEach(s=>{
      const sx = s.x ?? W/2, sy = s.y ?? (cursorY + 200);
      let node;
      if (s.imgKey) {
        node = this.add.image(sx, sy, s.imgKey).setOrigin(0.5);
        if (s.displayW && s.displayH) node.setDisplaySize(s.displayW, s.displayH);
      } else {
        node = this.add.circle(sx, sy, s.r||48, 0x000000, 0.06)
                 .setStrokeStyle(2, 0x2b2b2b, 1);
      }
      slotMap.set(s.id, { ...s, x:sx, y:sy, r:s.r||48, node, occupiedBy:null });
    });

    // 조각 그리기 + 드래그 세팅
    // 조각 = { id, imgKey, start:{x,y}, displayW?, displayH? }
    const pieceMap = new Map(); // id -> {sprite, home:{x,y}, onSlotId:null|string }
    (C.pieces||[]).forEach(p=>{
      const px = p.start?.x ?? (W/2 - 240), py = p.start?.y ?? (cursorY + 420);
      const spr = this.add.image(px, py, p.imgKey).setOrigin(0.5).setInteractive({ draggable: true, useHandCursor: true });
      if (p.displayW && p.displayH) spr.setDisplaySize(p.displayW, p.displayH);
      this.input.setDraggable(spr);

      spr.setData("pieceId", p.id);
      pieceMap.set(p.id, { sprite:spr, home:{x:px,y:py}, onSlotId:null });

      spr.on("dragstart", ()=>{
        this.children.bringToTop(spr);
        spr.setAlpha(0.9);
      });
      spr.on("drag", (_p, dragX, dragY)=>{
        spr.x = dragX; spr.y = dragY;
      });
      spr.on("dragend", ()=>{
        spr.setAlpha(1);
        // 가장 가까운 슬롯 찾기
        const nearest = nearestSlot(spr.x, spr.y);
        const snapPx = C.snapPx ?? 32;

        // 기존 점유 해제
        const pid = spr.getData("pieceId");
        const prev = pieceMap.get(pid).onSlotId;
        if (prev && slotMap.get(prev)) slotMap.get(prev).occupiedBy = null;
        pieceMap.get(pid).onSlotId = null;

        if (nearest && Phaser.Math.Distance.Between(spr.x, spr.y, nearest.x, nearest.y) <= snapPx && !nearest.occupiedBy){
          // 스냅
          this.tweens.add({ targets: spr, x: nearest.x, y: nearest.y, duration: 100, ease: "Cubic.easeOut",
            onComplete: ()=>{
              nearest.occupiedBy = pid;
              pieceMap.get(pid).onSlotId = nearest.id;
            }
          });
        } else {
          // 원위치
          this.tweens.add({ targets: spr, x: pieceMap.get(pid).home.x, y: pieceMap.get(pid).home.y, duration: 140, ease: "Cubic.easeOut" });
        }
      });
    });

    function nearestSlot(x,y){
      let best=null, bestD=1e9;
      slotMap.forEach((v, id)=>{
        const d = Phaser.Math.Distance.Between(x,y,v.x,v.y);
        if (d < bestD){ bestD = d; best = { id, ...v }; }
      });
      return best;
    }

    // 힌트
    const hintModal = makeHintModal(this,{x:W/2,y:H/2,w:Math.min(980,W-120),h:Math.min(1000,H-260)},
      { hint1Text:C.hints?.h1||"", hint2Text:C.hints?.h2||null, onClose:()=>{} });

    const openHelp=()=>{
      const Z=2100; const dim=addDim(this,0.35,{interactive:true, depth:Z});
      const dlg=makeFrame(this,{x:W/2,y:H/2,w:680,h:420,key:"modal_plain_9"}); dlg.setDepth(Z+1);
      const txt=this.add.text(W/2,H/2-70,"도움이 필요해?",{fontFamily:theme.font,fontSize:48,color:"#1A1A1A"}).setOrigin(0.5).setDepth(Z+1);
      const yes=makeButton(this,{x:W/2-120,y:H/2+90,w:200,h:100,label:"예"},()=>{ close(); hintModal.show(); });
      const no =makeButton(this,{x:W/2+120,y:H/2+90,w:200,h:100,label:"아니오",style:"secondary"},()=> close());
      [yes,no].forEach(b=>{ b.btn.setDepth(Z+1); b.txt.setDepth(Z+2); b.zone.setDepth(Z+3); });
      function close(){ dim.destroy(); dlg.destroy(); txt.destroy(); yes.destroy(); no.destroy(); }
    };

    // 채점
    const keyC = C.infoTextCorrectKey || (this.scene.key + "_info_correct");
    const keyW = C.infoTextWrongKey   || (this.scene.key + "_info_wrong");
    const infoCorrect = C.infoTextCorrectPath ? (this.cache.text.get(keyC) || "") : (C.infoTextCorrect || "");
    const infoWrong   = C.infoTextWrongPath   ? (this.cache.text.get(keyW) || "") : (C.infoTextWrong || "");

    const submit=()=>{
      const mapping = C.answerMap || {}; // { pieceId: slotId }
      let allPlaced = true, allCorrect = true;
      (C.pieces||[]).forEach(p=>{
        const state = pieceMap.get(p.id);
        if (!state.onSlotId) allPlaced = false;
        if (mapping[p.id] && state.onSlotId !== mapping[p.id]) allCorrect = false;
      });
      const correct = allPlaced && allCorrect;

      runResultFlow(this,{
        problemLabel: `${C.num2} ${C.place}`,
        correct,
        infoTitle: C.infoTitle || "그거 아시나요?",
        infoTextCorrect: infoCorrect,
        infoTextWrong: infoWrong
      }).then(res=>{
        if(res.next==="continue"){ C.onSolved?.({correct}); }
        else if(res.next==="help"){ hintModal.show(); }
        else if(res.next==="retry"){ this.scene.restart(C); }
      });
    };
  }
}