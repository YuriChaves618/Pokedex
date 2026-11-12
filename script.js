const API='https://pokeapi.co/api/v2';
const art=id=>`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const TC={normal:'#a8a77a',fire:'#ee8130',water:'#6390f0',electric:'#f0b800',grass:'#5fb336',ice:'#6cc5c1',fighting:'#c22e28',poison:'#a33ea1',ground:'#c9a43d',flying:'#8f7ef0',psychic:'#f95587',bug:'#92a313',rock:'#a38f2c',ghost:'#735797',dragon:'#6f35fc',dark:'#705746',steel:'#8a8aa8',fairy:'#d685ad'};
const TP={normal:'normal',fire:'fogo',water:'água',electric:'elétrico',grass:'planta',ice:'gelo',fighting:'lutador',poison:'veneno',ground:'terra',flying:'voador',psychic:'psíquico',bug:'inseto',rock:'pedra',ghost:'fantasma',dragon:'dragão',dark:'sombrio',steel:'aço',fairy:'fada'};
const SN={hp:'PS',attack:'Ataque',defense:'Defesa','special-attack':'Atq. esp.','special-defense':'Def. esp.',speed:'Velocidade'};
const $=s=>document.querySelector(s);
const cache=new Map();let all=[],view='cat',shown=24,query='',cmp=[null,null];
let favs=[];try{favs=JSON.parse(localStorage.getItem('pk-favs')||'[]')}catch(e){}
const pad=n=>'#'+String(n).padStart(4,'0');
const col=p=>TC[p.types[0].type.name];
const chips=p=>`<div class="chips">${p.types.map(t=>`<span class="chip" style="--c:${TC[t.type.name]}">${TP[t.type.name]||t.type.name}</span>`).join('')}</div>`;
const ball='<svg class="pb"><use href="#pb"/></svg>';

async function get(k){k=String(k).toLowerCase().trim();if(cache.has(k))return cache.get(k);
  const r=await fetch(`${API}/pokemon/${k}`);if(!r.ok)throw new Error('404');
  const d=await r.json();cache.set(String(d.id),d);cache.set(d.name,d);return d}
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),2200)}
function save(){try{localStorage.setItem('pk-favs',JSON.stringify(favs))}catch(e){}$('#nf').textContent=favs.length;$('#nc').textContent=cmp.filter(Boolean).length}

function card(p){const f=favs.includes(p.id),c=cmp.some(x=>x&&x.id===p.id);
  return `<article class="card" style="--c:${col(p)}" data-id="${p.id}" tabindex="0" role="button" aria-label="Abrir ficha de ${p.name}">
  <div class="acts"><button class="ic fav ${f?'on':''}" data-fav="${p.id}" aria-label="Favoritar" aria-pressed="${f}">${f?'♥':'♡'}</button>
  <button class="ic cmp ${c?'on':''}" data-cmp="${p.id}" aria-label="Comparar" title="Comparar">⇄</button></div>
  <div class="halo"></div><img loading="lazy" src="${art(p.id)}" alt="${p.name}" onerror="this.src='${p.sprites.front_default||''}'">
  <span class="num">${pad(p.id)}</span><h3>${p.name}</h3>${chips(p)}</article>`}

async function cards(list,el,append){
  const ps=(await Promise.all(list.map(x=>get(x).catch(()=>null)))).filter(Boolean);
  const h=ps.map(card).join('');append?el.insertAdjacentHTML('beforeend',h):el.innerHTML=h}

let tf='',ctk=0;const tcache={};
async function typeIds(t){if(!tcache[t]){const j=await (await fetch(`${API}/type/${t}`)).json();tcache[t]=new Set(j.pokemon.map(x=>+x.pokemon.url.split('/').filter(Boolean).pop()))}return tcache[t]}
const tbar=()=>`<div class="tfs" role="group" aria-label="Filtrar por tipo"><button class="tf ${tf?'':'on'}" data-tf="">Todos</button>${Object.keys(TC).map(t=>`<button class="tf ${tf===t?'on':''}" data-tf="${t}" style="--c:${TC[t]}">${TP[t]}</button>`).join('')}</div>`;
async function catalog(){const tk=++ctk;
  $('#app').innerHTML=`<div class="head"><h2>${query?`resultados para “${query}”`:tf?`tipo ${TP[tf]}`:'catálogo'}</h2><p id="cc"></p></div>${tbar()}<div class="grid" id="g">${'<div class="skel"></div>'.repeat(8)}</div><div class="more" id="mr"></div>`;
  let list=query?all.filter(p=>p.name.includes(query)||String(p.id)===query):all;
  if(tf){try{const ids=await typeIds(tf);list=list.filter(p=>ids.has(p.id))}catch(e){toast('Não foi possível filtrar agora');tf='';return catalog()}}
  if(tk!==ctk)return;
  $('#cc').textContent=`${list.length} pokémon`;const g=$('#g');
  if(!list.length){g.outerHTML=`<div class="empty">${ball}Nenhum pokémon encontrado${tf?' com esse tipo':''}. Confira o nome ou tente outro filtro.</div>`;return}
  const draw=async(from,to,append)=>{await cards(list.slice(from,to).map(p=>p.id),g,append);if(tk!==ctk)return;
    $('#mr').innerHTML=to<list.length?'<button class="btn k" id="lm">Carregar mais</button>':'';
    const b=$('#lm');if(b)b.onclick=async()=>{b.disabled=true;b.textContent='Carregando...';const n=shown;shown+=24;await draw(n,shown,true)}};
  if(!query)shown=Math.max(shown,24);await draw(0,Math.min(shown,list.length),false)}

async function favorites(){
  $('#app').innerHTML=`<div class="head"><h2>favoritos</h2><p>${favs.length} salvos</p></div><div class="grid" id="g"></div>`;
  if(!favs.length){$('#g').outerHTML=`<div class="empty">${ball}Você ainda não favoritou ninguém. Toque no ♡ de um card para guardar aqui.</div>`;return}
  await cards(favs,$('#g'))}

function slot(p,i){
  return `<div class="slot">${p?`<img src="${art(p.id)}" alt="${p.name}"><span class="num">${pad(p.id)}</span><h3>${p.name}</h3>${chips(p)}`:`<div class="ph">?</div><h3>escolha um pokémon</h3>`}
  <input list="names" data-slot="${i}" placeholder="Digite o nome" aria-label="Pokémon ${i+1}"></div>`}
function compare(){
  const [a,b]=cmp;let rows='';
  if(a&&b){let wa=0,wb=0;const val=p=>Object.fromEntries(p.stats.map(s=>[s.stat.name,s.base_stat]));const A=val(a),B=val(b);
    const line=(n,x,y)=>{if(x>y)wa++;if(y>x)wb++;return `<div class="row"><span>${x>y?`<b class="win">${x}</b>`:x}</span><em>${n}</em><span style="text-align:left">${y>x?`<b class="win">${y}</b>`:y}</span></div>`};
    rows=Object.keys(SN).map(k=>line(SN[k],A[k],B[k])).join('');
    const ta=Object.values(A).reduce((s,v)=>s+v,0),tb=Object.values(B).reduce((s,v)=>s+v,0);
    rows+=line('Total',ta,tb)+`<div class="row"><span>${a.height/10} m</span><em>Altura</em><span style="text-align:left">${b.height/10} m</span></div><div class="row"><span>${a.weight/10} kg</span><em>Peso</em><span style="text-align:left">${b.weight/10} kg</span></div>`;
    const v=ta===tb?'Empate no total de atributos':`${ta>tb?a.name:b.name} leva a melhor no total`;
    rows=`<div class="table">${rows}</div><p class="verdict">${v} · ${wa} x ${wb} nos atributos</p>`}
  $('#app').innerHTML=`<div class="head"><h2>comparar</h2><p>${a&&b?'Lado a lado':'Escolha dois pokémon, pela busca ou pelo botão ⇄ dos cards'}</p></div><div class="vs">${slot(a,0)}<div class="vsb">VS</div>${slot(b,1)}</div>${rows}`}

function render(){document.querySelectorAll('nav button').forEach(b=>b.setAttribute('aria-selected',b.dataset.v===view));
  save();({cat:catalog,fav:favorites,cmp:compare,bat:battle})[view]()}
function go(v){view=v;render();scrollTo({top:document.querySelector('.divider').offsetTop-10,behavior:'smooth'})}

async function open(id){const p=await get(id);const c=col(p);
  const d=$('#dlg');d.style.setProperty('--c',c);
  const max=Math.max(...p.stats.map(s=>s.base_stat),150);
  d.innerHTML=`<div class="fh" style="--c:${c}"><button class="x" aria-label="Fechar" onclick="dlg.close()">×</button>
  <div><span class="num" style="color:#ffffffcc">${pad(p.id)}</span><h2>${p.name}</h2>${chips(p)}</div><img src="${art(p.id)}" alt="${p.name}"></div>
  <div class="fb"><p id="fl">Carregando descrição...</p>
  <div class="facts"><div class="fact"><small>Altura</small><b>${p.height/10} m</b></div><div class="fact"><small>Peso</small><b>${p.weight/10} kg</b></div>
  <div class="fact"><small>Habilidades</small><b style="font-size:14px;text-transform:capitalize">${p.abilities.map(a=>a.ability.name.replace('-',' ')).join(', ')}</b></div></div>
  <div>${p.stats.map(s=>`<div class="st"><span>${SN[s.stat.name]}</span><b>${s.base_stat}</b><i><s style="width:${s.base_stat/max*100}%;--c:${c}"></s></i></div>`).join('')}</div>
  <div class="fa"><button class="btn y" data-fav="${p.id}">${favs.includes(p.id)?'♥ Favoritado':'♡ Favoritar'}</button><button class="btn k" data-cmp="${p.id}">⇄ Comparar</button><button class="btn b" data-bat="${p.id}">⚔ Batalhar</button></div></div>`;
  d.showModal();
  fetch(p.species.url).then(r=>r.json()).then(s=>{const e=s.flavor_text_entries.find(x=>x.language.name==='pt-BR')||s.flavor_text_entries.find(x=>x.language.name==='en');
    const g=s.genera.find(x=>x.language.name==='en');const el=$('#fl');if(el)el.textContent=(e?e.flavor_text.replace(/[\n\f]/g,' '):'Sem descrição disponível.')+(g?` (${g.genus})`:'')}).catch(()=>{const el=$('#fl');if(el)el.textContent='Não foi possível carregar a descrição.'})}

async function addCmp(id){const p=await get(id);if(cmp.some(x=>x&&x.id===p.id)){toast(`${p.name} já está na comparação`);return}
  if(!cmp[0])cmp[0]=p;else if(!cmp[1])cmp[1]=p;else cmp=[cmp[1],p];
  toast(`${p.name} adicionado à comparação`);save();if(view==='cmp')compare();else document.querySelectorAll(`[data-cmp="${p.id}"]`).forEach(b=>b.classList.add('on'))}
function toggleFav(id){id=+id;const i=favs.indexOf(id);i>-1?favs.splice(i,1):favs.push(id);save();
  document.querySelectorAll(`[data-fav="${id}"]`).forEach(b=>{const on=favs.includes(id);
    if(b.classList.contains('ic')){b.classList.toggle('on',on);b.textContent=on?'♥':'♡'}else b.textContent=on?'♥ Favoritado':'♡ Favoritar'});
  if(view==='fav')favorites()}

document.addEventListener('click',e=>{
  const f=e.target.closest('[data-fav]'),c=e.target.closest('[data-cmp]'),k=e.target.closest('.card'),t=e.target.closest('nav button');
  const tfb=e.target.closest('[data-tf]');if(tfb){tf=tfb.dataset.tf;shown=24;catalog();return}
  const bb=e.target.closest('[data-bat],[data-brnd],[data-bgo],[data-bact],[data-bnew]');if(bb){batClick(bb);return}
  if(f){e.stopPropagation();toggleFav(f.dataset.fav)}else if(c){e.stopPropagation();addCmp(c.dataset.cmp)}
  else if(t)go(t.dataset.v);else if(k)open(k.dataset.id);
  else if(e.target===$('#dlg'))$('#dlg').close()});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('card')){e.preventDefault();open(e.target.dataset.id)}});
document.addEventListener('change',async e=>{const i=e.target.dataset&&e.target.dataset.slot;if(i==null||!e.target.value)return;
  try{cmp[i]=await get(e.target.value);compare();save()}catch(x){toast('Pokémon não encontrado')}});
$('#q').addEventListener('input',e=>{query=e.target.value.toLowerCase().trim();if(view!=='cat')view='cat';render()});
$('#sf').addEventListener('submit',async e=>{e.preventDefault();const v=$('#q').value.trim().toLowerCase();if(!v)return;
  try{await open((await get(v)).id)}catch(x){const m=all.filter(p=>p.name.includes(v));m.length?open(m[0].id):toast('Nenhum pokémon encontrado')}});
$('#rnd').onclick=()=>{if(!all.length)return;open(all[Math.floor(Math.random()*all.length)].id)};

/* ===== batalha ===== */
const TE={normal:[[],['rock','steel'],['ghost']],fire:[['grass','ice','bug','steel'],['fire','water','rock','dragon'],[]],water:[['fire','ground','rock'],['water','grass','dragon'],[]],electric:[['water','flying'],['electric','grass','dragon'],['ground']],grass:[['water','ground','rock'],['fire','grass','poison','flying','bug','dragon','steel'],[]],ice:[['grass','ground','flying','dragon'],['fire','water','ice','steel'],[]],fighting:[['normal','ice','rock','dark','steel'],['poison','flying','psychic','bug','fairy'],['ghost']],poison:[['grass','fairy'],['poison','ground','rock','ghost'],['steel']],ground:[['fire','electric','poison','rock','steel'],['grass','bug'],['flying']],flying:[['grass','fighting','bug'],['electric','rock','steel'],[]],psychic:[['fighting','poison'],['psychic','steel'],['dark']],bug:[['grass','psychic','dark'],['fire','fighting','poison','flying','ghost','steel','fairy'],[]],rock:[['fire','ice','flying','bug'],['fighting','ground','steel'],[]],ghost:[['psychic','ghost'],['dark'],['normal']],dragon:[['dragon'],['steel'],['fairy']],dark:[['psychic','ghost'],['fighting','dark','fairy'],[]],steel:[['ice','rock','fairy'],['fire','water','electric','steel'],[]],fairy:[['fighting','dragon','dark'],['fire','poison','steel'],[]]};
let bt={a:null,b:null,f:null};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const st=(p,n)=>p.stats.find(s=>s.stat.name===n).base_stat;
const tys=p=>p.types.map(t=>t.type.name);
const mult=(t,d)=>d.reduce((m,x)=>m*(TE[t][0].includes(x)?2:TE[t][1].includes(x)?.5:TE[t][2].includes(x)?0:1),1);
const mvs=p=>{const t=tys(p),t2=t[1]||t[0];return[{n:`Ataque físico (${TP[t[0]]})`,t:t[0],k:'attack',d:'defense'},{n:`Ataque especial (${TP[t2]})`,t:t2,k:'special-attack',d:'special-defense'}]};
function bslot(p,i){return `<div class="slot"><small class="num">${i?'Oponente':'Seu pokémon'}</small>${p?`<img src="${art(p.id)}" alt="${p.name}"><h3>${p.name}</h3>${chips(p)}`:`<div class="ph">?</div><h3>escolha um pokémon</h3>`}
  <input list="names" data-b="${i}" placeholder="Digite o nome" aria-label="${i?'Oponente':'Seu pokémon'}"><button class="btn k" data-brnd="${i}" style="margin:12px auto 0">${ball} Sortear</button></div>`}
function battle(){const f=bt.f;if(f)return arena();
  $('#app').innerHTML=`<div class="head"><h2>batalha</h2><p>Escolha seu pokémon e um oponente</p></div><div class="vs">${bslot(bt.a,0)}<div class="vsb">VS</div>${bslot(bt.b,1)}</div>
  <div class="more"><button class="btn y" data-bgo ${bt.a&&bt.b?'':'disabled'}>⚔ Iniciar batalha</button></div>`}
function lg(m,w){const f=bt.f;f.log.push([m,w]);const l=$('#log');if(l){l.insertAdjacentHTML('beforeend',`<p class="${w?'w':''}">${m}</p>`);l.scrollTop=1e5}}
function upd(s){const f=bt.f,h=f.hp[s],pc=h/f.max[s]*100,b=$('#hb'+s);if(!b)return;b.style.width=pc+'%';b.className=pc<20?'l':pc<50?'m':'';$('#ht'+s).textContent=`${h}/${f.max[s]}`}
function acts(){const f=bt.f,a=f.p[0],d=f.p[1];if(f.over)return `<button class="btn y" data-bnew="1">↻ Revanche</button><button class="btn k" data-bnew="0">Escolher outros</button>`;
  const x=m=>m===1?'':m===0?' · sem efeito':` · ×${m}`;
  return mvs(a).map((mv,i)=>`<button class="btn ${i?'k':'y'} mv" data-bact="${i}">${mv.n}<small>${x(mult(mv.t,tys(d)))}</small></button>`).join('')+`<button class="btn b" data-bact="2">🛡 Defender</button>`}
function arena(){const f=bt.f;
  $('#app').innerHTML=`<div class="head"><h2>batalha</h2><p>Escolha uma ação a cada turno</p></div><div class="arena">${[0,1].map(s=>{const p=f.p[s];return `<div class="fgt ${f.hp[s]<=0?'ko':''}" id="f${s}"><div class="hpw"><b>${p.name}</b><span id="ht${s}"></span><i><s id="hb${s}"></s></i></div><img src="${art(p.id)}" alt="${p.name}" ${s?'':'style="transform:scaleX(-1)"'}></div>`}).join('')}</div>
  <div class="log" id="log" aria-live="polite">${f.log.map(([m,w])=>`<p class="${w?'w':''}">${m}</p>`).join('')}</div><div class="fa" id="ba">${acts()}</div>`;
  upd(0);upd(1);$('#log').scrollTop=1e5}
function start(){const p=[bt.a,bt.b],m=p.map(x=>st(x,'hp')+60);bt.f={p,max:m,hp:[...m],busy:false,over:false,g:[false,false],log:[]};
  lg(`${p[1].name} quer lutar! Vá, ${p[0].name}!`,1);arena()}
function ai(f){if(Math.random()<.2)return 2;const a=f.p[1],d=f.p[0],sc=mvs(a).map(mv=>st(a,mv.k)/st(d,mv.d)*mult(mv.t,tys(d)));return Math.random()<.8?(sc[1]>sc[0]?1:0):Math.floor(Math.random()*2)}
async function hit(f,s,i){const a=f.p[s],d=f.p[1-s],mv=mvs(a)[i],m=mult(mv.t,tys(d)),cr=Math.random()<.0625;
  const A=st(a,mv.k)+5,D=st(d,mv.d)+5;
  let dm=Math.floor((Math.floor(22*70*A/D/50)+2)*1.5*m*(cr?1.5:1)*(.85+Math.random()*.15)*(f.g[1-s]?.5:1));if(m>0)dm=Math.max(1,dm);
  lg(`${a.name} usa ${mv.n}!`);const el=$('#f'+s),de=$('#f'+(1-s));el.classList.add('l'+s);await sleep(250);
  if(m===0)lg(`Não afeta ${d.name}...`);
  else{de.classList.add('hit');f.hp[1-s]=Math.max(0,f.hp[1-s]-dm);upd(1-s);lg(`${d.name} perde ${dm} PS.${cr?' Golpe crítico!':''}${m>1?' É super efetivo!':m<1?' Não é muito efetivo...':''}`)}
  await sleep(400);el.classList.remove('l'+s);de.classList.remove('hit');
  if(f.hp[1-s]<=0){f.over=true;de.classList.add('ko');lg(`${d.name} desmaiou! ${a.name} venceu a batalha!`,1);$('#ba').innerHTML=acts()}}
async function turn(i){const f=bt.f;if(!f||f.busy||f.over)return;f.busy=true;document.querySelectorAll('#ba button').forEach(b=>b.disabled=true);
  f.g=[false,false];const ac=[{s:0,i},{s:1,i:ai(f)}];
  ac.forEach(x=>{if(x.i===2){f.g[x.s]=true;lg(`${f.p[x.s].name} se prepara para defender!`)}});
  const at=ac.filter(x=>x.i!==2).sort((x,y)=>st(f.p[y.s],'speed')-st(f.p[x.s],'speed')||Math.random()-.5);
  await sleep(500);for(const x of at){if(f.over)break;await hit(f,x.s,x.i);await sleep(700)}
  f.busy=false;if(!f.over)document.querySelectorAll('#ba button').forEach(b=>b.disabled=false)}
async function batClick(el){const d=el.dataset;
  try{if('bat' in d){bt.a=await get(d.bat);bt.f=null;$('#dlg').close();go('bat')}
  else if('brnd' in d){const k=d.brnd==='1'?'b':'a';bt[k]=await get(all[Math.floor(Math.random()*all.length)].id);bt.f=null;battle()}
  else if('bgo' in d)start();
  else if('bnew' in d){if(d.bnew==='1')start();else{bt.f=null;battle()}}
  else if('bact' in d)turn(+d.bact)}catch(e){toast('Algo deu errado. Tente de novo')}}
document.addEventListener('change',async e=>{const i=e.target.dataset&&e.target.dataset.b;if(i==null||!e.target.value)return;
  try{bt[i==='1'?'b':'a']=await get(e.target.value);bt.f=null;battle()}catch(x){toast('Pokémon não encontrado')}});

(async()=>{$('#app').innerHTML='<div class="grid">'+'<div class="skel"></div>'.repeat(12)+'</div>';
  try{const r=await fetch(`${API}/pokemon?limit=1025`);const j=await r.json();
    all=j.results.map(p=>({name:p.name,id:+p.url.split('/').filter(Boolean).pop()}));
    $('#names').innerHTML=all.map(p=>`<option value="${p.name}">`).join('');render()}
  catch(e){$('#app').innerHTML=`<div class="empty">${ball}Não consegui falar com a PokéAPI. Verifique sua conexão e abra este arquivo em um navegador.</div>`}})();
