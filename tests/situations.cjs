const HTML_PATH=process.env.GLUCO_HTML||require('path').join(__dirname,'..','dist','gluco-standalone.dev.html');
const {JSDOM,VirtualConsole}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(HTML_PATH,'utf8');const errors=[];const seen={},trends=new Set();
function game(idx){
  const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(String(e.detail&&e.detail.stack||e.message)));
  let cb=null,n=0;
  const dom=new JSDOM('<body>'+html.replace(/<link[^>]*>/,'')+'</body>',{url:'https://x.test/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.requestAnimationFrame=f=>{cb=f;return 1;};w.matchMedia=()=>({matches:false});w.Element.prototype.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.setTimeout=function(f){try{f();}catch(e){errors.push(e.stack);}return 0;};}});
  const w=dom.window,d=w.document;w.Date.now=()=>n;
  const tick=(k,ms)=>{for(let i=0;i<k;i++){n+=ms;const f=cb;cb=null;f&&f(n);}};
  const click=s=>d.querySelector(s).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  const tap=id=>{d.querySelector('.item[data-id="'+id+'"]').dispatchEvent(new w.MouseEvent('pointerdown',{bubbles:true,clientX:5,clientY:5}));w.dispatchEvent(new w.MouseEvent('pointerup',{bubbles:true,clientX:5,clientY:5}));};
  tick(2,16);click('[data-act=start]');tick(2,100);
  tap('apple');tick(2,100);tap('key');
  let guard=0,log=[],mn=999,mx=0;
  while(d.getElementById('results').hidden&&guard<20000){
    guard++;const ov=d.getElementById('overlay');
    if(!ov.hidden){
      const sits=ov.querySelectorAll('[data-act=sit]');
      if(sits.length){const t=ov.querySelector('h2').textContent;const k=sits[0].dataset.k;const c=sits[idx%sits.length];log.push(k+':'+c.dataset.v);seen[k]=(seen[k]||0)+1;c.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));}
      const ls=[...ov.querySelectorAll('[data-act="lowstep"]:not(:disabled)')].sort((a,b)=>a.dataset.n-b.dataset.n)[0],pr=ov.querySelector('[data-act="pred"]');if(ls||pr){(ls||pr).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));}else{const q=ov.querySelector('[data-act=qa]'),nx=ov.querySelector('[data-act=qnext]:not([hidden])'),ev=ov.querySelector('[data-act=evok]');
        if(q)q.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));else if(nx)nx.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));else if(ev)ev.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));}
    }
    const pu=d.querySelector('.item.pulse');if(pu&&guard%25===0&&d.getElementById('overlay').hidden)tap(pu.dataset.id);
    tick(1,100);const v=+d.getElementById('num').textContent;mn=Math.min(mn,v);mx=Math.max(mx,v);trends.add(d.getElementById('trend').textContent);
  }
  const r=d.getElementById('results').textContent;
  return {log:log.join(' '),meals:(r.match(/Comidas del día: (\d)/)||[])[1],mn,mx,done:!d.getElementById('results').hidden};
}
for(let i=0;i<9;i++){const r=game(i);console.log(i,JSON.stringify(r));}
console.log('seen',JSON.stringify(seen),'| trends',[...trends].join(' , '));
console.log('ERRORS:',errors.length?errors.slice(0,3):'none');

process.exitCode=errors.length?1:0;
