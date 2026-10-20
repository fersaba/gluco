(function(){
'use strict';
var $=function(id){return document.getElementById(id);};
var T0=480,T1=1200,SPEEDS={normal:4,calm:2.5};
var reduce=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
var pet={name:'Gluco',color:'#7DB5FF',acc:'none'};
var easy=false,curSheet=null,sheetOpener=null;

/* ---------- datos guardados (solo en este dispositivo; si el navegador no deja, el juego sigue igual) ---------- */
var KEY='gluco-v1';
function load(){
  try{
    var j=JSON.parse(localStorage.getItem(KEY));
    if(j&&typeof j==='object')return {best:typeof j.best==='number'?j.best:null,me:typeof j.me==='string'?j.me.slice(0,24):'',log:Array.isArray(j.log)?j.log.slice(0,5):[],pn:typeof j.pn==='string'?j.pn.slice(0,12):'',pc:typeof j.pc==='string'?j.pc:'',stars:Number(j.stars)>0?Math.floor(Number(j.stars)):0,acc:typeof j.acc==='string'?j.acc:'none',speed:j.speed==='calm'?'calm':'normal'};
  }catch(e){}
  return {best:null,me:'',log:[],pn:'',pc:'',stars:0,acc:'none',speed:'normal'};
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(DB));}catch(e){}}
var DB=load();
var ACCS=[{id:'none',em:'—',name:'Nada',need:0},{id:'hat',em:'🧢',name:'Gorro',need:3},{id:'glasses',em:'👓',name:'Anteojos',need:6},{id:'crown',em:'👑',name:'Corona',need:10},{id:'bow',em:'🎀',name:'Moño',need:13},{id:'party',em:'🥳',name:'Gorro de fiesta',need:16},{id:'star',em:'⭐',name:'Estrella',need:20}];
var COLORS=[['Azul','#7DB5FF'],['Verde','#7FD9A8'],['Rosa','#FF9FC8'],['Violeta','#B7A6FF'],['Turquesa','#6FD8E0']];

/* ---------- datos ---------- */
/* Cada comida: rise = cuánto sube en total; d = minutos hasta empezar; tp = minutos hasta el pico; dur = duración del efecto. Valores de juego, no clínicos. */
var FOODS={
  water:{em:'💧',rise:0,locks:[],full:0,gi:'none',say:'¡Glup! El agua hidrata y no sube mi glucosa.',short:'¡Glup! Agua fresca.'},
  apple:{em:'🍎',rise:40,d:10,tp:60,dur:150,pk:'45–90 min',du:'2–3 h',locks:[40],full:1,gi:'low',say:'¡Ñam! La fruta hace que la glucosa suba despacito.',short:'¡Ñam! Sube despacito.'},
  banana:{em:'🍌',rise:45,d:10,tp:55,dur:150,pk:'30–90 min',du:'2–3 h',locks:[45],full:1,gi:'med',say:'¡Ñam! La banana sube la glucosa a un ritmo normal. Si está bien madura, sube más rápido.',short:'¡Ñam! Sube normal.'},
  yogurt:{em:'🥣',rise:35,d:15,tp:90,dur:200,pk:'60–120 min',du:'3–4 h',locks:[35],full:1,gi:'low',say:'¡Rico! El yogur con avena sube la glucosa muy despacito.',short:'¡Rico! Sube despacito.'},
  milk:{em:'🥛',rise:55,d:10,tp:65,dur:180,pk:'45–90 min',du:'2–4 h',locks:[55],full:1,gi:'med',say:'¡Rico! La leche con pan integral sube la glucosa a un ritmo normal.',short:'¡Rico! Sube normal.'},
  chicken:{em:'🍗',rise:30,d:30,tp:120,dur:240,pk:'variable',du:'variable',locks:[30],full:2,gi:'low',say:'¡Un plato bien equilibrado! Casi no mueve mi glucosa y sube tarde y despacio.',short:'¡Plato equilibrado!'},
  pasta:{em:'🍝',rise:90,d:15,tp:90,dur:210,pk:'60–120 min',du:'3–4 h',locks:[45,45],full:2,gi:'med',say:'¡Qué rico! Tiene muchos hidratos de carbono: necesito dos llaves.',short:'¡Rico! Necesito dos llaves.'},
  pizza:{em:'🍕',rise:100,d:40,tp:170,dur:330,pk:'90–240 min',du:'4–6 h o más',locks:[50,50],full:2,gi:'late',say:'¡Mmm, pizza! La grasa hace que la glucosa suba más tarde y dure más. Necesito dos llaves.',short:'¡Pizza! Sube tarde y dura.'},
  cookie:{em:'🍪',rise:60,d:5,tp:55,dur:170,pk:'30–90 min',du:'2–4 h',dip:12,locks:[60],full:1,gi:'fast',say:'Las galletitas rellenas son azúcar rápida: la glucosa sube enseguida y después puede bajar de golpe.',short:'¡Azúcar rápida! Sube y baja.'},
  alfajor:{em:'🍫',rise:110,d:10,tp:85,dur:240,pk:'45–120 min',du:'3–5 h',dip:10,locks:[55,55],full:1,gi:'late',say:'¡Dulce de leche! Tiene azúcar y grasa: sube y dura más tiempo.',short:'¡Azúcar y grasa! Dura más.'},
  cake:{em:'🍰',rise:140,d:10,tp:80,dur:240,pk:'45–120 min',du:'3–5 h',dip:18,locks:[70,70],full:2,gi:'med',say:'¡Dulce! El azúcar sube mi glucosa bastante y después puede bajar de golpe.',short:'¡Dulce! Sube y después baja.'},
  soda:{em:'🥤',rise:120,d:0,tp:30,dur:100,pk:'15–45 min',du:'1–2 h',dip:25,locks:[60,60],full:1,gi:'fast',say:'¡Glup! La gaseosa sube la glucosa como un cohete... y después baja rápido.',short:'¡Glup! Cohete: sube y baja.'},
  juice:{em:'🧃',rise:50,d:0,tp:12,dur:45,dip:6,pk:'10–20 min',du:'1 h',locks:[],full:.5,gi:'fast',say:'',short:''},
  sugar:{em:'🍬',rise:30,d:0,tp:10,dur:40,pk:'10–15 min',du:'1 h',locks:[],full:.2,gi:'fast',say:'',short:''}
};
/* La insulina rápida (ilustrativa): empieza a los pocos minutos, su mayor efecto llega después de un par de horas y sigue varias horas. */
var INS={d:25,tp:130,dur:300};
function tri(a,d,tp,dur){if(a<=d||a>=dur)return 0;var h=2/(dur-d);return a<tp?h*(a-d)/(tp-d):h*(dur-a)/(dur-tp);}
function tcdf(a,d,tp,dur){if(a<=d)return 0;if(a>=dur)return 1;var h=2/(dur-d);return a<tp?h*(a-d)*(a-d)/(2*(tp-d)):1-h*(dur-a)*(dur-a)/(2*(dur-tp));}
function bump(a){var u=a/90;return u<=0||u>=1?0:(u<.5?2*u:2*(1-u));}
function newAbs(id,R){var f=FOODS[id];return {id:id,R:R*AMP,d:f.d,tp:f.tp,dur:f.dur,dip:f.dip||0,age:0,dd:0};}
var NAMES={water:'el agua',apple:'la manzana',banana:'la banana',yogurt:'el yogur',milk:'la leche',chicken:'el pollo',pasta:'los fideos',pizza:'la pizza',cookie:'las galletitas',alfajor:'el alfajor',cake:'la torta',soda:'la gaseosa',juice:'el jugo',sugar:'el azúcar',key:'la llave',ball:'la pelota'};
var QUESTIONS=[
  {t:'La diabetes se contagia, como un resfrío.',a:'mito',why:'No se contagia. Podés jugar y abrazar a un amigo que tiene diabetes sin ningún problema.'},
  {t:'Las personas con diabetes pueden jugar a la pelota y hacer deporte.',a:'realidad',why:'Moverse es muy bueno. Solo hay que planificarlo y tener a mano algo para comer por si la glucosa baja.'},
  {t:'La diabetes aparece por comer demasiados dulces.',a:'mito',why:'En la diabetes tipo 1 el cuerpo deja de fabricar insulina, y eso no depende de lo que se comió.'},
  {t:'La insulina es como una llave que deja entrar la glucosa a las células.',a:'realidad',why:'Las células usan la glucosa como energía. Sin la llave, la glucosa se queda en la sangre.'},
  {t:'Una persona con diabetes nunca puede comer nada dulce.',a:'mito',why:'Puede comer algo dulce de vez en cuando, dentro de un plan con su equipo de salud.'},
  {t:'Si la glucosa está baja, hace falta algo dulce enseguida.',a:'realidad',why:'Por ejemplo, un vasito de jugo. Y hay que avisar a un adulto.'},
  {t:'Un té de yuyos puede curar la diabetes.',a:'mito',why:'No hay té mágico. La diabetes se cuida con insulina o medicación, buena comida, movimiento y controles médicos.'},
  {t:'Las niñas y los niños con diabetes tipo 1 no pueden ir a la escuela como los demás.',a:'mito',why:'Pueden estudiar, jugar y hacer deportes igual que sus compañeros. Solo necesitan un plan y adultos que sepan ayudar.'},
  {t:'Medir la glucosa ayuda a saber qué necesita el cuerpo.',a:'realidad',why:'Es una forma de mirar cómo estamos y decidir, junto al equipo de salud, qué hacer.'},
  {t:'Cuando uno se siente bien, puede dejar la insulina.',a:'mito',why:'En la diabetes tipo 1 el cuerpo no fabrica insulina, así que no se deja de usar. Cualquier cambio lo decide el equipo de salud.'},
  {t:'Tomar agua sin azúcar no hace subir la glucosa.',a:'realidad',why:'El agua hidrata y no tiene hidratos de carbono. ¡Es una gran compañera!'},
  {t:'Cuando estoy enfermo, la glucosa puede subir aunque no coma de más.',a:'realidad',why:'El cuerpo trabaja para defenderse y la glucosa puede cambiar. Se toma agua y se avisa a un adulto.'},
  {t:'Estar triste o enojado no tiene nada que ver con la glucosa.',a:'mito',why:'Las emociones fuertes también pueden mover la glucosa. Contar lo que sentimos ayuda.'},
  {t:'Un amigo con diabetes puede compartir la merienda con todos.',a:'realidad',why:'Puede compartir momentos y meriendas. Solo se tiene en cuenta lo que come para cuidar su glucosa.'},
  {t:'Si estás mareado y con sudor frío, lo mejor es seguir jugando.',a:'mito',why:'Hay que parar, tomar algo dulce y avisar a un adulto enseguida.'}
];
var QTIMES=[540,1000],GAP=100;
var AMP=1.3;
var SITS={
  gym:{em:'🏃',t:'¡Hoy hay gimnasia en la escuela!',p:'Voy a correr un buen rato y moverme gasta glucosa. ¿Qué hacemos antes?',o:[['🍎 Comer una fruta antes','fruit'],['🏃 Ir sin comer','go']]},
  bday:{em:'🎂',t:'¡Es el cumpleaños de un amigo!',p:'Hay torta y frutas. ¿Qué elijo?',o:[['🍰 Un trozo de torta','cake'],['🍎 Una fruta','fruit'],['🙅 Solo jugar','none']]},
  sick:{em:'🤧',t:'¡Me resfrié!',p:'Cuando estoy enfermo mi glucosa puede subir aunque no coma de más. ¿Qué hacemos?',o:[['💧 Darme agua','water'],['😶 Seguir como si nada','none']]},
  appetite:{em:'😕',t:'No tengo ganas de comer: estoy lleno.',p:'Ya me pusieron la insulina para esta comida. ¿Qué hacemos?',o:[['🍎 Comer un poquito','small'],['🧃 Tomar jugo','juice'],['🙅 No comer nada','none']]}
};
var SLOT_START=[480,690,900],SLOT_FOOD=['yogurt','chicken','milk'],SLOT_NAME=['el desayuno','el almuerzo','la merienda'];
function slotOf(t){return t<690?0:(t<900?1:2);}
var EVENTS={
  sad:['Hoy no me invitaron a jugar y me quedé solo en el recreo.','Se me rompió mi dibujo favorito.','Extraño mucho a mi abuela.'],
  angry:['Perdí el partido y me dio mucha bronca.','Me retaron por algo que yo no hice.','En el cumpleaños dijeron que yo no podía comer torta y me enojé.']
};

