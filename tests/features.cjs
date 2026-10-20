const HTML_PATH=process.env.GLUCO_HTML||require('path').join(__dirname,'..','dist','gluco-standalone.dev.html');
const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('fs');
const html=fs.readFileSync(HTML_PATH,'utf8');
const errors=[];
const vc=new VirtualConsole();
vc.on('jsdomError',e=>errors.push('jsdomError: '+(e.detail&&e.detail.stack||e.message||e)));
vc.on('error',e=>errors.push('console.error: '+e));
let cb=null;
const dom=new JSDOM('<!doctype html><html><head></head><body>'+html.replace(/<link[^>]*>/,'')+'</body></html>',{
  url:'https://x.test/',runScripts:'dangerously',virtualConsole:vc,
  beforeParse(w){w.localStorage.setItem('gluco-v1','{"best":50,"me":"Ana","stars":5,"acc":"hat","speed":"normal","log":[]}');
    w.requestAnimationFrame=f=>{cb=f;return 1;};
    w.matchMedia=()=>({matches:false});
    w.Element.prototype.scrollIntoView=()=>{};
    w.Element.prototype.setPointerCapture=()=>{};w.Element.prototype.scrollBy=function(){};w.Element.prototype.scrollTo=function(){};
    w.setTimeout=function(f){try{f();}catch(e){errors.push('timeout '+e.stack);}return 0;};
  }
});
const w=dom.window,d=w.document;let now=0;w.Date.now=()=>now;
const tick=(n,ms)=>{for(let i=0;i<n;i++){now+=ms;const f=cb;cb=null;if(f)f(now);}};
const tap=id=>{const it=d.querySelector('.item[data-id="'+id+'"]');
  it.dispatchEvent(new w.MouseEvent('pointerdown',{bubbles:true,clientX:5,clientY:5}));
  w.dispatchEvent(new w.MouseEvent('pointerup',{bubbles:true,clientX:5,clientY:5}));};
const txt=s=>d.querySelector(s).textContent.trim();
const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
const stat={games:0,low:0,lowWrongOk:0,lowDone:0,pred:0,predFb:0,results:0,chips:0,chat:0,wx:{},yawn:0,cloudDisplay:0,friend:0};
const failures=[];
function checkGaps(opens,g){
  const t=opens.filter(o=>!/L$/.test(o)).map(o=>{const m=o.match(/(\d+):(\d+)/);return +m[1]*60+ +m[2];});
  for(let i=1;i<t.length;i++)if(t[i]-t[i-1]<95)failures.push('Partida '+g+': dos ventanas separadas por solo '+(t[i]-t[i-1])+' min de juego');
}
const sitIdx=[1,0];
function playGame(g){
  let guard=0,did1=false,wrongTested=false,wasOpen=false;const opens=[];
  d.getElementById('overlay').querySelector('[data-act="start"]')&&click(d.getElementById('overlay').querySelector('[data-act="start"]'));
  tick(3,100);
  stat.wx[d.getElementById('wx').className]=(stat.wx[d.getElementById('wx').className]||0)+1;
  tap(g%2?'soda':'pizza');tap('cake');
  while(d.getElementById('results').hidden&&guard<20000){
    guard++;
    const ov=d.getElementById('overlay');
    if(!ov.hidden&&!wasOpen){opens.push(txt('#clock').replace(/[^0-9:]/g,'')+(ov.querySelector('[data-act=lowstep]')?'L':ov.querySelector('[data-act=qa]')?'Q':ov.querySelector('[data-act=pred]')?'P':'E'));}
    wasOpen=!ov.hidden;
    if(!ov.hidden){
      const t=ov.textContent;
      if(t.includes('¿Qué creés que va a pasar')){stat.pred++;const b=[...ov.querySelectorAll('[data-act="pred"]')];click(b[guard%3]);if(ov.querySelector('.fb'))stat.predFb++;}
      else if(ov.querySelector('[data-act="lowstep"]')){
        stat.low++;
        const steps=[...ov.querySelectorAll('[data-act="lowstep"]')];
        if(!wrongTested){wrongTested=true;const wrong=steps.find(b=>b.dataset.n==='3');click(wrong);const hint=d.getElementById('lowHint').textContent;if(/Casi\. Primero va: parar/.test(hint)&&wrong.classList.contains('bad')&&!wrong.disabled)stat.lowWrongOk++;else console.log('WRONG-HINT',hint);
          if(!d.getElementById('lowGo').hidden)console.log('BUG go visible early');}
        for(let n=1;n<=4;n++){click([...ov.querySelectorAll('[data-act="lowstep"]')].find(b=>+b.dataset.n===n));}
        if(!d.getElementById('lowGo').hidden)stat.lowDone++;else console.log('BUG go hidden at end');
        click(d.getElementById('lowGo'));
      }
      else{
        const sits=ov.querySelectorAll('[data-act=sit]');
        if(sits.length){const k=sits[0].dataset.k;if(k==='gym'||k==='bday'){}click(sits[sitIdx[g%2]%sits.length]);}
        else{const q=ov.querySelector('[data-act=qa]'),nx=ov.querySelector('[data-act=qnext]:not([hidden])'),ev=ov.querySelector('[data-act=evok]');const e=q||nx||ev;if(e)click(e);}
      }
    }else{
      const pu=d.querySelector('.item.pulse');
      if(guard%30===0&&pu)tap(pu.dataset.id);
      if(guard%30===15&&+txt('#keyBadge')>0&&!/baj/.test(txt('#say')))tap('key');
      if(guard%200===100&&/temblando/.test(txt('#say')))tap('juice');
    }
    tick(1,100);
  }
  console.log('OVERLAYS g'+g+':',opens.join(' '));checkGaps(opens,g);
  stat.games++;
  const r=d.getElementById('results');
  if(!r.hidden){stat.results++;stat.chips+=r.querySelectorAll('.chips span').length;stat.chat+=r.querySelectorAll('.chat').length;
    if(g===0){console.log('RESULTS:',r.textContent.replace(/\s+/g,' ').slice(0,1500));}
    click(d.getElementById('again'));tick(3,100);}
}
for(let g=0;g<14;g++)playGame(g);
console.log(JSON.stringify(stat));
if(stat.results!==stat.games)failures.push('No todas las partidas llegaron a la pantalla final');
if(stat.lowWrongOk!==stat.low||stat.lowDone!==stat.low)failures.push('El paso a paso de glucosa baja falló');
if(stat.predFb!==stat.pred)failures.push('Alguna adivinanza no mostró respuesta');
if(stat.chips!==stat.games*8)failures.push('Los logros no son 8 por partida');
if(stat.chat!==stat.games)failures.push('Falta la pregunta para conversar');
failures.forEach(f=>console.log('FALLA:',f));
console.log('ERRORS:',errors.length?errors.slice(0,6):'none');
process.exitCode=(errors.length||failures.length)?1:0;
