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
const pulse=()=>[...d.querySelectorAll('.item.pulse')].map(x=>x.dataset.id).join(',');
tick(3,16);
d.getElementById('adultsBtn').click();const t0=txt('#clock');tick(20,100);console.log('adults open',!d.getElementById('sheet').hidden,'| clock paused',t0===txt('#clock'),'|',txt('#sheetT'));d.getElementById('sheetClose').click();console.log('adults closed',d.getElementById('sheet').hidden);
console.log('intro:',!d.getElementById('overlay').hidden);
console.log('hat shown at start:',d.getElementById('acc-hat').style.display==='','| crown locked:',d.querySelector('[data-act="acc"][data-v="crown"]').disabled,'| glasses:',d.querySelector('[data-act="acc"][data-v="glasses"]').disabled);d.querySelector('[data-act="acc"][data-v="hat"]').click();d.querySelector('[data-act="acc"][data-v="none"]').click();d.querySelector('[data-act="acc"][data-v="hat"]').click();d.querySelector('[data-act="speed"][data-v="calm"]').click();console.log('calm checked',d.querySelector('[data-act="speed"][data-v="calm"]').getAttribute('aria-checked'));
d.getElementById('dictBtn').click();console.log('dict',!d.getElementById('dict').hidden);w.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));console.log('dict closed by esc',d.getElementById('dict').hidden);
d.querySelector('[data-act="color"][data-v="#FF9FC8"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
d.getElementById('nameIn').value='Lola';
d.querySelector('[data-act="start"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
tick(5,100);
console.log('brand',txt('#brand'),'| color var',d.getElementById('stage').style.getPropertyValue('--gluco'));
console.log('say:',txt('#say'),'| pulse',pulse(),'| clock',txt('#clock'));
tick(30,100);console.log('clock stays before food:',txt('#clock'));
d.getElementById('xlBtn').click();tick(2,100);console.log('easy say:',txt('#say'),'| xl',d.getElementById('app').classList.contains('xl'));d.getElementById('xlBtn').click();d.getElementById('next').click();d.getElementById('prev').click();
tap('apple');tick(3,100);console.log('after apple:',txt('#say'),'| pulse',pulse(),'| badge',txt('#keyBadge'));
tap('key');tick(3,100);console.log('after key:',txt('#say'));
tick(60,100);console.log('say later:',txt('#say'),'| clock',txt('#clock'),'| num',txt('#num'));
tap('soda');tap('cake');tick(5,100);tap('key');tap('key');tap('key');tick(5,100);
let guard=0,quiz=0,lows=0;
while(d.getElementById('results').hidden&&guard<12000){
  guard++;
  const ov=d.getElementById('overlay');
  if(!ov.hidden){
    if(ov.textContent.includes('glucosa está baja'))lows++;const ls=[...ov.querySelectorAll('[data-act="lowstep"]:not(:disabled)')].sort((a,b)=>a.dataset.n-b.dataset.n)[0],pr=ov.querySelector('[data-act="pred"]');const q=ov.querySelector('[data-act="qa"]'),n=ov.querySelector('[data-act="qnext"]:not([hidden])')||ov.querySelector('[data-act="evok"]')||ov.querySelector('[data-act="sit"]');
    if(ls||pr){(ls||pr).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));}
    else if(q){quiz++;q.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));}
    else if(n)n.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  }
  const nx=d.querySelector('.item.pulse');
  if(guard%40===0&&nx){tap(nx.dataset.id);}
  tick(1,100);
}
tap('pizza');tap('water');tap('alfajor');console.log('foods ok');
console.log('low cards',lows,'| acc',d.getElementById('acc-hat').style.display===''?'hat':'?','| guard',guard,'clock',txt('#clock'),'quiz',quiz,'results',!d.getElementById('results').hidden);
console.log(txt('#results').slice(0,260));
d.getElementById('pname').value='Sofi';d.getElementById('pname').dispatchEvent(new w.Event('input',{bubbles:true}));console.log('diploma name:',txt('#dname'),'|',txt('#diploma').slice(0,120));
d.getElementById('adultsBtn2').click();console.log('adults from results',!d.getElementById('sheet').hidden);d.getElementById('sheetClose').click();
d.getElementById('again').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));tick(3,100);
d.getElementById('soundBtn').click();console.log('snd',txt('#soundBtn'));tick(5,800);d.getElementById('soundBtn').click();d.getElementById('soundBtn').click();console.log('snd',txt('#soundBtn'));console.log('results hint:',[...d.querySelectorAll('#results .best,#results .hint')].map(x=>x.textContent).join(' || '));console.log('stored:',w.localStorage.getItem('gluco-v1'));
console.log('restart ok:',d.getElementById('results').hidden,txt('#say').slice(0,50));
console.log('ERRORS:',errors.length?errors.slice(0,5):'none');

process.exitCode=errors.length?1:0;
