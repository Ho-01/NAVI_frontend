// 숫자 입력 공용 씬 (키패드 내장 + 마스크 표시)
import theme from "../styles/theme.js";
import { addDim, makeFrame, makeButton, makeHintModal, buildCommonShell } from "../ui/components.js";
import runResultFlow from "../flows/resultFlow.js";

export default class TypeNumberScene extends Phaser.Scene {
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

    if (this.cfg.problemImgKey && this.cfg.problemImgPath)
      this.load.image(this.cfg.problemImgKey, this.cfg.problemImgPath);

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
    let cursorY = panelTop + 64;

    if (C.problemImgKey){
      const img = this.add.image(W/2, cursorY, C.problemImgKey).setOrigin(0.5,0);
      cursorY += (img.displayHeight || img.height || 160) + 32;
    }

    // 입력 마스크 표시 (예: "__ , __ , _" 또는 "###,###")
    const maskStr = C.inputMask || "___"; // '_' 또는 '#' = 자리수
    const maskBox = makeFrame(this,{x:W/2,y:cursorY+70,w:Math.min(820, W-120),h:140,key:"frame_plain_9"});
    const maskText = this.add.text(W/2, maskBox.y, maskStr, {
      fontFamily: theme.font, fontSize: 56, color: "#1A1A1A"
    }).setOrigin(0.5);
    cursorY = maskBox.y + 120;

    // 실시간 입력 렌더
    let digits = ""; // 숫자만 저장
    const renderValue = ()=>{
      let out=""; let di=0;
      for (let i=0;i<maskStr.length;i++){
        const ch = maskStr[i];
        if (ch==='_' || ch==='#'){
          out += (digits[di] ?? '·');
          di++;
        } else {
          out += ch;
        }
      }
      maskText.setText(out);
    };
    renderValue();

    // 키패드 (3x4)
    const keys = [
      "1","2","3",
      "4","5","6",
      "7","8","9",
      "C","0","⌫"
    ];
    const gridW = Math.min(820, W-120);
    const cellW = Math.floor(gridW/3);
    const startX = W/2 - gridW/2 + cellW/2;
    const startY = cursorY + 100;
    keys.forEach((k,idx)=>{
      const col = idx%3, row = Math.floor(idx/3);
      const x = startX + col*cellW;
      const y = startY + row*120;
      const b = makeButton(this,{x,y,w:cellW-24,h:96,label:k,style: (k==="C"?"secondary":"primary")},()=>{
        if (k==="C"){ digits=""; renderValue(); return; }
        if (k==="⌫"){ digits = digits.slice(0,-1); renderValue(); return; }
        if (/\d/.test(k)){
          // 자리 넘치지 않도록
          const slots = (maskStr.match(/[_#]/g)||[]).length;
          if (digits.length < slots){ digits += k; renderValue(); }
        }
      });
    });

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

    // 채점 로직
    const keyC = C.infoTextCorrectKey || (this.scene.key + "_info_correct");
    const keyW = C.infoTextWrongKey   || (this.scene.key + "_info_wrong");
    const infoCorrect = C.infoTextCorrectPath ? (this.cache.text.get(keyC) || "") : (C.infoTextCorrect || "");
    const infoWrong   = C.infoTextWrongPath   ? (this.cache.text.get(keyW) || "") : (C.infoTextWrong || "");

    function normalizeDigits(str){ return (str||"").replace(/\D+/g,""); }

    const submit=()=>{
      const user = normalizeDigits(digits);
      let correct = false;

      if (Array.isArray(C.acceptAnswers) && C.acceptAnswers.length){
        // 여러 정답 허용
        correct = C.acceptAnswers.map(normalizeDigits).some(a => a === user);
      } else if (typeof C.answer === "string" || typeof C.answer === "number"){
        correct = normalizeDigits(String(C.answer)) === user;
      }

      runResultFlow(this,{
        problemLabel: `${C.num2} ${C.place}`,
        correct,
        infoTitle: C.infoTitle || "그거 아시나요?",
        infoTextCorrect: infoCorrect,
        infoTextWrong: infoWrong
      }).then(res=>{
        if(res.next==="continue"){ C.onSolved?.({correct, value:user}); }
        else if(res.next==="help"){ hintModal.show(); }
        else if(res.next==="retry"){ this.scene.restart(C); }
      });
    };
  }
}