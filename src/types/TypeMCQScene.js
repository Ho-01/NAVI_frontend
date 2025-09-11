
import theme from "../styles/theme.js";
import { addDim, makeFrame, makeButton, makeChoiceCircle, makeHintModal, buildCommonShell } from "../ui/components.js";
import runResultFlow from "../flows/resultFlow.js";

export default class TypeMCQScene extends Phaser.Scene{
  constructor(key){ super(key); }
  init(data){ this.cfg = data; }
  preload(){
    this.load.image("frame_plain_9","assets/ui/frame_plain_9.png");
    this.load.image("modal_plain_9","assets/ui/modal_plain_9.png");
    this.load.image("scroll_plain_9","assets/ui/scroll_plain_9.png");
    this.load.image("btn_primary_9","assets/ui/btn_primary_9.png");
    this.load.image("btn_secondary_9","assets/ui/btn_secondary_9.png");
    this.load.image("stamp_correct_temp","assets/fx/stamp_correct_temp.png");
    this.load.image("stamp_wrong_temp","assets/fx/stamp_wrong_temp.png");
    if(this.cfg.bgKey && this.cfg.bgPath) this.load.image(this.cfg.bgKey, this.cfg.bgPath);
    if(this.cfg.problemImgKey && this.cfg.problemImgPath) this.load.image(this.cfg.problemImgKey, this.cfg.problemImgPath);
    (this.cfg.choices||[]).forEach(c=>{
      if(c.imgKey && c.imgPath) this.load.image(c.imgKey,c.imgPath);
      if(c.sideImgKey && c.sideImgPath) this.load.image(c.sideImgKey,c.sideImgPath);
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
    let offsetY = 24;
    if (C.problemImgKey){
      const imgTop = shell.contentBox.y - shell.contentBox.height/2 + 80;
      const img = this.add.image(W/2, imgTop, C.problemImgKey).setOrigin(0.5,0);
      offsetY = (img.displayHeight || img.height || 160) + 40;
    }
    const panelTop = shell.contentBox.y - shell.contentBox.height/2;
    let cursorY = panelTop + 64;                           // ✅ 패널 안쪽 상단여백 64

    if (C.problemImgKey){
      const img = this.add.image(W/2, cursorY, C.problemImgKey).setOrigin(0.5,0);
      cursorY += (img.displayHeight || img.height || 160) + 32;  // ✅ 이미지와 보기 사이 간격 32
    }

    const gridTop = cursorY;
    const gapX = (shell.contentBox.width/2) - 220;
    const gapY = 220;
    let selectedId=null;
    const nodes=(C.choices||[]).map((c,i)=>{
      const col=i%2, row=Math.floor(i/2);
      const cx = W/2 + (col?gapX:-gapX);
      const cy = gridTop + row*gapY;
      const node = makeChoiceCircle(this,{ id:c.id, x:cx, y:cy, r:96, text:c.text, imgKey:c.imgKey, bg: c.bg || Object.values(theme.color.choice)[i] },(id,api)=>{
        if(selectedId===id){ api.deselect(); shrink(api); selectedId=null; shell.decideBtn.setDisabled(true); return; }
        nodes.forEach(n=>{ if(n.id!==id){ n.deselect(); shrink(n); } });
        api.select(); grow(api); selectedId=id; shell.decideBtn.setDisabled(false);
      });
      if (c.sideImgKey) this.add.image(cx + 140, cy, c.sideImgKey).setDisplaySize(88,88).setOrigin(0.5);
      return node;
    });
    const grow   = (api)=> this.tweens.add({ targets:[api.objects.circle, api.objects.inner], scale:1.08, duration:120, ease:"Cubic.easeOut" });
    const shrink = (api)=> this.tweens.add({ targets:[api.objects.circle, api.objects.inner], scale:1.00, duration:120, ease:"Cubic.easeOut" });
    const hintModal = makeHintModal(this,{x:W/2,y:H/2,w:Math.min(980,W-120),h:Math.min(1000,H-260)},{ hint1Text:C.hints?.h1||"", hint2Text:C.hints?.h2||null, onClose:()=>{} });
    const openHelp=()=>{
      const Z=2100; const dim=addDim(this,0.35,{interactive:true, depth:Z});
      const dlg=makeFrame(this,{x:W/2,y:H/2,w:680,h:420,key:"modal_plain_9"}); dlg.setDepth(Z+1);
      const txt=this.add.text(W/2,H/2-70,"도움이 필요해?",{fontFamily:theme.font,fontSize:48,color:"#1A1A1A"}).setOrigin(0.5).setDepth(Z+1);
      const yes=makeButton(this,{x:W/2-120,y:H/2+90,w:200,h:100,label:"예"},()=>{ close(); hintModal.show(); });
      const no =makeButton(this,{x:W/2+120,y:H/2+90,w:200,h:100,label:"아니오",style:"secondary"},()=> close());
      [yes,no].forEach(b=>{ b.btn.setDepth( Z+1); b.txt.setDepth( Z+2); b.zone.setDepth( Z+3); });
      function close(){ dim.destroy(); dlg.destroy(); txt.destroy(); yes.destroy(); no.destroy(); }
    };
    const keyC = C.infoTextCorrectKey || (this.scene.key + "_info_correct");
    const keyW = C.infoTextWrongKey   || (this.scene.key + "_info_wrong");
    const infoCorrect = C.infoTextCorrectPath ? (this.cache.text.get(keyC) || "") : (C.infoTextCorrect || "");
    const infoWrong   = C.infoTextWrongPath   ? (this.cache.text.get(keyW) || "") : (C.infoTextWrong || "");
    const submit = ()=>{
      runResultFlow(this,{
        problemLabel: `${C.num2} ${C.place}`,
        correct: selectedId === C.correctId,
        infoTitle: C.infoTitle || "그거 아시나요?",
        infoTextCorrect: infoCorrect,
        infoTextWrong: infoWrong
      }).then(res=>{
        if(res.next==="continue"){ C.onSolved?.({correct: selectedId===C.correctId, answer:selectedId}); }
        else if(res.next==="help"){ hintModal.show(); }
        else if(res.next==="retry"){ this.scene.restart(C); }
      });
    };
    this.children.list.filter(o => o.text === "힌트").forEach(o => o.destroy());
  }
}
