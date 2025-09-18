import theme from "../styles/theme.js";
import { addDim, makeFrame, makeButton, makeHintModal, buildCommonShell } from "../ui/components.js";
import runResultFlow from "../flows/resultFlow.js";

export default class Q06_Sujungjeon extends Phaser.Scene {
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

    if (this.cfg.bgKey && this.cfg.bgPath) this.load.image(this.cfg.bgKey, this.cfg.bgPath);
    (this.cfg.pieces||[]).forEach(p=>{
      if (p.imgKey && p.imgPath) this.load.image(p.imgKey, p.imgPath);
    });

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

    const panelTop = shell.contentBox.y - shell.contentBox.height/2;
    let cursorY = panelTop + 48;

    // 드래그 영역 — 슬롯
    const slotMap = new Map();
    (C.slots||[]).forEach(s=>{
      const node = this.add.circle(s.x, s.y, s.r||56, 0x000000, 0.06).setStrokeStyle(2,0x2b2b2b);
      slotMap.set(s.id, { ...s, node, occupiedBy:null });
    });

    // 드래그 — 책
    const pieceMap = new Map();
    (C.pieces||[]).forEach(p=>{
      const spr = this.add.image(p.start.x, p.start.y, p.imgKey).setOrigin(0.5).setInteractive({ draggable:true, useHandCursor:true });
      if (p.displayW && p.displayH) spr.setDisplaySize(p.displayW, p.displayH);
      spr.setData("pieceId", p.id);
      pieceMap.set(p.id, { sprite:spr, home:{x:p.start.x,y:p.start.y}, onSlotId:null, label:p.label });

      this.input.setDraggable(spr);
      spr.on("dragstart", ()=>{ this.children.bringToTop(spr); spr.setAlpha(0.9); });
      spr.on("drag", (_p, dx, dy)=>{ spr.x=dx; spr.y=dy; });
      spr.on("dragend", ()=>{
        spr.setAlpha(1);
        const pid = spr.getData("pieceId");
        const nearest = nearestSlot(spr.x, spr.y);
        const snapPx = C.snapPx ?? 32;

        const prev = pieceMap.get(pid).onSlotId;
        if (prev && slotMap.get(prev)) slotMap.get(prev).occupiedBy = null;
        pieceMap.get(pid).onSlotId = null;

        if (nearest && Phaser.Math.Distance.Between(spr.x, spr.y, nearest.x, nearest.y) <= snapPx && !nearest.occupiedBy){
          this.tweens.add({ targets: spr, x: nearest.x, y: nearest.y, duration: 100, ease: "Cubic.easeOut",
            onComplete: ()=>{ nearest.occupiedBy = pid; pieceMap.get(pid).onSlotId = nearest.id; }
          });
        } else {
          this.tweens.add({ targets: spr, x: pieceMap.get(pid).home.x, y: pieceMap.get(pid).home.y, duration: 140, ease: "Cubic.easeOut" });
        }
      });
    });

    function nearestSlot(x,y){
      let best=null, bestD=1e9;
      slotMap.forEach((v,id)=>{ const d = Phaser.Math.Distance.Between(x,y,v.x,v.y); if(d<bestD){bestD=d; best={id,...v};} });
      return best;
    }

    // 입력 라벨 + DOM input 3개
    const labels = ["집현전","수정전","내각 본부"];
    const domInputs = {}; // pieceId -> DOMElement
    const inputY = 1580;
    const xBySlot = { S1: C.slots[0].x, S2: C.slots[1].x, S3: C.slots[2].x };

    ["JIPHYEON","SUJUNG","NAEGAK"].forEach((pid,i)=>{
      const sx = xBySlot[`S${i+1}`];
      this.add.text(sx, inputY-36, labels[i], {fontFamily:theme.font,fontSize:36,color:"#1A1A1A"}).setOrigin(0.5,1);

      const frame = makeFrame(this,{x:sx,y:inputY+24,w:240,h:96,key:"frame_plain_9"});
      // DOM input
      const el = document.createElement("input");
      el.type = "text";
      el.placeholder = C.answersPlaceholder?.[pid] || (pid==="JIPHYEON" ? "세종" : (pid==="SUJUNG" ? "1867" : "1894"));
      el.style.width = "220px"; el.style.height = "64px"; el.style.fontSize = "28px"; el.style.textAlign = "center";
      const dom = this.add.dom(sx, inputY+24, el);
      domInputs[pid] = dom;
    });

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

    const keyC = C.infoTextCorrectKey || (this.scene.key + "_info_correct");
    const keyW = C.infoTextWrongKey   || (this.scene.key + "_info_wrong");
    const infoCorrect = C.infoTextCorrectPath ? (this.cache.text.get(keyC) || "") : (C.infoTextCorrect || "");
    const infoWrong   = C.infoTextWrongPath   ? (this.cache.text.get(keyW) || "") : (C.infoTextWrong || "");

    const submit=()=>{
      // 1) 순서 체크
      let orderOk = true;
      Object.entries(C.answerMap||{}).forEach(([pid, slotId])=>{
        const st = pieceMap.get(pid);
        if (!st || st.onSlotId !== slotId) orderOk = false;
      });

      // 2) 입력 체크 (공백/기호 무시 기본)
      const norm = (s)=> (s||"").toString().trim();
      const valJ = norm(domInputs["JIPHYEON"].node.value);
      const valS = norm(domInputs["SUJUNG"].node.value);
      const valN = norm(domInputs["NAEGAK"].node.value);

      let inputOk = true;
      if (norm(C.answers?.JIPHYEON) !== valJ) inputOk = false;
      if (norm(C.answers?.SUJUNG)   !== valS) inputOk = false;
      if (norm(C.answers?.NAEGAK)   !== valN) inputOk = false;

      const correct = orderOk && inputOk;

      runResultFlow(this,{
        problemLabel: `${C.num2} ${C.place}`,
        correct,
        infoTitle: C.infoTitle || "그거 아시나요?",
        infoTextCorrect: infoCorrect,
        infoTextWrong: infoWrong
      }).then(res=>{
        if(res.next==="continue"){ C.onSolved?.({correct, orderOk, inputOk}); }
        else if(res.next==="help"){ hintModal.show(); }
        else if(res.next==="retry"){ this.scene.restart(C); }
      });
    };

    // 씬 종료시 DOM 정리
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, ()=>{
      Object.values(domInputs).forEach(d=> d.destroy());
    });
  }
}
