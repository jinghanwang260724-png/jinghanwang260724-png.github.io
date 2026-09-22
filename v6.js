(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>v*v*(3-2*v);
const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches||document.documentElement.classList.contains('static-mode');
const observe=$('#observe'),question=$('#question'),tears=[],tray=$('.personal-tray');let pending=false;
// One shared colour value removes the hard seam between both sections.
function tint(){if(!observe||!question)return;const y=observe.getBoundingClientRect().top,p=clamp((innerHeight*.97-y)/(innerHeight*.68));const a=[199,223,210];const rgb=a.map(n=>Math.round(n+(255-n)*p)).join(',');question.style.setProperty('--research-paper',`rgb(${rgb})`);observe.style.setProperty('--research-paper',`rgb(${rgb})`);observe.dataset.tint=p.toFixed(3)}
const stage=$('.photo-book-stage'),volume=$('.photo-volume');
if(stage&&volume){stage.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||reduced())return;const r=stage.getBoundingClientRect(),x=clamp((e.clientX-r.left)/r.width),y=clamp((e.clientY-r.top)/r.height);volume.style.setProperty('--book-x',(8+(y-.5)*-20)+'deg');volume.style.setProperty('--book-y',(-24+(x-.5)*34)+'deg')});stage.addEventListener('pointerleave',()=>{volume.style.removeProperty('--book-x');volume.style.removeProperty('--book-y')})}
const sticker=$('.camera-sticker'),panel=$('#instant-camera-panel');let expansion;
sticker?.addEventListener('click',()=>{const open=sticker.getAttribute('aria-expanded')!=='true';sticker.setAttribute('aria-expanded',String(open));expansion?.cancel();const old=panel.hidden?0:panel.getBoundingClientRect().height;panel.hidden=false;panel.inert=!open;const next=open?panel.scrollHeight:0;if(reduced()){panel.hidden=!open;panel.style.height='';window.ScrollTrigger?.refresh();update();return}panel.style.height='auto';expansion=panel.animate([{height:old+'px',opacity:open?0:1},{height:next+'px',opacity:open?1:0}],{duration:650,easing:'cubic-bezier(.22,.75,.2,1)',fill:'both'});expansion.finished.then(()=>{panel.hidden=!open;expansion.cancel();panel.style.height='';window.ScrollTrigger?.refresh();update()}).catch(()=>{});});if(panel)panel.inert=true;
// The first state really sits inside the tray; spreading is triggered by the whole stage fitting on screen.
let spread=false;function trayState(){if(!tray)return;const r=tray.getBoundingClientRect();if(reduced()||(r.top>=75&&r.bottom<=innerHeight-12)){spread=true}else if(r.top>innerHeight*.9){spread=false}tray.classList.toggle('is-spread',spread);tray.dataset.state=spread?'spread':'packed'}
$$('.tray-object').forEach(b=>b.addEventListener('focus',()=>{spread=true;tray?.classList.add('is-spread')}));
// A jagged tear propagates from right to left, followed by the loose underside curling away.
function drawPaper(t){const r=t.getBoundingClientRect(),pin=$('.paper-pin',t),w=pin.clientWidth,h=pin.clientHeight;const progress=reduced()?1:clamp(-r.top/Math.max(1,r.height-h));t.dataset.progress=progress.toFixed(4);let p=t.classList.contains('recover')?1-progress:progress;const svg=$('svg',t);svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
const tip=w*(1.08-ease(clamp(p/.66))*1.3),rise=ease(p),base=h*(.82-1.1*rise),tilt=h*.17*Math.sin(Math.PI*p),lift=+(t.dataset.lift||0),points=[];
const noise=x=>Math.sin(x*.013)*h*.014+Math.sin(x*.039)*h*.006+Math.sin(x*.17)*1.6+Math.sin(x*.83)*.7;
// The remaining sheet bends down from the moving tear tip, avoiding a straight vertical cut.
const edgeY=x=>base+tilt*(1-x/w)+noise(x)+lift*(x/w)**6;
if(tip>-30&&tip<w+35){points.push([-35,h+100]);const ty=edgeY(tip);for(let s=1;s>0;s-=.025){points.push([tip-Math.sin(s*Math.PI*.6)*w*.065+Math.sin(s*87)*2,ty+s*(h+100-ty)])}points.push([tip,ty])}
for(let x=Math.max(-30,tip);x<=w+35;x+=3)points.push([x,edgeY(x)]);
if(!points.length)points.push([-35,h+100],[w+35,h+100]);
const pts=(arr,off=0)=>arr.map(([x,y])=>`${x.toFixed(1)},${(y+off).toFixed(1)}`).join('L');
// The face polygon goes directly from its top-right corner to the torn edge.
const cut=off=>`M-35,-100H${w+35}L${pts([...points].reverse(),off)}Z`;
const fiber=points.map(([x,y])=>[x,y+8+Math.sin(x*.023)*5+Math.sin(x*.062)*2]);
$('.paper-shadow',t).setAttribute('d',cut(17));$('.paper-fiber',t).setAttribute('d',`M-35,-100H${w+35}L${pts([...fiber].reverse())}Z`);$('.paper-face',t).setAttribute('d',cut(-2));
let flap='';if(p>.018&&p<.7&&tip<w){const tx=Math.max(-w*.23,tip),ty=base+tilt*(1-tx/w)+noise(tx),size=Math.sin(clamp(p/.7)*Math.PI),fw=w*(.17+.3*size),fh=h*(.2+.42*size);flap=`M${tx},${ty} C${tx+fw*.2},${ty+fh*.19} ${tx+fw*.1},${ty+fh*.56} ${tx+fw*.03},${ty+fh*.8} Q${tx+fw*.55},${ty+fh*.96} ${tx+fw},${ty+fh} Q${tx+fw*.47},${ty+fh*.39} ${tx},${ty}Z`;$('.paper-crease',t).setAttribute('d',`M${tx},${ty}Q${tx+fw*.27},${ty+fh*.46} ${tx+fw},${ty+fh}`)}else $('.paper-crease',t).setAttribute('d','');
$('.paper-fold',t).setAttribute('d',flap);$('.paper-fold-grain',t).setAttribute('d',flap);$('.paper-flap-shadow',t).setAttribute('d',flap);$('.paper-flap-shadow',t).setAttribute('transform','translate(10,20)');
if(p<=.001){$('.paper-face',t).setAttribute('d',`M-35,-100H${w+35}V${h+150}H-35Z`);$('.paper-fiber',t).setAttribute('d','');$('.paper-shadow',t).setAttribute('d','')}
if(p>=.999){$$('path',svg).forEach(el=>el.setAttribute('d',''))}
}
function update(){pending=false;tint();trayState();tears.forEach(drawPaper)}
function schedule(){if(!pending){pending=true;requestAnimationFrame(update)}}
tears.forEach(t=>{t.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&!reduced()){const r=t.getBoundingClientRect();t.dataset.lift=String(-Math.min(12,(e.clientX-r.left)/r.width*12));schedule()}});t.addEventListener('pointerleave',()=>{t.dataset.lift='0';schedule()})});
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('v6-motion-change',schedule);addEventListener('how-language-change',schedule);document.fonts.ready.then(update);update();
})();
