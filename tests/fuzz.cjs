const HTML_PATH=process.env.GLUCO_HTML||require('path').join(__dirname,'..','dist','gluco-standalone.dev.html');
const {JSDOM,VirtualConsole}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(HTML_PATH,'utf8');const errors=[];
let seed=1;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
function game(gi){
  const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push('g'+gi+' '+String(e.detail&&e.detail.stack||e.message)));
  let cb=null,n=0;
  const dom=new JSDOM('<body>'+html.replace(/<link[^>]*>/,'')+'</body>',{url:'https://x.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.requestAnimationFrame=f=>{cb=f;return 1;};w.matchMedia=()=>({matches:false});w.Element.prototype.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.Element.prototype.setPointerCapture=()=>{};w.setTimeout=function(f){try{f();}catch(e){errors.push(e.stack);}return 0;};if(gi%2)w.localStorage.setItem('gluco-v1','not json');}});
  const w=dom.window,d=w.document;w.Date.now=()=>n;
  const tick=ms=>{n+=ms;const f=cb;cb=null;f&&f(n);};
  const ev=(t,type,o)=>t.dispatchEvent(new w.MouseEvent(type,Object.assign({bubbles:true,clientX:5,clientY:5},o||{})));
  const ids=[...d.querySelectorAll('.item')].map(x=>x.dataset.id);
  tick(16);ev(d.querySelector('[data-act=start]'),'click');
  let guard=0,bad=0,restarts=0;
  while(guard<30000&&restarts<2){
    guard++;
    const ov=d.getElementById('overlay');
    if(!d.getElementById('sheet').hidden&&rnd()<.3)ev(d.getElementById('sheetClose'),'click');
    else if(!ov.hidden){
      const bs=[...ov.querySelectorAll('button')];if(bs.length&&rnd()<.5)ev(bs[Math.floor(rnd()*bs.length)],'click');
    }else if(!d.getElementById('results').hidden){
      if(rnd()<.2){restarts++;ev(d.getElementById('again'),'click');}
    }else{
      const r=rnd();
      if(r<.12){const id=ids[Math.floor(rnd()*ids.length)];const it=d.querySelector('.item[data-id="'+id+'"]');ev(it,'pointerdown');
        if(rnd()<.5){ev(w,'pointermove',{clientX:60,clientY:60});}ev(w,'pointerup',{clientX:5+rnd()*100,clientY:5+rnd()*100});}
      else if(r<.14)ev(d.getElementById('gl'),'click');
      else if(r<.15)ev(d.getElementById('xlBtn'),'click');
      else if(r<.16)ev(d.getElementById('soundBtn'),'click');
      else if(r<.17)ev(d.getElementById(rnd()<.5?'adultsBtn':'dictBtn'),'click');
      else if(r<.18)w.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));
    }
    tick(100);
    const num=+d.getElementById('num').textContent;
    if(!(num>=35&&num<=320)){bad++;errors.push('g'+gi+' num '+d.getElementById('num').textContent);break;}
    if(/NaN|undefined/.test(d.getElementById('say').textContent+d.getElementById('trend').textContent+d.getElementById('pct').textContent)){errors.push('g'+gi+' NaN text');break;}
  }
  return {guard,restarts,clock:d.getElementById('clock').textContent};
}
for(let i=0;i<8;i++){console.log(i,JSON.stringify(game(i)));}
console.log('ERRORS:',errors.length?errors.slice(0,5):'none');

process.exitCode=errors.length?1:0;
