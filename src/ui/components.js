
import theme from "../styles/theme.js";

export function addDim(scene, alpha=0.25, opts={}) {
  const { interactive=false, depth=5 } = opts;
  const { width, height } = scene.scale;
  const r = scene.add.rectangle(width/2, height/2, width, height, 0x000000, alpha);
  if (interactive) r.setInteractive();
  r.setDepth(depth);
  return r;
}

export function makeFrame(scene, {x,y,w,h,key="frame_plain_9", pad={left:24,right:24,top:24,bottom:24}}){
  const hasRex = !!scene.add && !!scene.add.rexNinePatch;
  if (hasRex) {
    const np = scene.add.rexNinePatch({
      x, y, key, width: w, height: h,
      left: pad.left, right: pad.right, top: pad.top, bottom: pad.bottom
    });
    np.setOrigin(0.5);
    return np;
  }
  return scene.add.rectangle(x,y,w,h,0xffffff,1).setStrokeStyle(2,0x2B2B2B).setOrigin(0.5);
}

export function makeButton(scene, {x,y,w=360,h=120,label="버튼",style="primary"}, onClick){
  const baseKey = style==="secondary" ? "btn_secondary_9" : "btn_primary_9";
  const btn = makeFrame(scene,{x,y,w,h,key:baseKey});
  const txt = scene.add.text(x,y,label,{fontFamily:theme.font,fontSize:44,color:"#1A1A1A"}).setOrigin(0.5);
  const zone = scene.add.zone(x,y,w,h).setInteractive({useHandCursor:true});
  let disabled=false;
  zone.on("pointerup", ()=>{ if(!disabled && onClick) onClick(); });
  return {
    setDisabled(v){ disabled=v; const a=v?0.5:1; btn.setAlpha(a); txt.setAlpha(a); },
    setLabel(t){ txt.setText(t); },
    destroy(){ btn.destroy(); txt.destroy(); zone.destroy(); },
    btn, txt, zone
  };
}

export function makeScrollableTextBox(scene, { x,y,w, minH=160, maxH=480, text, fontSize=40 }){
  const temp = scene.add.text(0,0,text,{fontFamily:theme.font,fontSize,wordWrap:{width:w-160,lineHeight:48}}).setVisible(false);
  const need = Math.max(minH, Math.ceil(temp.height + 64));
  temp.destroy();
  const H = Math.min(need, maxH);
  const frame = makeFrame(scene,{x,y,w,h:H,key:"frame_plain_9"});
  const view = scene.add.container(x - (w/2) + 80, y - (H/2) + 40);
  const content = scene.add.text(0,0,text,{fontFamily:theme.font,fontSize,color:"#1A1A1A",wordWrap:{width:w-160,lineHeight:48}}).setOrigin(0,0);
  view.add(content);
  const g = scene.add.graphics().fillStyle(0xffffff,1).fillRect(x - w/2 + 64, y - H/2 + 32, w - 128, H - 64);
  const mask = g.createGeometryMask();
  view.setMask(mask);
  const scrollMax = Math.max(0, content.height - (H - 64));
  let sy=0, dragging=false, startY=0, startSy=0;
  const zone = scene.add.zone(x,y,w,H).setInteractive();
  const barW=6; const barH=Math.max(24, (H-64) * (H-64) / Math.max((H-64)+content.height,1));
  const barX = x + w/2 - 24; const barTop = y - H/2 + 32;
  const bar = scene.add.rectangle(barX, barTop, barW, barH, 0x000000, 0.35).setVisible(false);
  const clamp = v => Phaser.Math.Clamp(v, -scrollMax, 0);
  zone.on("pointerdown", p=>{ dragging=true; startY=p.worldY; startSy=sy; bar.setVisible(true); });
  zone.on("pointermove", p=>{ if(!dragging) return; sy = clamp(startSy + (p.worldY - startY)); view.y = (y - H/2 + 40) + sy;
    const ratio = (-sy) / (scrollMax || 1); bar.y = barTop + ratio * ((H - 64) - barH);
  });
  zone.on("pointerup", ()=>{ dragging=false; bar.setVisible(false); });
  zone.on("pointerout", ()=>{ dragging=false; bar.setVisible(false); });
  return { frame, view, content, zone, bar, height:H };
}