/* ---------- utilidades ---------- */
function zone(g){return g<70?'low':(g>180?'high':'ok');}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function fmt(t){var h=Math.floor(t/60),m=Math.floor(t%60);return h+':'+(m<10?'0':'')+m;}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var x=a[i];a[i]=a[j];a[j]=x;}return a;}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function star(on){return '<svg viewBox="0 0 24 24" class="star'+(on?' on':'')+'" aria-hidden="true"><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1z"/></svg>';}

/* ---------- sonido ---------- */
var audio=null,muted=false;
function tone(f,d,type,v,delay){
  if(muted)return;
  try{
    audio=audio||new (window.AudioContext||window.webkitAudioContext)();
    if(audio.state==='suspended')audio.resume();
    var o=audio.createOscillator(),g=audio.createGain(),t0=audio.currentTime+(delay||0);
    o.type=type||'sine';o.frequency.value=f;
    g.gain.setValueAtTime(v||.07,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+d);
    o.connect(g);g.connect(audio.destination);o.start(t0);o.stop(t0+d+.02);
  }catch(e){}
}
var sfx={
  eat:function(){tone(420,.08,'triangle');tone(560,.08,'triangle',.07,.09);tone(700,.12,'triangle',.07,.18);},
  key:function(){tone(880,.07,'square',.04);tone(1320,.18,'square',.04,.08);},
  good:function(){tone(523,.1,'triangle');tone(659,.1,'triangle',.07,.1);tone(784,.18,'triangle',.07,.2);},
  bad:function(){tone(170,.28,'sawtooth',.05);},
  alert:function(){tone(440,.12,'square',.04);tone(330,.2,'square',.04,.14);}
};

/* ---------- estado ---------- */
var S=null;
function newGame(){
  S={wx:['sun','sun','cloud','rain'][Math.floor(Math.random()*4)],friend:['Tomi','Lupe','Beni','Mía','Nico','Sofi'][Math.floor(Math.random()*6)],idle:0,played:false,hugged:false,rescued:false,predN:0,predOk:0,pred:null,alertHigh:-999,lowI:0,log:[],dips:[],lowShown:false,slots:[false,false,false],emo:null,evCount:0,pendingEmo:'sad',evs:(function(){var sit=['gym','sick','bday'][Math.floor(Math.random()*3)],win={gym:[650,700],sick:[650,700],bday:[960,990]}[sit];return [{k:Math.random()<.5?'sad':'angry',t:Math.round(740+Math.random()*40)},{k:sit,t:Math.round(win[0]+Math.random()*(win[1]-win[0]))}].sort(function(a,b){return a.t-b.t;});})(),evi:0,apt:{t:Math.round(870+Math.random()*30),n:0},nextOk:0,hadSick:false,t:T0,g:115,insL:[],insRem:0,absorb:[],locks:[],full:0,play:0,eatT:0,happyT:0,
     running:false,ended:false,modal:false,since:0,qi:0,qs:shuffle(QUESTIONS).slice(0,2),curQ:null,
     samples:[{t:T0,g:115}],lastSample:T0,zc:{ok:1,low:0,high:0},
     react:null,alertLow:-999,quizOk:0,quizN:0};
}
function locked(){return S.modal||S.ended||!!curSheet;}

var svg=$('gl'),wrap=$('glwrap'),sayEl=$('say'),overlay=$('overlay'),tray=$('tray'),stage=$('stage'),scroller=$('scroller');
var pupL=$('pupL'),pupR=$('pupR'),marker=$('marker'),app=$('app');
var wxEl=$('wx'),foodBar=$('foodBar'),insBar=$('insBar'),doorEl=$('door'),doorTxt=$('doorLocks'),thoughtEl=$('thought'),orb=$('orb'),tint=$('tint'),starsEl=$('starfield'),lastDoor='',lastSky=-1,lastPt=0,ptCount=0,flowTog=false,lastZ='',keyBadge=$('keyBadge'),items=Array.prototype.slice.call(tray.querySelectorAll('.item'));
var trendTxtEl=$('trendTxt'),trendEl=$('trend'),lastTrend='',clockEl=$('clock'),readoutEl=$('readout'),numEl=$('num'),pctEl=$('pct'),sheet=$('sheet');
/* velocidad de subida (índice glucémico simplificado) según el ritmo de absorción de cada comida */
var TREND=[['⇈','sube rápido'],['↗','sube'],['→','estable'],['↘','baja'],['⇊','baja rápido']];
var GI_TXT={none:'No sube',low:'Sube despacio',med:'Sube normal',fast:'Sube rápido',late:'Sube tarde y dura más'};
items.forEach(function(it){
  var f=FOODS[it.getAttribute('data-id')];if(!f)return;
  var k=f.gi||'low';
  var s=document.createElement('i');s.className='dot g-'+k;it.appendChild(s);
  var tip=it.querySelector('.lb').textContent+'. '+GI_TXT[k]+(f.pk?'. Pico: '+f.pk+'. Efecto: '+f.du:'');
  it.setAttribute('aria-label',tip);it.title=tip;
});

var lastFw=-1,lastIw=-1,nxC=null,nxT=0,lastReact=null,curMood='',lastLocks=-1,shown='',lastClock=-1,lastPulse='#',overGl=false;
var lastZone='',lastNum=-1,lastPos='',lastPct='',ptr={x:0,y:0,d:false};

