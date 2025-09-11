import { addDim, makeButton, makeResultScroll, makeTitleCard } from "../ui/components.js";

// 도장 페이지만
export function showStampPage(scene, { problemLabel, correct,
  durations={ stamp:500 }, wrongButtons=true,
  labels={ help:"도움받기", retry:"다시하기" } }){
  return new Promise((resolve)=>{
    const dim = addDim(scene, 1.0, { interactive:true, depth:1900 });
    const { width, height } = scene.scale;

    const card = makeTitleCard(scene, { x:width/2, y:height/2, label: problemLabel });
    card.container.setDepth(2000);

    const stampImg = scene.add.image(
      card.container.x + card.frame.width/2 - 120,
      card.container.y - card.frame.height/2 + 60,
      correct ? "stamp_correct_temp" : "stamp_wrong_temp"
    ).setScale(0.9).setAlpha(0).setDepth(2005);

    scene.tweens.add({
      targets: stampImg, alpha:1, angle:12,
      duration: durations.stamp, ease:"Cubic.easeOut", delay:250
    });

    const finish = (next)=>{
      card.container.destroy(); stampImg.destroy(); dim.destroy();
      resolve({ next, correct });
    };

    if (!correct && wrongButtons){
      scene.time.delayedCall(durations.stamp+250, ()=>{
        const y = height/2 + card.frame.height/2 + 220;
        const retry = makeButton(scene,{x:width/2 + 140,y,w:240,h:100,label:labels.retry},()=> finish("retry"));
        const help  = makeButton(scene,{x:width/2 - 140,y,w:240,h:100,label:labels.help,style:"secondary"},()=> finish("help"));
        [retry, help].forEach((b,i)=>{ b.btn.setDepth(2001+i); b.txt.setDepth(2002+i); b.zone.setDepth(2003+i); });
      });
    } else {
      scene.time.delayedCall(durations.stamp+300, ()=>{
        scene.input.once("pointerup", ()=> finish("continue"));
      });
    }
  });
}

// “그거 아시나요” 페이지만
export function showInfoPage(scene, { problemLabel, infoText,
  infoTitle="그거 아시나요?", correct=true, buttons=null }){
  return new Promise((resolve)=>{
    const infoPage = makeResultScroll(scene,{
      titleText: problemLabel, correct,
      infoTitle, infoText, showStamp:false, buttons
    });
    infoPage.show();
    if (!buttons || !buttons.length){
      scene.input.once("pointerup", ()=>{ infoPage.destroy(); resolve({ next:"continue" }); });
    } else {
      scene.events.once("INFO_RESOLVE", (payload)=>{ infoPage.destroy(); resolve(payload||{ next:"continue" }); });
    }
  });
}

// 기본 플로우: 도장 → 그거 아시나요
export default async function runResultFlow(scene, opt){
  const { problemLabel="", correct=false, infoTextCorrect="",
          infoTextWrong="", infoTitle="그거 아시나요?", durations, labels } = opt || {};

  const r = await showStampPage(scene, { problemLabel, correct, durations, labels, wrongButtons:false });

  const infoText = r.correct ? infoTextCorrect : (infoTextWrong || "");
  const buttons = r.correct ? null : [
    { label: labels?.retry || "다시하기", onTap: ()=> scene.events.emit("INFO_RESOLVE",{ next:"retry" }) },
    { label: labels?.help  || "도움받기", onTap: ()=> scene.events.emit("INFO_RESOLVE",{ next:"help"  }) },
  ];
  return await showInfoPage(scene, { problemLabel, infoText, infoTitle, correct:r.correct, buttons });
}