export function buildCommonShell(scene, {
  num2="01", place="서십자각터",
  bgKey=null, bgAlpha=0.30,
  questionText="",
  halfStartRatio=0.5,
  sizes={ labelH: 88 }
}={}, handlers={ onHelp:null, onDecide:null }){

  const W = scene.scale.width, H = scene.scale.height;
  const safeTop = 24, safeBottom = 24;          // 필요시 theme로 뺄 수 있음
  const innerW = W - 32 * 2;                    // ✅ 좌우 32px 통일
  const labelY = safeTop + sizes.labelH/2;

  // 상단 라벨 박스 (가로폭 통일)
  const labelBox = makeFrame(scene, {
    x: W/2, y: labelY, w: innerW, h: sizes.labelH, key: "frame_plain_9"
  });
  const labelText = scene.add.text(W/2, labelY, `${num2} ${place}`, {
    fontFamily: theme.font, fontSize: 44, color: "#1A1A1A"
  }).setOrigin(0.5);

  // 컨텐츠 시작선(화면 절반)
  const contentTop = Math.floor(H * halfStartRatio);

  // 중간 배경 : 라벨 아래부터 컨텐츠 시작선까지 (여백 제거)
  let bg = null;
  if (bgKey){
    const midTop = labelY + sizes.labelH/2;             // 라벨 하단
    const midH   = Math.max(1, contentTop - midTop);    // ✅ -24 삭제
    bg = scene.add.image(W/2, midTop + midH/2, bgKey)
                .setDisplaySize(innerW, midH)           // ✅ 가로폭 통일
                .setAlpha(bgAlpha);
  }

  // 하단 패널 : 절반부터 바닥까지 (여백 제거)
  const contentH  = H - contentTop - safeBottom;         // ✅ -24 삭제
  const contentBox = makeFrame(scene, {
    x: W/2, y: contentTop + contentH/2,
    w: innerW,                                          // ✅ 가로폭 통일
    h: contentH, key: "frame_plain_9"
  });

  // 질문 박스 : 라벨~컨텐츠 사이 영역, 가로폭 통일
  const spaceTop = labelY + sizes.labelH/2 + 0;          // 원하면 +16 등으로 미세조정
  const spaceH   = contentTop - spaceTop;                // ✅ -24 삭제
  const qMaxH    = Math.min(spaceH * 0.65, H * 0.45);
  const qW       = innerW;                               // ✅ 가로폭 통일
  const qCenterY = spaceTop + Math.min(qMaxH, spaceH)/2;
  const qBox = makeScrollableTextBox(scene, {
    x: W/2, y: qCenterY, w: qW, minH: 160, maxH: qMaxH,
    text: questionText, fontSize: 40
  });

  // 하단 버튼은 그대로
  const bottomY = H - safeBottom - 100;
  const helpBtn   = makeButton(scene,{x:W/2-220,y:bottomY,w:360,h:120,label:"도움",style:"secondary"},()=>handlers.onHelp && handlers.onHelp());
  const decideBtn = makeButton(scene,{x:W/2+220,y:bottomY,w:360,h:120,label:"결정",style:"primary"},()=>handlers.onDecide && handlers.onDecide());

  return { labelBox, labelText, qBox, contentBox, contentTop, contentH, helpBtn, decideBtn, bg };
}

export function makeChoiceCircle(scene, spec, onSelect){
  const { id, x, y, r=96, bg=0xffffff, text="가", imgKey=null } = spec;
  const ring = scene.add.circle(x,y,r+10,0x000000,0)
    .setStrokeStyle(8, Phaser.Display.Color.HexStringToColor("#465A2F").color, 1)
    .setVisible(false);
  const circle = scene.add.circle(x,y,r,0xffffff,1).setStrokeStyle(4,0x000000,1);
  circle.setFillStyle(Phaser.Display.Color.HexStringToColor(bg).color, 1);
  const inner = imgKey
    ? scene.add.image(x,y,imgKey).setDisplaySize(r*1.3,r*1.3)
    : scene.add.text(x,y,text,{fontFamily:theme.font,fontSize:56,color:"#1A1A1A"}).setOrigin(0.5);
  const shadow = scene.add.ellipse(x+6,y+6,r*2,r*2,0x000000,0.12).setVisible(false).setDepth(circle.depth-1);
  const zone = scene.add.zone(x,y,r*2,r*2).setInteractive({useHandCursor:true});

  let selected=false;
  zone.on("pointerup", ()=> onSelect && onSelect(id, api));

  const api = {
    id,
    select(){
      selected=true;
      circle.setStrokeStyle(6, Phaser.Display.Color.HexStringToColor("#465A2F").color, 1);
      shadow.setVisible(true);
      inner.setAlpha(1);
      ring.setVisible(true);
    },
    deselect(){
      selected=false;
      circle.setStrokeStyle(4,0x000000,1);
      shadow.setVisible(false);
      ring.setVisible(false);
    },
    setBg(hex){ circle.setFillStyle(Phaser.Display.Color.HexStringToColor(hex).color,1); },
    isSelected(){ return selected; },
    objects:{ring,circle,inner,shadow,zone}
  };
  return api;
}