/* ---------- simulador de curvas (ilustrativo) ---------- */
var SIMIDS=['apple','banana','yogurt','milk','chicken','pasta','pizza','cookie','alfajor','cake','soda'],simFood='apple',simIns=false,simBuilt=false;
function simDraw(){
  var box=$('simFoods');
  if(!simBuilt){
    simBuilt=true;
    box.innerHTML=SIMIDS.map(function(id){return '<button type="button" class="opt" role="radio" data-sim="'+id+'" aria-checked="false">'+FOODS[id].em+' '+tray.querySelector('[data-id="'+id+'"] .lb').textContent+'</button>';}).join('');
  }
  Array.prototype.forEach.call(box.children,function(b){b.setAttribute('aria-checked',b.getAttribute('data-sim')===simFood?'true':'false');});
  $('simIns').setAttribute('aria-pressed',simIns?'true':'false');
  var f=FOODS[simFood],V=f.locks.reduce(function(a,b){return a+b;},0);
  var W=480,H=240,L=44,R=12,T=14,B=34,X1=360,y0=40,y1=300;
  function X(t){return L+t/X1*(W-L-R);}
  function Y(g){return T+(1-(clamp(g,y0,y1)-y0)/(y1-y0))*(H-T-B);}
  var pf='',pi='',t,gf,gi;
  for(t=0;t<=X1;t+=5){
    gf=115+f.rise*tcdf(t,f.d,f.tp,f.dur)-(f.dip?f.dip*bump(t-(f.tp+10)):0);
    gi=gf-V*tcdf(t,INS.d,INS.tp,INS.dur);
    pf+=(t?'L':'M')+X(t).toFixed(1)+' '+Y(gf).toFixed(1);pi+=(t?'L':'M')+X(t).toFixed(1)+' '+Y(gi).toFixed(1);
  }
  var s='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Curva ilustrativa de glucosa después de comer '+NAMES[simFood]+(simIns?', con y sin insulina':'')+'">';
  s+='<rect class="band-high" x="'+L+'" y="'+T+'" width="'+(W-L-R)+'" height="'+(Y(180)-T)+'"/><rect class="band-ok" x="'+L+'" y="'+Y(180)+'" width="'+(W-L-R)+'" height="'+(Y(70)-Y(180))+'"/><rect class="band-low" x="'+L+'" y="'+Y(70)+'" width="'+(W-L-R)+'" height="'+(H-B-Y(70))+'"/>';
  [70,180].forEach(function(v){s+='<line class="guide" x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(v)+'" y2="'+Y(v)+'"/><text x="'+(L-6)+'" y="'+(Y(v)+4)+'" text-anchor="end">'+v+'</text>';});
  s+='<line class="axis" x1="'+L+'" x2="'+(W-R)+'" y1="'+(H-B)+'" y2="'+(H-B)+'"/>';
  for(var m=0;m<=X1;m+=60)s+='<line class="tick" x1="'+X(m)+'" x2="'+X(m)+'" y1="'+(H-B)+'" y2="'+(H-B+5)+'"/><text x="'+X(m)+'" y="'+(H-B+21)+'" text-anchor="middle">'+(m/60)+' h</text>';
  s+=simIns?'<path class="fline" d="'+pf+'"/><path class="line" d="'+pi+'"/>':'<path class="line" d="'+pf+'"/>';
  $('simChart').innerHTML=s+'</svg>';
  $('simInfo').textContent=NAMES[simFood].charAt(0).toUpperCase()+NAMES[simFood].slice(1)+': '+GI_TXT[f.gi].toLowerCase()+'. Pico aproximado: '+f.pk+'. Efecto: '+f.du+'.'+(simIns?' La línea punteada es sin insulina; la continua, con insulina rápida ilustrativa.':'');
}
$('simFoods').addEventListener('click',function(e){var b=e.target.closest('[data-sim]');if(b){simFood=b.getAttribute('data-sim');simDraw();}});
$('simIns').addEventListener('click',function(){simIns=!simIns;simDraw();});

/* ---------- escena: cielo, partículas, confeti ---------- */
function emOf(id){var e=tray.querySelector('[data-id="'+id+'"] .em');return e?e.textContent:'';}
function skyAt(t){
  var p=clamp((t-T0)/(T1-T0),0,1),a,c='255,214,120';
  if(t<540)a=.1*(1-(t-T0)/60);else if(t<960)a=0;
  else if(t<1080){c='255,150,70';a=.16*(t-960)/120;}
  else{c='24,34,110';a=.16+.28*(t-1080)/120;}
  tint.style.background='rgb('+c+')';tint.style.opacity=Math.max(0,a).toFixed(3);
  orb.style.left=(22+p*66).toFixed(1)+'%';orb.style.top=(14+64*(1-Math.sin(Math.PI*p))).toFixed(0)+'px';
  orb.textContent=t>=1080?'🌙':'☀️';orb.style.opacity=(S&&S.wx&&S.wx!=='sun')?'.4':'1';
  starsEl.style.opacity=t<1020?'0':Math.min(1,(t-1020)/120).toFixed(2);
}
function confetti(){
  if(reduce||!document.body.animate)return;
  var cols=['#FFC93C','#FF6F83','#2F6BFF','#12975F','#B7A6FF'];
  for(var i=0;i<30;i++){
    (function(){
      var s=document.createElement('i');
      s.style.cssText='position:fixed;left:'+(Math.random()*100)+'vw;top:-20px;width:9px;height:13px;border-radius:2px;pointer-events:none;z-index:80;background:'+cols[Math.floor(Math.random()*cols.length)];
      document.body.appendChild(s);
      var an=s.animate([{transform:'translate(0,0) rotate(0)',opacity:1},{transform:'translate('+((Math.random()-.5)*160)+'px,'+(innerHeight+40)+'px) rotate('+(360+Math.random()*540)+'deg)',opacity:.9}],{duration:1800+Math.random()*1600,delay:Math.random()*500,easing:'ease-in'});
      an.onfinish=function(){if(s.parentNode)s.parentNode.removeChild(s);};
      setTimeout(function(){if(s.parentNode)s.parentNode.removeChild(s);},4200);
    })();
  }
}

/* ---------- Gluco ---------- */
function look(px,py){
  var r=svg.getBoundingClientRect();
  if(!r.width)return;
  var cx=r.left+r.width*.5,cy=r.top+r.height*(114/235);
  var dx=px-cx,dy=py-cy,d=Math.sqrt(dx*dx+dy*dy)||1,k=Math.min(1,d/180)*4.5;
  var tr='translate('+(dx/d*k).toFixed(1)+'px,'+(dy/d*k).toFixed(1)+'px)';
  pupL.style.transform=tr;pupR.style.transform=tr;
}
function say(text,ms,short){S.react={text:text,short:short||text,until:Date.now()+(ms||4500)};}
function mood(){
  if(S.ended)return 'sleep';
  if(S.eatT>0)return 'eat';
  if(overGl)return 'open';
  if(S.g<70)return 'low';
  if(S.emo)return S.emo.k;
  if(S.play>0)return 'play';
  if(S.g>180)return 'high';
  if(S.happyT>0)return 'happy';
  return 'ok';
}
function fx(emoji,n){
  for(var i=0;i<(n||1);i++){
    (function(i){
      var s=document.createElement('span');
      s.className='fx';s.textContent=emoji;
      s.style.left=(25+Math.random()*50)+'%';s.style.top=(30+Math.random()*16)+'%';
      s.style.animationDelay=(i*.12)+'s';
      wrap.appendChild(s);
      setTimeout(function(){if(s.parentNode)s.parentNode.removeChild(s);},1500);
    })(i);
  }
}
/* Qué debería hacer ahora: es el único mensaje fijo */
function nextAction(){
  if(S.ended)return {id:null,msg:'Zzz... ¡Gracias por cuidarme! Buenas noches.',short:'Zzz... ¡Gracias!'};
  if(!S.running)return {id:'apple',msg:'¡Hola! Soy '+pet.name+' y tengo hambre. Arrastrá una comida hasta mí. El día empieza cuando me des de comer.',short:'¡Tengo hambre! Dame de comer.'};
  if(S.g<70)return {id:'juice',msg:'¡Estoy temblando! Mi glucosa está baja. Dame el jugo o un poco de azúcar.',short:'¡Estoy bajo! Jugo o azúcar.'};
  if(S.emo&&S.emo.k==='sick')return {id:'water',msg:'Estoy resfriado y mi glucosa sube. Dame agua y avisá a un adulto.',short:'Estoy enfermo. Dame agua.'};
  if(S.emo)return {id:null,msg:S.emo.k==='sad'?'Estoy triste y mi glucosa se mueve. Tocame para darme un abrazo y escucharme.':'Estoy enojado y mi glucosa se mueve. Tocame para darme un abrazo y calmarme.',short:'Estoy mal. ¡Tocame para un abrazo!'};
  if(S.locks.length&&S.g>180)return {id:null,msg:'Mi glucosa está alta y tengo cerraduras cerradas. La llave 🔑 representa mi insulina; en la vida real la indica el equipo de salud.',short:'Estoy alto y con cerraduras cerradas.'};
  if(S.locks.length)return {id:null,msg:'Tengo cerraduras cerradas. En la vida real, la insulina la indica mi equipo de salud. Acá la llave 🔑 es solo un juego.',short:'Mis cerraduras siguen cerradas.'};
  if(S.g>180)return {id:S.play>0?null:'ball',msg:'Mi glucosa está alta. Un rato de pelota ayuda a bajarla. Si pasa seguido, avisá a un adulto.',short:'Estoy alto. ¡A jugar a la pelota!'};
  var cs=slotOf(S.t);
  var cf=[SLOT_FOOD[cs],'apple','yogurt'].filter(function(x){return S.full+FOODS[x].full<=4.01;})[0];
  if(cf&&!S.slots[cs]&&S.t>=SLOT_START[cs]+45)return {id:cf,msg:'Es hora de '+SLOT_NAME[cs]+'. ¿Me das algo rico? Para tener energía necesito comer.',short:'Es hora de comer.'};
  if(S.since>120)return {id:'milk',msg:'Hace rato que no como. ¿Me das algo rico?',short:'¿Me das algo rico?'};
  var la=S.absorb.filter(function(a){return FOODS[a.id].gi==='late'&&a.age>45;})[0];
  if(la)return {id:null,msg:'Comí '+NAMES[la.id]+' hace un rato. Mi glucosa puede seguir cambiando porque esta comida tiene un efecto prolongado.',short:'Mi comida sigue actuando.'};
  if(S.insRem>8)return {id:null,msg:'La insulina que recibí sigue trabajando. ¡Todavía tiene efecto!',short:'La insulina sigue actuando.'};
  return {id:null,msg:'¡Todo bien! Estoy en la zona verde. Seguí atento a mi nivel.',short:'¡Todo bien! Zona verde.'};
}

/* ---------- acciones ---------- */
function feed(id){
  var f=FOODS[id];
  var rescue=id==='juice'||id==='sugar';
  S.idle=0;
  if(!rescue&&S.full+f.full>4.01){say('¡Uf, estoy llenísimo! Ahora no me entra nada más.',3200,'¡Estoy lleno!');fx('😮‍💨',2);sfx.bad();return false;}
  S.full+=f.full;
  var ab=f.rise>0?newAbs(id,f.rise):null,lk=f.locks,vm='';
  if(id==='banana'){
    if(Math.random()<.5){ab.R=55*AMP;ab.tp=40;ab.dur=140;lk=[55];vm='¡Está bien madura! Sube más rápido.';}
    else{ab.R=36*AMP;ab.tp=75;ab.dur=170;lk=[35];vm='Está verde-amarilla: sube más despacio.';}
  }else if(id==='chicken'){
    if(Math.random()<.5){ab.R=14*AMP;lk=[15];vm='Pollo con ensalada: casi no mueve mi glucosa.';}
    else{ab.R=48*AMP;ab.tp=110;lk=[40];vm='Vino con papas o arroz: ahora sí sube un poco, y tarde.';}
  }
  if(ab)S.absorb.push(ab);
  if(id!=='water')S.log.push({t:S.t,k:'f',id:id});
  if(f.rise>=30&&!rescue)S.slots[slotOf(S.t)]=true;
  lk.forEach(function(v){S.locks.push(v);});
  S.eatT=1.6;S.since=0;S.running=true;
  var msg=f.say,sh=f.short;
  if(id==='water'){
    if(S.g>180){S.g=clamp(S.g-8,35,320);msg='¡Glup! El agua ayuda cuando la glucosa está alta.';sh='¡Glup! Me ayuda.';}
    if(S.emo&&S.emo.k==='sick'){S.emo.left=Math.min(S.emo.left,45);msg='¡Glup! El agua ayuda cuando estoy enfermo. Avisá a un adulto.';sh='¡Glup! Me ayuda. Avisá a un adulto.';}
  }else if(rescue){
    if(S.g<70){msg='¡Eso necesitaba! Lo dulce sube la glucosa rápido.';sh='¡Eso! Lo dulce me sube.';S.happyT=2;}
    else{msg='Ñam... pero no hacía falta: ahora mi glucosa va a subir de más.';sh='¡Ñam! Pero ya estaba bien.';}
  }else if(vm){msg=vm;sh=vm;}
  if(rescue&&S.g<70)S.rescued=true;
  if(f.gi==='fast'||f.gi==='late')fx('😋',2);
  if(!rescue&&S.predN<1&&!S.pred&&S.t>=600&&(f.gi==='fast'||f.gi==='late'||f.gi==='low'))S.pred={t:S.t+15,id:id};
  say(msg,5500,sh);fx(f.em,3);sfx.eat();
  return true;
}
function useKey(){
  S.idle=0;
  if(!S.running){say('Primero dame de comer. La llave se usa después.',3500,'Primero, comida.');sfx.bad();return;}
  if(!S.locks.length){say('No hay nada que abrir. La llave se usa después de comer.',3500,'Nada que abrir.');sfx.bad();return;}
  if(S.g<70){say('Con la glucosa baja no se usa insulina: se toma algo dulce, como jugo o azúcar.',5000,'Estoy bajo: jugo, no llave.');sfx.bad();return;}
  var v=S.locks.shift();S.log.push({t:S.t,k:'k'});
  S.insL.push({v:v,age:0});S.insRem+=v;S.happyT=1.4;
  say(S.locks.length?'¡Clic! Falta abrir una cerradura más.':'¡Clic! La insulina empieza a trabajar, pero tarda un rato en hacer efecto.',5000,S.locks.length?'¡Clic! Falta una.':'¡Clic! Tarda un rato en actuar.');
  sfx.key();fx('🔓',2);
}
function playBall(){
  if(!S.running){say('Primero dame de comer, así tengo energía.',3500,'Primero, comida.');sfx.bad();return;}
  if(S.g<70){say('¡Así no puedo jugar! Primero necesito algo dulce.',4500,'Estoy bajo. No puedo.');sfx.bad();return;}
  if(S.play>0)return;
  S.idle=0;S.played=true;
  S.play=30;
  say('¡A jugar a la pelota! Moverme gasta glucosa y la hace bajar.',4500,'¡A jugar! Bajo la glucosa.');sfx.good();
}
function useItem(id){
  if(!S||locked())return;
  if(S.play>0&&id!=='key'&&id!=='juice'&&id!=='sugar'){say('¡Esperá que termine el partido!',2200,'¡Esperá el partido!');return;}
  if(FOODS[id])feed(id);
  else if(id==='key')useKey();
  else if(id==='ball')playBall();
}

/* ---------- simulación ---------- */
function step(dt){
  var dm=dt*SPEEDS[DB.speed];
  S.t+=dm;S.since+=dm;
  var g=S.g;
  var ab=S.absorb,i,a;
  for(i=ab.length-1;i>=0;i--){
    a=ab[i];g+=a.R*tri(a.age+dm/2,a.d,a.tp,a.dur)*dm;
    if(a.dip&&!a.dd&&a.age>=a.tp+10){a.dd=1;S.dips.push({D:a.dip,age:0});}
    a.age+=dm;
    if(a.age>=a.dur)ab.splice(i,1);
  }
  var dp=S.dips;
  for(i=dp.length-1;i>=0;i--){a=dp[i];g-=a.D*(bump(a.age+dm)-bump(a.age));a.age+=dm;if(a.age>=90)dp.splice(i,1);}
  var il=S.insL,rem=0;
  for(i=il.length-1;i>=0;i--){
    a=il[i];g-=a.v*tri(a.age+dm/2,INS.d,INS.tp,INS.dur)*dm;a.age+=dm;
    if(a.age>=INS.dur)il.splice(i,1);else rem+=a.v*(1-tcdf(a.age,INS.d,INS.tp,INS.dur));
  }
  S.insRem=rem;
  S.full=Math.max(0,S.full-dm*.012);
  if(S.emo){g+=(S.emo.k==='sick'?.3:.45)*dm;S.emo.left-=dm;if(S.emo.left<=0)S.emo=null;}
  if(S.play>0){var p=Math.min(S.play,dm);S.play-=p;g-=1.1*p;}
  if(S.since>150&&g>60)g-=.2*dm;
  S.g=clamp(g,35,320);
  if(S.play>0&&S.g<65){S.play=0;say('Tuve que parar de jugar: mi glucosa bajó mucho.',5000,'Paré: estoy bajo.');}
  while(S.t>=S.lastSample+5){
    S.lastSample+=5;
    S.samples.push({t:S.lastSample,g:S.g});
    S.zc[zone(S.g)]++;
  }
  if(zone(S.g)==='low'&&S.t-S.alertLow>30){S.alertLow=S.t;sfx.alert();}
  if(zone(S.g)==='high'&&S.t-S.alertHigh>90){S.alertHigh=S.t;tone(330,.18,'triangle',.05);}
  if(zone(S.g)==='low'&&!S.lowShown){S.lowShown=true;S.nextOk=S.t+GAP;openLow();return;}
  var calm=S.t>=S.nextOk&&!S.emo&&S.eatT<=0&&S.play<=0&&!(S.react&&Date.now()<S.react.until);
  if(S.evi<S.evs.length&&S.t>=S.evs[S.evi].t&&calm){S.nextOk=S.t+GAP;openEvent();return;}
  if(S.apt&&S.t>=S.apt.t&&calm){
    if(!S.slots[slotOf(S.t)]){S.apt=null;S.nextOk=S.t+GAP;openSit('appetite');return;}
    S.apt=S.apt.n===0?{t:Math.round(1000+Math.random()*30),n:1}:null;
  }
  if(S.pred&&S.t>=S.pred.t&&calm){S.nextOk=S.t+GAP;openPred();return;}
  if(S.qi<S.qs.length&&S.t>=QTIMES[S.qi]&&calm){S.nextOk=S.t+GAP;openQuiz();return;}
  if(S.t>=T1){S.t=T1;finish();}
}

/* ---------- ventanas ---------- */
function showOverlay(html,focusSel){
  overlay.innerHTML=html;overlay.hidden=false;S.modal=true;tray.inert=true;S.react=null;stage.classList.add('ovl');
  var f=focusSel&&overlay.querySelector(focusSel);
  if(f)try{f.focus({preventScroll:true});}catch(e){}
}
function closeOverlay(){stage.classList.remove('ovl');overlay.hidden=true;overlay.innerHTML='';S.modal=false;tray.inert=false;}
function openIntro(){
  showOverlay('<div class="ocard"><h2>¡Hola! Soy '+esc(pet.name)+'</h2><p>Tengo diabetes. Hoy me ayudás a cuidar mi día, de 8 a 20 horas.</p>'+
  '<ol class="how"><li><span class="n">🍎</span><span><b>Dame de comer.</b></span></li>'+
  '<li><span class="n">🔑</span><span><b>La llave 🔑</b> abre mis cerraduras.</span></li>'+
  '<li><span class="n">🟢</span><span><b>Cuidá mi nivel:</b> que coma a lo largo del día y pase el 70% en la zona verde.</span></li></ol>'+
  '<button class="btn sun" type="button" data-act="start">¡Vamos!</button>'+
  (DB.best!==null?'<p class="best">🏆 Tu mejor día: '+Number(DB.best)+'% en zona verde</p>':'')+
  '<p class="small">Es un juego: la insulina real y su dosis las indica siempre el equipo de salud.</p>'+
  '<details class="cust"><summary>🎨 Personalizar a '+esc(pet.name)+'</summary>'+
  '<div class="field"><label class="lab" for="nameIn">¿Cómo me llamo?</label><input type="text" id="nameIn" maxlength="12" value="'+esc(pet.name)+'" autocomplete="off"></div>'+
  '<div class="field"><span class="lab" id="colLab">¿De qué color soy?</span><div class="swatches" role="radiogroup" aria-labelledby="colLab">'+
  COLORS.map(function(c){return '<button type="button" class="sw" role="radio" aria-checked="'+(c[1]===pet.color)+'" aria-label="'+c[0]+'" data-act="color" data-v="'+c[1]+'" style="--c:'+c[1]+'"></button>';}).join('')+
  '</div></div>'+
  '<div class="field"><span class="lab" id="accLab">¿Qué me pongo? <small>(se gana con estrellas: tenés '+DB.stars+' ⭐)</small></span><div class="opts" role="radiogroup" aria-labelledby="accLab">'+
  ACCS.map(function(a){var ok=DB.stars>=a.need;return '<button type="button" class="opt" role="radio" data-act="acc" data-v="'+a.id+'" aria-checked="'+(a.id===pet.acc)+'"'+(ok?'':' disabled')+'>'+(ok?a.em+' '+a.name:'🔒 '+a.need+' ⭐')+'</button>';}).join('')+
  '</div></div>'+
  '<div class="field"><span class="lab" id="spLab">¿Qué ritmo?</span><div class="opts" role="radiogroup" aria-labelledby="spLab">'+
  '<button type="button" class="opt" role="radio" data-act="speed" data-v="calm" aria-checked="'+(DB.speed==='calm')+'">🐢 Tranquilo</button>'+
  '<button type="button" class="opt" role="radio" data-act="speed" data-v="normal" aria-checked="'+(DB.speed==='normal')+'">🐇 Normal</button></div></div>'+
  '</details></div>','[data-act="start"]');
}
var LOWSTEPS=[['✋','Parar lo que estoy haciendo'],['🧑‍🧒','Avisar a un adulto'],['🧃','Tomar algo dulce, como jugo o azúcar'],['⏱️','Esperar y volver a mirar mi nivel']];
function openLow(){
  S.lowI=0;
  var order=shuffle([0,1,2,3]);
  showOverlay('<div class="ocard"><p class="eyebrow">¡Atención!</p><h2>Mi glucosa está baja</h2><p id="lowHint">¿En qué orden lo hacemos? Tocá los pasos, de a uno.</p><div class="col" id="lowSteps">'+
    order.map(function(n){return '<button class="btn alt lowstep" type="button" data-act="lowstep" data-n="'+(n+1)+'"><span>'+LOWSTEPS[n][0]+'</span><span>'+LOWSTEPS[n][1]+'</span></button>';}).join('')+
    '</div><button class="btn sun" type="button" data-act="qnext" id="lowGo" hidden>¡Entendido!</button></div>','[data-act="lowstep"]');
}
function lowStep(b){
  var n=+b.getAttribute('data-n');
  if(n===S.lowI+1){
    S.lowI++;b.classList.add('done');b.disabled=true;b.firstChild.textContent='✅';sfx.good();
    $('lowHint').textContent=S.lowI<4?'¡Bien! ¿Y después?':'¡Eso es! Ahora ayudame con lo que necesito.';
    if(S.lowI===4){var g=$('lowGo');g.hidden=false;try{g.focus({preventScroll:true});}catch(e){}}
  }else{
    b.classList.remove('bad');void b.offsetWidth;b.classList.add('bad');sfx.bad();
    $('lowHint').textContent='Casi. Primero va: '+LOWSTEPS[S.lowI][1].toLowerCase()+'.';
  }
}
function openSit(k){
  var s=SITS[k];
  showOverlay('<div class="ocard"><p class="eyebrow">'+esc(pet.name)+' te cuenta</p><h2>'+s.em+' '+s.t+'</h2><p>'+s.p+'</p><div class="col">'+
    s.o.map(function(o){return '<button class="btn alt" type="button" data-act="sit" data-k="'+k+'" data-v="'+o[1]+'">'+o[0]+'</button>';}).join('')+'</div></div>','[data-act="sit"]');
}
function sitChoice(k,v){
  var said=function(m,s){say(m,6500,s);};
  if(k==='gym'){
    if(v==='fruit'){if(feed('apple'))said('¡Bien pensado! Con una fruta antes de correr tengo energía. '+S.friend+' viene conmigo. Corriendo gasto glucosa: ¡atento a mi nivel!','¡Bien! Fruta antes de correr.');}
    else said('Voy a correr sin comer: gasto glucosa y puedo bajar. '+S.friend+' me espera. ¡Atento a mi nivel!','¡Atento! Puedo bajar.');
    S.play=45;S.played=true;fx('🧒',2);
  }else if(k==='bday'){
    if(v==='cake'){if(feed('cake'))said(S.friend+' me convida torta. Una vez en cuando se puede, siempre con el plan del equipo de salud.','¡Rico! Una vez en cuando.');}
    else if(v==='fruit'){if(feed('apple'))said('¡Buena elección! La fruta sube la glucosa despacito.','¡Bien! Fruta: sube despacito.');}
    else said('¡A jugar con '+S.friend+' y mis amigos! No hace falta comer todo lo que hay en la fiesta.','¡A jugar con mis amigos!');
  }else if(k==='sick'){
    S.emo={k:'sick',left:v==='water'?60:120};S.hadSick=true;
    if(v==='water'){if(feed('water'))said('El agua ayuda cuando estoy enfermo. Y hay que avisar a un adulto.','¡Glup! Avisá a un adulto.');}
    else said('Cuando estoy enfermo mi glucosa sube. ¡Hay que avisar a un adulto y tomar agua!','Estoy enfermo. ¡Avisá a un adulto!');
  }else if(k==='appetite'){
    S.insL.push({v:50,age:0});S.insRem+=50;
    if(v==='small'){S.absorb.push(newAbs('apple',45));S.slots[slotOf(S.t)]=true;S.eatT=1.6;S.since=0;fx('🍎',3);sfx.eat();said('¡Bien! Un poquito alcanza para acompañar mi insulina. Si cuesta comer, se avisa a un adulto.','¡Bien! Un poquito alcanza.');}
    else if(v==='juice'){S.absorb.push(newAbs('juice',50));S.eatT=1.6;S.since=0;fx('🧃',3);sfx.eat();said('El jugo sube rápido y sirve, pero dura poco. ¡Mirá mi nivel!','El jugo sirve, pero dura poco.');}
    else said('Con la llave abierta y sin comer mi glucosa puede bajar. ¡Atento a mi nivel!','¡Atento! Puedo bajar.');
  }
}
function openEvent(){
  var e=S.evs[S.evi];S.evi++;
  if(!EVENTS[e.k]){openSit(e.k);return;}
  S.pendingEmo=e.k;
  var story=EVENTS[e.k][Math.floor(Math.random()*EVENTS[e.k].length)];
  showOverlay('<div class="ocard"><p class="eyebrow">'+esc(pet.name)+' te cuenta</p><h2>'+(e.k==='sad'?'😢 ':'😠 ')+story+'</h2><p>'+(e.k==='sad'?'Se siente triste.':'Está enojado.')+' Las emociones fuertes también pueden mover la glucosa.</p><button class="btn sun" type="button" data-act="evok">Escucharlo 👂</button></div>','[data-act="evok"]');
}
function openQuiz(){
  var q=S.qs[S.qi];S.qi++;S.quizN++;S.curQ=q;
  showOverlay('<div class="ocard"><p class="eyebrow">'+esc(pet.name)+' pregunta · '+S.qi+' de '+S.qs.length+'</p><h2>'+q.t+'</h2>'+
  '<div class="answers"><button class="big mito" type="button" data-act="qa" data-v="mito">✕ Mito</button><button class="big real" type="button" data-act="qa" data-v="realidad">✓ Realidad</button></div></div>','[data-act="qa"]');
}
var PREDWHY={fast:'El azúcar rápida hace que la glucosa suba enseguida y después puede bajar de golpe.',late:'La grasa hace que la glucosa suba más tarde y dure más tiempo.',slow:'La fruta, la fibra y la proteína hacen que la glucosa suba de a poco.'};
var PRED={fast:'⚡ Sube rápido y después puede bajar',late:'🐢 Sube más tarde y dura más',slow:'🌱 Sube despacito'};
function openPred(){
  var id=S.pred.id,f=FOODS[id];S.predN++;
  showOverlay('<div class="ocard"><p class="eyebrow">'+esc(pet.name)+' pregunta</p><h2>'+f.em+' Comí '+NAMES[id]+'. ¿Qué creés que va a pasar con mi glucosa?</h2><div class="col">'+
    ['fast','late','slow'].map(function(k){return '<button class="btn alt" type="button" data-act="pred" data-v="'+k+'">'+PRED[k]+'</button>';}).join('')+'</div></div>','[data-act="pred"]');
}
function answerPred(v){
  var id=S.pred.id,gi=FOODS[id].gi,exp=gi==='fast'?'fast':(gi==='late'?'late':'slow'),ok=v===exp;
  if(ok){S.predOk++;S.happyT=2.5;sfx.good();}else sfx.bad();
  S.pred=null;
  overlay.innerHTML='<div class="ocard"><div class="fb '+(ok?'fb-ok':'')+'"><strong>'+(ok?'¡Acertaste!':'Casi.')+' '+PRED[exp]+'.</strong><p>'+PREDWHY[exp]+'</p></div><button class="btn" type="button" data-act="qnext">Seguir jugando</button></div>';
  var nb=overlay.querySelector('[data-act="qnext"]');if(nb)try{nb.focus({preventScroll:true});}catch(e){}
}
function answerQuiz(v){
  var q=S.curQ,ok=v===q.a;
  if(ok){S.quizOk++;S.happyT=2.5;sfx.good();}else sfx.bad();
  overlay.innerHTML='<div class="ocard"><div class="fb '+(ok?'fb-ok':'')+'"><strong>'+(ok?'¡Bien, lo sabías!':'Casi.')+' Es '+(q.a==='mito'?'un mito.':'una realidad.')+'</strong><p>'+q.why+'</p></div><button class="btn" type="button" data-act="qnext">Seguir →</button></div>';
  var nb=overlay.querySelector('[data-act="qnext"]');
  if(nb)try{nb.focus({preventScroll:true});}catch(e){}
}
function pick(act,v){
  Array.prototype.forEach.call(overlay.querySelectorAll('[data-act="'+act+'"]'),function(b){b.setAttribute('aria-checked',b.getAttribute('data-v')===v?'true':'false');});
}
function setColor(c){pet.color=c;stage.style.setProperty('--gluco',c);pick('color',c);}
function setAcc(id){
  pet.acc=id;
  ACCS.forEach(function(a){var g=$('acc-'+a.id);if(g)g.style.display=a.id===id?'':'none';});
  pick('acc',id);
}
overlay.addEventListener('click',function(e){
  var b=e.target.closest('[data-act]');if(!b)return;
  var a=b.getAttribute('data-act');
  if(a==='color'){setColor(b.getAttribute('data-v'));}
  else if(a==='acc'){setAcc(b.getAttribute('data-v'));}
  else if(a==='speed'){DB.speed=b.getAttribute('data-v')==='calm'?'calm':'normal';pick('speed',DB.speed);save();}
  else if(a==='start'){
    var n=$('nameIn');
    pet.name=((n&&n.value)||'').trim().slice(0,12)||'Gluco';
    $('brand').textContent='El Día de '+pet.name;
    DB.acc=pet.acc;DB.pn=pet.name;DB.pc=pet.color;save();
    closeOverlay();sfx.good();
  }
  else if(a==='qa'){answerQuiz(b.getAttribute('data-v'));}
  else if(a==='lowstep'){lowStep(b);}
  else if(a==='pred'){answerPred(b.getAttribute('data-v'));}
  else if(a==='qnext'){closeOverlay();}
  else if(a==='sit'){closeOverlay();sitChoice(b.getAttribute('data-k'),b.getAttribute('data-v'));}
  else if(a==='evok'){closeOverlay();S.emo={k:S.pendingEmo,left:90};S.evCount++;}
});
var SND=[['🔊','Efectos activados. Tocá para activar la música','Efectos'],['🎵','Música y efectos activados. Tocá para apagar todo','Música'],['🔇','Sonido apagado. Tocá para activar los efectos','Silencio']],sndI=0,music=false,mNext=0,mi=0;
var NOTES=[392,440,523,587,659,784],MEL=[2,4,3,1,2,0,1,3];
$('soundBtn').addEventListener('click',function(){
  sndI=(sndI+1)%3;muted=sndI===2;music=sndI===1;
  this.textContent=SND[sndI][0]+' '+SND[sndI][2];this.setAttribute('aria-label',SND[sndI][1]);
});
$('xlBtn').addEventListener('click',function(){
  easy=!easy;app.classList.toggle('xl',easy);this.setAttribute('aria-pressed',easy?'true':'false');
  shown='';
});
function openSheet(el,from){
  if(curSheet)return;
  curSheet=el;sheetOpener=from||null;el.hidden=false;el.scrollTop=0;
  try{el.querySelector('[data-close]').focus({preventScroll:true});}catch(e){}
}
function closeSheet(){
  if(!curSheet)return;
  curSheet.hidden=true;curSheet=null;
  try{if(sheetOpener)sheetOpener.focus({preventScroll:true});}catch(e){}
}
$('adultsBtn').addEventListener('click',function(){openSheet(sheet,$('menuBtn'));});
$('simBtn').addEventListener('click',function(){openSheet($('sim'),$('menuBtn'));simDraw();});
$('dictBtn').addEventListener('click',function(){openSheet($('dict'),$('menuBtn'));});
var menu=$('menu'),menuBtn=$('menuBtn');
function setMenu(on){menu.hidden=!on;menuBtn.setAttribute('aria-expanded',on?'true':'false');}
menuBtn.addEventListener('click',function(e){e.stopPropagation();setMenu(menu.hidden);});
menu.addEventListener('click',function(e){if(e.target.closest('button'))setMenu(false);});
document.addEventListener('click',function(e){if(!menu.hidden&&!e.target.closest('.menuwrap'))setMenu(false);});
[sheet,$('dict'),$('sim')].forEach(function(el){
  el.addEventListener('click',function(e){if(e.target===el||e.target.closest('[data-close]'))closeSheet();});
});
window.addEventListener('keydown',function(e){if(e.key==='Escape'){setMenu(false);closeSheet();}});
function slide(dir){try{scroller.scrollBy({left:dir*280,behavior:'smooth'});}catch(e){}}
$('prev').addEventListener('click',function(){slide(-1);});
$('next').addEventListener('click',function(){slide(1);});
function focusItem(id){
  var it=scroller.querySelector('[data-id="'+id+'"]');
  if(!it)return;
  try{scroller.scrollTo({left:it.offsetLeft-(scroller.clientWidth-it.offsetWidth)/2,behavior:reduce?'auto':'smooth'});}catch(e){}
}

/* ---------- arrastrar ---------- */
var drag=null,ghost=null;
function overGluco(x,y){var r=wrap.getBoundingClientRect(),m=16;return x>r.left-m&&x<r.right+m&&y>r.top-m&&y<r.bottom+m;}
function makeGhost(){ghost=document.createElement('div');ghost.className='ghost';ghost.innerHTML=drag.it.querySelector('.em').innerHTML;document.body.appendChild(ghost);}
function killGhost(g){if(g&&g.parentNode)g.parentNode.removeChild(g);}
function flyIn(g){
  if(!g)return;
  if(reduce||!g.animate){killGhost(g);return;}
  var r=svg.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height*(152/235);
  var an=g.animate([{transform:g.style.transform+' scale(1)',opacity:1},{transform:'translate('+(x-26)+'px,'+(y-32)+'px) scale(.2)',opacity:.2}],{duration:240,easing:'ease-in'});
  an.onfinish=function(){killGhost(g);};
  setTimeout(function(){killGhost(g);},600);
}
tray.addEventListener('pointerdown',function(e){
  var it=e.target.closest('.item');
  if(!it||(e.button&&e.button>0))return;
  drag={id:it.getAttribute('data-id'),it:it,x:e.clientX,y:e.clientY,moved:false,pid:e.pointerId};
  try{it.setPointerCapture(e.pointerId);}catch(_){}
});
window.addEventListener('pointermove',function(e){
  ptr.x=e.clientX;ptr.y=e.clientY;ptr.d=true;
  if(!drag||e.pointerId!==drag.pid)return;
  if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8){drag.moved=true;makeGhost();}
  if(drag.moved&&ghost){
    ghost.style.transform='translate('+(e.clientX-26)+'px,'+(e.clientY-32)+'px)';
    var o=overGluco(e.clientX,e.clientY);
    wrap.classList.toggle('hover',o);
    overGl=o&&!!FOODS[drag.id]&&!locked();
  }
});
function endDrag(e,cancel){
  if(!drag)return;
  var d=drag;drag=null;var gh=ghost;ghost=null;
  wrap.classList.remove('hover');overGl=false;
  if(cancel){killGhost(gh);return;}
  if(d.moved&&overGluco(e.clientX,e.clientY)&&FOODS[d.id]&&S&&!locked())flyIn(gh);else killGhost(gh);
  if(!d.moved||overGluco(e.clientX,e.clientY))useItem(d.id);
  else if(S&&!locked())say('¡Casi! Arrastrá '+NAMES[d.id]+' hasta mí.',2600,'¡Casi! Llevalo hasta mí.');
}
window.addEventListener('pointerup',function(e){if(drag&&e.pointerId===drag.pid)endDrag(e,false);});
window.addEventListener('blur',function(){endDrag(null,true);});
window.addEventListener('pointercancel',function(e){if(drag&&e.pointerId===drag.pid)endDrag(e,true);});
tray.addEventListener('click',function(e){
  if(e.detail!==0)return;
  var it=e.target.closest('.item');if(it)useItem(it.getAttribute('data-id'));
});
tray.addEventListener('contextmenu',function(e){e.preventDefault();});
svg.addEventListener('click',function(){
  if(!S||locked())return;
  if(S.emo&&S.emo.k==='sick'){say('Me siento mal. Dame agua y avisá a un adulto.',3500,'Estoy mal. Agua, por favor.');return;}
  S.idle=0;
  if(S.emo){S.emo=null;S.hugged=true;S.happyT=2.5;fx('🤗',3);sfx.good();say('Gracias por escucharme. ¡Ya me siento mejor!',4500,'¡Gracias! Me siento mejor.');return;}
  if(S.running){var w=why();if(w){S.happyT=1.2;fx('💙',2);tone(700,.08,'triangle');say(w[0],6000,w[1]);return;}}
  S.happyT=1.2;fx('💙',2);tone(700,.08,'triangle');
  say(['¡Jiji, me hacés cosquillas!','¡Hola, amigo!','¡Qué lindo día!'][Math.floor(Math.random()*3)],2400);
});

/* ¿Por qué mi glucosa cambia? */
function why(){
  var la=S.absorb.filter(function(a){return a.age>=a.d&&a.id!=='water';}).sort(function(a,b){return a.age-b.age;})[0];
  if(S.g<70)return ['Estoy bajo. Puede pasar si la insulina sigue trabajando y hace rato que no como o me muevo. Necesito algo dulce.','Estoy bajo: algo dulce.'];
  if(la&&la.age<la.tp)return ['Comí '+NAMES[la.id]+' y mi glucosa está subiendo. '+GI_TXT[FOODS[la.id].gi]+'.','Estoy subiendo por la comida.'];
  if(la)return ['Ya pasó lo más fuerte de '+NAMES[la.id]+', pero todavía sigue actuando un rato.','Mi comida sigue actuando.'];
  if(S.insRem>8)return ['La insulina que recibí sigue trabajando. Por eso mi glucosa puede ir bajando de a poco.','La insulina sigue actuando.'];
  if(S.since>120)return ['Hace rato que no como, por eso mi glucosa va bajando de a poco.','Hace rato que no como.'];
  return null;
}

/* ---------- interfaz ---------- */
function ui(){
  var m=mood();
  if(ptr.d){ptr.d=false;look(ptr.x,ptr.y);}
  if(m!==curMood){svg.setAttribute('class','m-'+m);wrap.classList.toggle('playing',m==='play');wrap.classList.toggle('need',m==='sad'||m==='angry');curMood=m;}
  var mi=Math.floor(Math.min(S.t,T1));
  if(mi!==lastClock){clockEl.textContent=(S.t>=1080?'🌙 ':'☀️ ')+fmt(mi);lastClock=mi;}
  var pos=((clamp(S.g,40,300)-40)/260*100).toFixed(1)+'%';
  if(pos!==lastPos){marker.style.bottom=pos;lastPos=pos;}
  var z=zone(S.g);
  if(z!==lastZone){lastZone=z;marker.className='marker z-'+z;readoutEl.className='readout z-'+z;}
  if(z!==lastZ){if(z==='ok'&&lastZ&&S.running&&!S.ended)fx('⭐',4);lastZ=z;}
  var sk=Math.floor(S.t/3);
  if(sk!==lastSky){lastSky=sk;skyAt(S.t);}
  var rn=Math.round(S.g);
  if(rn!==lastNum){lastNum=rn;numEl.textContent=rn;}
  var ti=2;
  if(S.running){var sm=S.samples,dv=S.g-sm[Math.max(0,sm.length-4)].g;ti=dv>30?0:(dv>10?1:(dv<-30?4:(dv<-10?3:2)));}
  if(ti!==lastTrend){lastTrend=ti;trendEl.textContent=TREND[ti][0];trendTxtEl.textContent=TREND[ti][1];readoutEl.classList.remove('tr-up','tr-down','tr-flat');readoutEl.classList.add(ti<2?'tr-up':(ti>2?'tr-down':'tr-flat'));trendEl.setAttribute('aria-label','Tendencia: '+TREND[ti][1]);trendEl.title=TREND[ti][1];}
  if(S.locks.length!==lastLocks){
    lastLocks=S.locks.length;
    doorTxt.textContent=lastLocks?'🔒'+(lastLocks>1?'×'+lastLocks:''):'';
    keyBadge.textContent=lastLocks;keyBadge.classList.toggle('on',lastLocks>0);
  }
  if(wxEl.getAttribute('data-w')!==S.wx){wxEl.setAttribute('data-w',S.wx);wxEl.className='wx '+(S.wx==='sun'?'':S.wx);}
  var fr=0;S.absorb.forEach(function(a){fr+=a.R*(1-tcdf(a.age,a.d,a.tp,a.dur));});
  var fw=Math.round(Math.min(100,fr/1.8)),iw=Math.round(Math.min(100,S.insRem/1.2));
  if(fw!==lastFw){lastFw=fw;foodBar.style.setProperty('--w',fw+'%');foodBar.parentNode.classList.toggle('on',fw>0);}
  if(iw!==lastIw){lastIw=iw;insBar.style.setProperty('--w',iw+'%');insBar.parentNode.classList.toggle('on',iw>0);}
  var ds=S.locks.length?'shut':(S.insRem>2?'open':'');
  if(ds!==lastDoor){lastDoor=ds;doorEl.setAttribute('class','door'+(ds?' '+ds:''));}
  var nowMs=Date.now();
  if(!nxC||nowMs-nxT>150||S.react!==lastReact){nxC=nextAction();nxT=nowMs;lastReact=S.react;}
  var nx=nxC,live=S.react&&Date.now()<S.react.until;
  var txt=live?(easy?S.react.short:S.react.text):(easy?nx.short:nx.msg);
  if(txt!==shown){shown=txt;sayEl.textContent=txt;sayEl.classList.remove('pop');void sayEl.offsetWidth;sayEl.classList.add('pop');}
  var pid=locked()?null:nx.id;
  if(pid!==lastPulse){
    lastPulse=pid;
    items.forEach(function(it){it.classList.toggle('pulse',it.getAttribute('data-id')===pid);});
    if(pid&&!drag)focusItem(pid);
    thoughtEl.hidden=!pid;thoughtEl.textContent=pid?emOf(pid):'';
  }
  if(S.running){
    var mc=(S.slots[0]?1:0)+(S.slots[1]?1:0)+(S.slots[2]?1:0);
    var tot=S.zc.ok+S.zc.low+S.zc.high,pc='🍽️ '+mc+' · 🟢 '+Math.round(S.zc.ok/tot*100)+'%';
    if(pc!==lastPct){lastPct=pc;pctEl.textContent=pc;pctEl.hidden=false;}
  }
}

/* ---------- final ---------- */
function resChart(){
  var W=480,H=240,L=44,R=12,T=14,B=34,x0=T0,x1=T1,y0=40,y1=320;
  function X(t){return L+(t-x0)/(x1-x0)*(W-L-R);}
  function Y(g){return T+(1-(clamp(g,y0,y1)-y0)/(y1-y0))*(H-T-B);}
  var smp=S.samples,mx=smp[0],mn=smp[0];
  smp.forEach(function(p){if(p.g>mx.g)mx=p;if(p.g<mn.g)mn=p;});
  var alt='Curva de glucosa del día. Máximo '+Math.round(mx.g)+'. Mínimo '+Math.round(mn.g)+'.';
  var s='<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+alt+'">';
  s+='<rect class="band-high" x="'+L+'" y="'+T+'" width="'+(W-L-R)+'" height="'+(Y(180)-T)+'"/>';
  s+='<rect class="band-ok" x="'+L+'" y="'+Y(180)+'" width="'+(W-L-R)+'" height="'+(Y(70)-Y(180))+'"/>';
  s+='<rect class="band-low" x="'+L+'" y="'+Y(70)+'" width="'+(W-L-R)+'" height="'+(H-B-Y(70))+'"/>';
  [70,180].forEach(function(v){s+='<line class="guide" x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(v)+'" y2="'+Y(v)+'"/><text x="'+(L-6)+'" y="'+(Y(v)+4)+'" text-anchor="end">'+v+'</text>';});
  s+='<line class="axis" x1="'+L+'" x2="'+(W-R)+'" y1="'+(H-B)+'" y2="'+(H-B)+'"/>';
  for(var h=8;h<=20;h+=2){s+='<line class="tick" x1="'+X(h*60)+'" x2="'+X(h*60)+'" y1="'+(H-B)+'" y2="'+(H-B+5)+'"/><text x="'+X(h*60)+'" y="'+(H-B+21)+'" text-anchor="middle">'+h+':00</text>';}
  var d='';smp.forEach(function(p,k){d+=(k?'L':'M')+X(p.t).toFixed(1)+' '+Y(p.g).toFixed(1);});
  S.log.forEach(function(e,k){var x=X(e.t),y=T+11+(k%2)*13;s+='<line class="tick" x1="'+x+'" x2="'+x+'" y1="'+(T+14)+'" y2="'+(H-B)+'" stroke-dasharray="2 3"/><text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="12">'+(e.k==='k'?'🔑':FOODS[e.id].em)+'</text>';});
  return s+'<path class="line" d="'+d+'"/></svg>';
}
function today(){
  try{return new Date().toLocaleDateString('es-UY',{day:'numeric',month:'long',year:'numeric'});}catch(e){return '';}
}
function whatHappened(){
  var smp=S.samples,mx=smp[0],mn=smp[0],out=[];
  smp.forEach(function(p){if(p.g>mx.g)mx=p;if(p.g<mn.g)mn=p;});
  function before(t){var f=null;S.log.forEach(function(e){if(e.k==='f'&&e.t<=t&&t-e.t<=300)f=e;});return f;}
  var f1=before(mx.t);
  if(mx.g>180)out.push('⬆️ Mi punto más alto fue '+Math.round(mx.g)+' a las '+fmt(mx.t)+(f1?', después de comer '+NAMES[f1.id]+'.'+(FOODS[f1.id].gi==='late'?' Esa comida sube tarde y dura más.':(FOODS[f1.id].gi==='fast'?' Esa comida sube rápido.':'')):'.'));
  else out.push('⬆️ Mi punto más alto fue '+Math.round(mx.g)+' a las '+fmt(mx.t)+': me mantuve en la zona verde.');
  if(mn.g<70){var f2=before(mn.t);out.push('⬇️ Bajé a '+Math.round(mn.g)+' a las '+fmt(mn.t)+(S.log.some(function(e){return e.k==='k'&&e.t<mn.t&&mn.t-e.t<300;})?': la insulina seguía trabajando.':'.')+' Una glucosa baja se corrige con algo dulce.');}
  else if(S.log.some(function(e){return e.k==='k';}))out.push('🔑 La insulina no baja la glucosa de golpe: tarda en actuar y sigue trabajando varias horas.');
  return out;
}
function achievements(pct,meals){
  var A=[['🛡️','Día sin bajones',S.zc.low===0],['🍽️','Comí a lo largo del día',meals===3],['🟢','Casi todo en verde',pct>=85],['🧃','Rescaté un bajo con algo dulce',S.rescued],['🤗','Buen amigo: escuché a Gluco',S.hugged],['⚽','Gran deportista',S.played],['🔮','Adivino de curvas',S.predN>0&&S.predOk===S.predN],['🧠','Sabelotodo',S.quizN>0&&S.quizOk===S.quizN]];
  return A;
}
function chatQ(){
  var q=[];
  if(S.zc.low>0)q.push('¿Qué hiciste cuando Gluco estaba bajo? ¿Qué le diría un adulto?');
  if(S.evCount)q.push('¿Cuándo te sentís triste o enojado? ¿Qué te ayuda a sentirte mejor?');
  if(S.hadSick)q.push('¿Qué hacemos en casa cuando alguien está resfriado?');
  if(S.zc.high>S.zc.ok*.3)q.push('¿Qué comida hizo subir más a Gluco? ¿Qué otra podría elegir?');
  if(S.played)q.push('¿Qué te gusta jugar? ¿Qué conviene tener a mano cuando hacemos deporte?');
  q.push('¿Qué fue lo más difícil de cuidar a Gluco hoy?');
  return q[Math.floor(Math.random()*q.length)];
}
function finish(){
  S.ended=true;
  var tot=S.zc.ok+S.zc.low+S.zc.high,pct=Math.round(S.zc.ok/tot*100);
  var meals=(S.slots[0]?1:0)+(S.slots[1]?1:0)+(S.slots[2]?1:0);
  var stars=pct>=75?3:(pct>=50?2:1);
  if(meals<3)stars=Math.min(stars,meals>=2?2:1);
  var nm=esc(pet.name);
  var head=stars===3?'¡Equilibrio total!':(stars===2?'¡Muy bien!':'Un día movido');
  var txt=stars===3?'Mi glucosa estuvo casi todo el día en la zona verde. ¡Me cuidaste genial!':(stars===2?'Hubo algunos momentos fuera de la zona verde, pero aprendiste a corregirlos.':'Hoy mi glucosa subió y bajó bastante. Probá de nuevo y mirá cómo cambia la curva.');
  var tips=['La insulina es la llave que deja entrar la glucosa a las células.'];
  if(S.zc.high>S.zc.ok*.3)tips.push('La gaseosa y la torta hacen que la glucosa suba de golpe.');
  else tips.push('La fruta y el pan integral hacen que la glucosa suba de a poco.');
  if(S.hadSick)tips.push('Cuando estamos enfermos la glucosa puede subir: se toma agua y se avisa a un adulto.');
  if(S.evCount)tips.push('La tristeza y el enojo también pueden mover la glucosa. Contarlo y recibir un abrazo ayuda.');
  if(S.zc.low>0)tips.push('Cuando la glucosa baja, el jugo la sube rápido.');
  else tips.push('Si la glucosa baja, hace falta algo dulce enseguida y avisar a un adulto.');
  closeOverlay();
  var prevStars=DB.stars;DB.stars+=stars;
  var won=ACCS.filter(function(a){return a.need>prevStars&&a.need<=DB.stars;}),nxt=ACCS.filter(function(a){return a.need>DB.stars;})[0];
  var full3=meals===3;
  var prev=DB.best,isBest=full3&&(prev===null||pct>prev),rec={d:today(),p:pet.name,pct:pct,s:stars,n:DB.me};
  if(isBest)DB.best=pct;
  DB.log.unshift(rec);DB.log=DB.log.slice(0,5);save();
  var bestMsg=!full3?'🍽️ Para sumar al récord hay que comer a lo largo de todo el día.':prev===null?'🏆 Primer día guardado. ¡Ahora probá superarlo!':(isBest?'🏆 ¡Nuevo mejor día!':'🏆 Tu mejor día: '+DB.best+'%. ¡Probá superarlo!');
  var days=DB.log.length>1?'<h3>Tus últimos días</h3><ul class="days">'+DB.log.map(function(x){
    var s=Math.max(1,Math.min(3,Number(x.s)||1));
    return '<li><span>'+esc(x.d||'')+' · '+esc(x.p||'Gluco')+'</span><span>'+(Number(x.pct)||0)+'% '+'★'.repeat(s)+'</span></li>';
  }).join('')+'</ul>':'';
  var r=$('results');r.hidden=false;
  r.innerHTML='<p class="eyebrow">Terminó el día · 20:00</p><h2 tabindex="-1">'+head+'</h2>'+
   '<div class="stars" role="img" aria-label="'+stars+' de 3 estrellas">'+star(stars>=1)+star(stars>=2)+star(stars>=3)+'</div>'+
   '<p>'+txt+'</p><p class="big-num">'+pct+'% <small style="font:700 1rem var(--font-body);color:var(--muted)">del día en zona verde</small></p>'+
   '<p class="best">'+bestMsg+'</p>'+
   (won.length?'<p class="best">🎁 ¡Ganaste: '+won.map(function(a){return a.em+' '+a.name;}).join(' y ')+'! Elegilo al empezar otro día.</p>':(nxt?'<p class="hint">⭐ Tenés '+DB.stars+' estrellas. Con '+nxt.need+' ganás: '+nxt.em+' '+nxt.name+'.</p>':''))+
   '<p>🎯 Meta del día: '+(meals===3?'✅':'⬜')+' comer a lo largo del día · '+(pct>=70?'✅':'⬜')+' 70% en zona verde</p>'+
   '<p>🍽️ Comidas del día: <b>'+meals+'</b>'+(meals<3?'. Para tener energía hay que comer a lo largo del día: no comer no es la manera de quedar en la zona verde.':'')+'</p>'+
   (S.quizN?'<p>Mitos y realidades: <b>'+S.quizOk+' de '+S.quizN+'</b>'+(S.predN?' · Adivinanzas: <b>'+S.predOk+' de '+S.predN+'</b>':'')+'</p>':'')+
   '<h3>🏅 Logros de hoy</h3><div class="chips">'+achievements(pct,meals).map(function(a){return '<span class="'+(a[2]?'':'no')+'">'+a[0]+' '+a[1]+(a[2]?' ✓':'')+'</span>';}).join('')+'</div>'+
   '<ul class="learn">'+whatHappened().map(function(t){return '<li>'+t+'</li>';}).join('')+'</ul>'+
   '<h3>La curva del día</h3>'+resChart()+
   '<p class="hint">🍽️ comidas y 🔑 llaves, marcadas en el momento en que ocurrieron.</p>'+
   '<div class="legend"><span style="--c:var(--low-soft)">Baja: menos de 70</span><span style="--c:var(--ok-soft)">Zona verde: de 70 a 180</span><span style="--c:var(--high-soft)">Alta: más de 180</span></div>'+
   '<h3>Lo que aprendiste</h3><ul class="learn">'+tips.map(function(t){return '<li>'+t+'</li>';}).join('')+'</ul>'+
   '<h3>💬 Para conversar</h3><p class="chat">'+chatQ()+'</p>'+
   '<div class="row"><button class="btn sun" type="button" id="again">Jugar otro día</button><button class="btn alt" type="button" id="adultsBtn2">👪 Para adultos</button></div>'+
   '<div class="diploma" id="diploma"><p class="eyebrow">Diploma</p><h3>Gran cuidado de '+nm+'</h3><p>Se entrega a</p>'+
   '<div class="dname'+(DB.me?'':' empty')+'" id="dname">'+(esc(DB.me)||'Tu nombre')+'</div>'+
   '<p>por cuidar a '+nm+' durante todo un día, con '+pct+'% del tiempo en la zona verde.</p>'+
   '<div class="stars" aria-hidden="true">'+star(stars>=1)+star(stars>=2)+star(stars>=3)+'</div><p class="hint">'+esc(today())+'</p></div>'+
   '<div class="field"><label class="lab" for="pname">Escribí tu nombre para el diploma</label><input type="text" id="pname" maxlength="24" autocomplete="off" placeholder="Tu nombre" value="'+esc(DB.me)+'"></div>'+
   '<p class="hint">Para guardarlo, sacale una captura de pantalla.</p>'+
   days;
  $('pname').addEventListener('input',function(){
    var v=this.value.trim().slice(0,24),d=$('dname');
    d.textContent=v||'Tu nombre';d.classList.toggle('empty',!v);
    rec.n=v;DB.me=v;save();
  });
  sfx.good();
  if(stars===3)confetti();
  $('again').addEventListener('click',restart);
  $('adultsBtn2').addEventListener('click',function(){openSheet(sheet,this);});
  try{r.scrollIntoView({block:'start',behavior:reduce?'auto':'smooth'});}catch(e){}
}
function restart(){
  $('results').hidden=true;$('results').innerHTML='';
  newGame();lastLocks=-1;curMood='';shown='';lastPulse='#';lastPct='';lastFw=-1;lastIw=-1;nxC=null;lastPos='';lastNum=-1;lastTrend='';lastSky=-1;lastZ='';lastDoor='';
  pctEl.hidden=true;
  openIntro();
  try{stage.scrollIntoView({block:'start',behavior:reduce?'auto':'smooth'});}catch(e){}
}

/* ---------- bucle ---------- */
var last=0;
function frame(now){
  var dt=Math.min(.1,(now-last)/1000||0);last=now;
  if(S){
    if(S.eatT>0)S.eatT-=dt;
    if(S.happyT>0)S.happyT-=dt;
    if(S.running&&!locked()){step(dt);S.idle+=dt;
      if(S.idle>28&&!S.ended&&!S.emo&&S.g>=70&&S.g<=180&&S.eatT<=0){S.idle=-9999;fx('🥱',2);say('¡Aaah! Qué tranquilo está todo.',3500,'¡Aaah! Tranquilo.');}}
    ui();
  }
  if(music&&now>=mNext){tone(NOTES[MEL[mi++%MEL.length]],1.1,'sine',.03);mNext=now+720;}
  requestAnimationFrame(frame);
}
if(DB.pn)pet.name=DB.pn;
if(COLORS.some(function(c){return c[1]===DB.pc;}))pet.color=DB.pc;
stage.style.setProperty('--gluco',pet.color);
$('brand').textContent=pet.name==='Gluco'?'El Día de Gluco':'El Día de '+pet.name;
pet.acc=ACCS.some(function(a){return a.id===DB.acc&&DB.stars>=a.need;})?DB.acc:'none';
setAcc(pet.acc);
newGame();
openIntro();
ui();
requestAnimationFrame(function(t){last=t;requestAnimationFrame(frame);});
/* Funcionamiento sin conexión: solo cuando la página lo pide (data-sw) */
try{if('serviceWorker' in navigator&&document.documentElement.getAttribute('data-sw')==='1'&&/^https?:$/.test(location.protocol)){navigator.serviceWorker.register('sw.js').catch(function(){});}}catch(e){}
})();