export function makeHintModal(scene, {x,y,w,h}, {hint1Text, hint2Text, onClose}){
  const container = scene.add.container(x,y).setDepth(2000).setVisible(false);
  const dim = addDim(scene, 0.35, { interactive:true, depth:1999 }); 
  dim.setVisible(false);

  const frame = makeFrame(scene,{x:0,y:0,w,h,key:"modal_plain_9",pad:{left:64,right:64,top:64,bottom:64}});
  const title = scene.add.text(0, -h/2+90, "실마리 1", {fontFamily:theme.font,fontSize:52,color:"#1A1A1A"}).setOrigin(0.5);
  const close = scene.add.text(w/2-80, -h/2+60, "✕", {fontFamily:theme.font,fontSize:44,color:"#333"})
    .setOrigin(0.5).setInteractive({useHandCursor:true});
  const body = scene.add.text(0, 0, "", {fontFamily:theme.font,fontSize:40,color:"#1A1A1A",wordWrap:{width:w-160}})
    .setOrigin(0.5,0.5);
  const nextBtn = makeButton(scene,{x:0,y:h/2-80,w:280,h:120,label:"다음 힌트",style:"primary"},()=>tryOpenHint2());

  let unlocked=[true, !!hint2Text], stage=1;
  function setStage(n){
    stage=n;
    title.setText(`실마리 ${n}`);
    body.setText(n===1 ? (hint1Text||"") : (hint2Text||""));
    nextBtn.setDisabled(!hint2Text || (n===2));
  }
  function tryOpenHint2(){
    if(!hint2Text) return;
    if(!unlocked[1]){
      scene.events.emit("openHintConfirm2",{ 
        onYes:()=>{ unlocked[1]=true; setStage(2); }, onNo:()=>{} 
      });
    }else setStage(2);
  }
  close.on("pointerup", ()=>{ hide(); onClose && onClose({unlocked}); });

  container.add([frame,title,body,nextBtn.btn,nextBtn.txt,nextBtn.zone,close]);

  function show(){ dim.setVisible(true); container.setVisible(true); setStage(1); }
  function hide(){ container.setVisible(false); dim.setVisible(false); }
  return { show, hide, container, dim };
}

export function makeTitleCard(scene, {x, y, label, w=520, h=200}) {
  const container = scene.add.container(x, y);
  const frame = makeFrame(scene, {x:0, y:0, w, h, key:"frame_plain_9"});
  const title = scene.add.text(0, 0, label, { fontFamily:theme.font, fontSize:44, color:"#1A1A1A" }).setOrigin(0.5);
  container.add([frame, title]); container.setAlpha(0);
  scene.tweens.add({targets:container, alpha:1, duration:250, ease:"Cubic.easeOut"});
  return { container, frame, title };
}

export function makeResultScroll(scene, {
  titleText, correct, infoText, infoTitle=null, showStamp=true, buttons=null
}){
  const { width, height } = scene.scale;

  const dim = addDim(scene, 1.0, { interactive:true, depth:1900 });
  dim.setVisible(false);

  const container = scene.add.container(width/2, height/2)
    .setDepth(2000).setVisible(false);

  const frame = makeFrame(scene, {
    x:0, y:0,
    w: Math.min(980, width - 120),
    h: Math.min(1200, height - 240),
    key: "scroll_plain_9",
    pad: { left:64, right:64, top:64, bottom:64 }
  });

  const caption = scene.add.text(0, -frame.height/2 + 90, titleText || "", {
    fontFamily: theme.font, fontSize: 52, color: "#1A1A1A"
  }).setOrigin(0.5);

  const title2 = infoTitle
    ? scene.add.text(0, -frame.height/2 + 200, infoTitle, {
        fontFamily: theme.font, fontSize: 44, color: "#1A1A1A"
      }).setOrigin(0.5)
    : null;

  const bodyTopY = infoTitle ? -40 : 0;
  const info = scene.add.text(0, bodyTopY, infoText || "", {
    fontFamily: theme.font, fontSize: 40, color: "#1A1A1A",
    wordWrap: { width: frame.width - 160, lineHeight: 48 },
    align: "center"
  }).setOrigin(0.5);

  const stampKey = correct ? "stamp_correct_temp" : "stamp_wrong_temp";
  const stamp = showStamp
    ? scene.add.image(frame.width/2 - 180, -frame.height/2 + 160, stampKey)
        .setScale(0.9).setAlpha(0)
    : null;

  const addList = [frame, caption, info];
  if (title2) addList.splice(2, 0, title2);
  if (showStamp && stamp) addList.push(stamp);
  container.add(addList);

  // (옵션) 하단 버튼
  let btnDestroyers = [];
  if (buttons?.length) {
    const y = frame.height/2 - 80;
    const step = 320;
    buttons.forEach((b, i) => {
      const bx = -((buttons.length - 1) * step) / 2 + i * step;
      const B = makeButton(scene, {
        x: bx, y, w: 240, h: 100, label: b.label, style: b.style || "primary"
      }, () => b.onTap && b.onTap());
      btnDestroyers.push(() => B.destroy());
      container.add([B.btn, B.txt, B.zone]);
    });
  }

  function show(){
    dim.setVisible(true);
    container.setVisible(true);
    scene.tweens.add({ targets: container, alpha: 1, duration: 350, ease: "Cubic.easeOut" });
    if (showStamp && stamp) {
      scene.time.delayedCall(350, () => {
        scene.tweens.add({ targets: stamp, alpha: 1, angle: 12, duration: 500, ease: "Cubic.easeOut" });
      });
    }
  }
  function destroy(){
    btnDestroyers.forEach(f => f());
    container.destroy();
    dim.destroy();
  }

  return { show, destroy, container, dim, frame, caption, info, stamp };
}