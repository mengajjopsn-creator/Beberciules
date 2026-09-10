import {renderRoundResults} from './results.js';
import {gameVisuals, artwork} from './visuals.js';
const app=document.querySelector('#app');
const notice=document.querySelector('#notice');
const entrance=app.innerHTML;
let state=null,busy=false,polling=false,noticeTimer,selectedInvite=false,networkFailures=0,timerEnding=false,entryMode='create';
const drafts=new Map();
let session;
try{session=JSON.parse(sessionStorage.getItem('beberciules-session')||'null');}catch{}
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const name=id=>state.players.find(p=>p.id===id)?.name||'Alguien que salió';
const isHost=()=>state.me===state.host;
const button=(label,action,extra='',cls='')=>`<button type="button" class="${cls}" data-action="${action}" ${extra}>${label}</button>`;
const playerButton=(id)=>button(`<span class="avatar" aria-hidden="true">${esc(name(id).slice(0,2).toUpperCase())}</span>${esc(name(id))}`,'answer',`data-value="${esc(id)}"`);
const roundKey=()=>state?.round?state.round.id+':'+state.round.stage:'lobby';
function toast(text){clearTimeout(noticeTimer);notice.textContent=text;noticeTimer=setTimeout(()=>notice.textContent='',6000);}
async function api(data=null,credentials=session){
 const response=await fetch(data?'/api/game':'/api/game?code='+encodeURIComponent(credentials.code),{method:data?'POST':'GET',headers:{'Content-Type':'application/json',Authorization:'Bearer '+credentials.token},...(data?{body:JSON.stringify({...data,code:credentials.code,requestId:crypto.randomUUID()})}:{}),signal:AbortSignal.timeout(15000)});
 const body=await response.json();if(!response.ok)throw Object.assign(new Error(body.error||'No se pudo conectar.'),{status:response.status});return body;
}
function saveSession(){sessionStorage.setItem('beberciules-session',JSON.stringify(session));}
function showEntrance(){
 state=null;app.innerHTML=entrance;
 const form=document.querySelector('#join-form');
 const invitation=new URLSearchParams(location.search).get('sala')||'';
 form.code.value=invitation;entryMode=invitation?'join':'create';
 try{form.name.value=localStorage.getItem('beberciules-name')||'';}catch{}
 updateJoinLabel();
}
function updateJoinLabel(){
 const form=document.querySelector('#join-form');if(!form)return;
 const joining=entryMode==='join';
 document.querySelector('#code-field').hidden=!joining;
 form.code.required=joining;
 document.querySelectorAll('[data-entry]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.entry===entryMode)));
 form.querySelector('button').innerHTML=joining?'Unirme <span aria-hidden="true">↗</span>':'Crear sala <span aria-hidden="true">↗</span>';
}
function sync(newState){if(state&&state.version>=newState.version&&state.code===newState.code)return;state=newState;render();}
function render(){
 const focus=document.activeElement;const field=focus?.id;const selection=focus?.selectionStart;
 const p=state.players;
 const header=`<div class="topbar"><div><p class="eyebrow">${state.phase==='lobby'?'VUESTRA SALA':state.phase==='finished'?'FIN DE PARTIDA':'LO QUE PASE, SE QUEDA AQUÍ'}</p><h1>${state.phase==='lobby'?'La previa está montada.':state.phase==='finished'?'Menuda previa.':esc(state.modes.find(m=>m.id===state.round?.type)?.name||'BEBERCIULES')}</h1></div><div class="room-tools"><div class="room-badge"><small>SALA</small><span class="roomcode">${esc(state.code)}</span></div><div class="actions">${button('Invitar','invite')}${button('Salir','leave','','secondary')}</div></div></div>${selectedInvite?`<div class="invite"><label for="invite-link">Comparte este enlace con tu grupo</label><input id="invite-link" readonly value="${esc(location.origin+'/?sala='+state.code)}"></div>`:''}`;
 if(state.phase==='lobby'){
  const selected=state.modes.find(m=>m.id===state.selected);
  app.innerHTML=header+`<div class="players" aria-label="Participantes">${p.map(x=>`<span class="player ${x.id===state.me?'me':''}"><span class="avatar" aria-hidden="true">${esc(x.name.slice(0,2).toUpperCase())}</span><span>${esc(x.name)}${x.id===state.host?' · organiza':''}${x.id===state.me?' · tú':''}</span></span>`).join('')}</div><div class="section-heading"><h2 class="section-title">Elegid vuestro lío.</h2><span class="count-badge">${p.length}/20 dentro</span></div><p class="section-help">${isHost()?'Elige un juego. Diez rondas para dar que hablar.':esc(name(state.host))+' elige el juego y empieza la partida.'}</p><div class="grid">${state.modes.map((m,i)=>{const visual=gameVisuals[m.id];return `<button type="button" class="game ${state.selected===m.id?'selected':''}" data-action="select" data-mode="${m.id}" data-tone="${visual.color}" aria-pressed="${state.selected===m.id}" ${!isHost()?'disabled':''}><div class="game-visual"><span class="num">${m.min}+ personas</span><span class="selection-mark" aria-hidden="true">✓</span>${artwork(m.id,{loading:i<4?'eager':'lazy',size:320})}</div><div class="game-body"><span class="game-category">${visual.label}</span><h3>${esc(m.name)}</h3><p>${esc(m.description)}</p></div></button>`;}).join('')}</div><div class="settings"><div class="selection-summary"><strong>${esc(selected.name)}</strong><span>10 rondas · ${selected.min}+ personas</span></div><div><label for="level">¿Cuánto subimos el tono?</label><select id="level" ${!isHost()?'disabled':''}>${['Calentando','Salseo','Sin filtro · adulto'].map((l,i)=>`<option value="${i}" ${state.level===i?'selected':''}>${l}</option>`).join('')}</select></div>${isHost()?button(p.length<selected.min?`Faltan ${selected.min-p.length} personas`:'Vamos a jugar →','start',p.length<selected.min?'disabled':'','primary'):`<p class="waiting">Esperando a ${esc(name(state.host))}.</p>`}</div><p class="fine">Pasar siempre vale. Al cerrar las rondas se revelan nombres y respuestas; los matches solo se revelan si son mutuos. La sala caduca tras seis horas sin actividad.</p>`;
 }else if(state.phase==='finished'){
  const sorted=[...p].sort((a,b)=>b.score-a.score);
  app.innerHTML=header+`<section class="round"><div class="card finish-card">${artwork('mix',{loading:'eager',size:160})}<span class="tag">10 RONDAS DESPUÉS</span><h2 class="question">Esto merecía una quedada.</h2><p>Los puntos cuentan aciertos y retos. Las confesiones y los matches se quedan fuera del marcador.</p></div><div class="results">${sorted.map((p,i)=>`<div class="result"><span>${sorted.findIndex(x=>x.score===p.score)+1}. ${esc(p.name)}</span><strong>${p.score} pt.</strong></div>`).join('')}</div><div class="actions end-actions">${isHost()?button('Elegir otro juego','lobby','','primary'):'<p>Quien organiza puede abrir otra partida.</p>'}</div></section>`;
 }else app.innerHTML=header+renderRound();
 if(field&&document.getElementById(field)&&document.getElementById(field).type!=='checkbox'){
  const target=document.getElementById(field);target.focus({preventScroll:true});if(typeof selection==='number'&&target.setSelectionRange)try{target.setSelectionRange(selection,selection);}catch{}
 }
 tickTimer();
}
function answerText(label,placeholder){return `<form id="answer-form"><label for="answer-text">${label}</label><textarea id="answer-text" name="answer" maxlength="160" placeholder="${esc(placeholder)}" required>${esc(drafts.get(roundKey())||'')}</textarea><button class="primary" type="submit">Enviar en secreto →</button></form>${button('Paso','answer','data-value="pass"','secondary skip')}`;}
function renderRound(){
 const r=state.round,actor=r.actor===state.me,visual=gameVisuals[r.type];
 const progress=`<div class="round-meta"><span>RONDA ${state.roundNumber} / 10</span><span>${r.stage==='results'?'Resultado':r.submittedCount+' / '+r.expectedCount+' respuestas'}</span></div>`;
 let instructions='',question=r.prompt||'La pregunta está bajo llave.',content='';
 if(r.type==='paranoia'){instructions=actor?'Elige en secreto. Una moneda decidirá si se revela la pregunta.':'Solo una persona conoce la pregunta. Después veremos a quién ha elegido.';}
 if(r.type==='faker'){instructions=r.isFaker&&r.stage!=='results'?'Eres el infiltrado. Inventa una respuesta genérica e intenta colarla.':r.stage==='vote'?'Leed las respuestas en voz alta y debatid: ¿quién no sabía la pregunta?':'Responde en una frase. Hay alguien que no ha visto esta pregunta.';if(r.isFaker&&r.stage!=='results')question='No sabes la pregunta. Disimula.';}
 if(r.type==='bluff')instructions=r.stage==='answer'?'Primero, '+name(r.actor)+' escribe su respuesta verdadera.':r.stage==='bluff'?'Inventa algo que podría haberle pasado a '+name(r.actor)+'.':'Encuentra la respuesta verdadera. No puedes votar la tuya.';
 if(r.type==='match')instructions='Elige a alguien o pasa. Solo aparecen las elecciones mutuas.';
 if(r.type==='never')instructions='Al cerrar la ronda, todos verán quién ha respondido sí, quién no y quién ha pasado.';
 if(r.type==='vote')instructions='Vota sin que el resto lo vea todavía. Al cerrar, aparecerá quién ha señalado a quién.';
 if(r.type==='ten')instructions='Con ese pero, ¿en qué nota se queda? De 0 a 10. Al cerrar veremos la nota de cada uno.';
 if(['speed','defend'].includes(r.type))instructions=name(r.actor)+(r.type==='speed'?' tiene ocho segundos para dar tres respuestas.':' tiene quince segundos para defenderlo. Después votáis.');
 if(r.stage==='results'){instructions='';content=renderResults(r);}
 else if(r.stage==='perform'){
  content=`<div class="waiting"><p>${actor?'Te toca a ti.':esc(name(r.actor))+' tiene la palabra.'}</p><div class="timer" id="timer">${r.duration}</div><div class="actions end-actions">${actor?(r.startedAt?button('Listo, votad','done','','primary'):button('Arrancar reloj','timer','','primary'))+button('Paso','skip','','secondary'):''}</div></div>`;
 }else{
  if(r.responses)content+=`<div class="results responses">${r.responses.map(v=>`<div class="result"><span><strong>${esc(name(v.id))}</strong><br>${esc(v.text)}</span></div>`).join('')}</div>`;
  if(!r.participant)content+='<div class="waiting">Has llegado con la ronda empezada. Entras en la siguiente.</div>';
  else if(r.canAnswer){
   if((r.type==='faker'&&r.stage==='answer')||(r.type==='bluff'&&['answer','bluff'].includes(r.stage)))content+=answerText(r.type==='bluff'&&r.stage==='answer'?'Tu respuesta real':'Tu respuesta','Una frase corta, sin firmar…');
   else{
    let choices='';
    if(r.type==='bluff')choices=r.options.map(o=>button(esc(o.text),'answer',`data-value="${o.id}" ${o.own?'disabled':''}`,'wide')).join('');
    else if(r.type==='ten')choices=Array.from({length:11},(_,n)=>button(String(n),'answer',`data-value="${n}"`)).join('');
    else if(['never','speed','defend'].includes(r.type))choices=button(r.type==='never'?'Sí, lo he hecho':r.type==='defend'?'Me ha convencido':'Lo ha conseguido','answer','data-value="yes"','primary')+button(r.type==='never'?'Yo nunca':r.type==='speed'?'No lo ha conseguido':'No me convence','answer','data-value="no"');
    else choices=r.eligible.map(playerButton).join('');
    content+=`<div class="choices ${r.type==='ten'?'ratings':''}">${choices}${button('Paso','answer','data-value="pass"','secondary wide')}</div>`;
   }
  }else content+=`<div class="waiting">${r.submitted?'Respuesta guardada. Ahora le toca al resto.':actor&&['speed','defend'].includes(r.type)?'Ahora el grupo vota tu actuación.':'Es el turno del resto. Mira cómo se desarrolla la ronda.'}</div>`;
  content+=`<div class="progress"><progress aria-label="Respuestas recibidas" max="${Math.max(1,r.expectedCount)}" value="${r.submittedCount}"></progress></div>`;
 }
 let hostActions='';
 if(isHost())hostActions=`<div class="actions end-actions">${r.stage==='results'?button(state.roundNumber===10?'Ver cierre →':'Siguiente ronda →','next','','primary'):r.stage!=='perform'?button(r.type==='bluff'&&r.stage==='answer'?'Cerrar respuesta':r.stage==='bluff'?'Mostrar opciones':r.type==='faker'&&r.stage==='answer'?'Pasar a votar':'Ver resultados','reveal','','secondary'):''}${button('Cambiar de juego','lobby','','secondary')}</div>`;
 else if(r.stage==='results')hostActions=`<p class="waiting">${esc(name(state.host))} pasa a la siguiente ronda.</p>`;
 return `<section class="round">${progress}<div class="round-track" aria-hidden="true">${Array.from({length:10},(_,i)=>`<span class="${i+1<state.roundNumber?'complete':i+1===state.roundNumber?'current':''}"></span>`).join('')}</div><div class="card prompt-card" data-tone="${visual.color}"><div class="prompt-header"><div><span class="tag">${r.stage==='results'?'AHORA SE SABE':actor&&['paranoia','bluff','speed','defend'].includes(r.type)?'TE TOCA':'VAMOS ALLÁ'}</span><span class="round-kind">${visual.label}</span></div>${artwork(r.type,{className:'prompt-art',loading:'eager',size:160})}</div><h2 class="question">${esc(question)}</h2><p>${esc(instructions)}</p></div>${content}${hostActions}</section>`;
}
function renderResults(r){return renderRoundResults(r,state.players);}
async function perform(action,extra={}){
 if(busy)return;busy=true;
 const buttons=app.querySelectorAll('button:not(:disabled)');buttons.forEach(b=>b.disabled=true);
 try{const result=await api({action,roundId:state.round?.id,...extra});if(action==='leave'){session=null;sessionStorage.removeItem('beberciules-session');history.replaceState(null,'','/');showEntrance();}else{state=result;render();}}
 catch(error){toast(error.message);if(state)render();}
 finally{busy=false;}
}
app.addEventListener('submit',async e=>{
 e.preventDefault();if(busy)return;
 if(e.target.id==='join-form'){
  busy=true;const form=e.target;const data=new FormData(form);form.querySelector('button').disabled=true;
  const credentials={token:crypto.randomUUID()+crypto.randomUUID(),code:entryMode==='join'?String(data.get('code')).trim().toUpperCase():''};
  try{const joined=await api({action:credentials.code?'join':'create',name:data.get('name'),adult:data.get('adult')==='on'},credentials);session={...credentials,code:joined.code};saveSession();try{localStorage.setItem('beberciules-name',data.get('name'));}catch{}history.replaceState(null,'','/?sala='+joined.code);state=joined;render();}
  catch(error){toast(error.message);form.querySelector('button').disabled=false;}
  finally{busy=false;}
 }else if(e.target.id==='answer-form'){const text=new FormData(e.target).get('answer');await perform('answer',{value:text});}
});
app.addEventListener('input',e=>{if(e.target.id==='code')updateJoinLabel();if(e.target.id==='answer-text')drafts.set(roundKey(),e.target.value);});
app.addEventListener('change',e=>{if(e.target.id==='level')perform('select',{mode:state.selected,level:Number(e.target.value)});});
app.addEventListener('click',async e=>{
 const entry=e.target.closest('[data-entry]');
 if(entry&&!busy){entryMode=entry.dataset.entry;updateJoinLabel();return;}
 const target=e.target.closest('[data-action]');if(!target||target.disabled)return;
 const action=target.dataset.action;
 if(action==='invite'){
  const url=location.origin+'/?sala='+state.code;
  try{if(navigator.share)await navigator.share({title:'BEBERCIULES',text:'Te estamos esperando. Entra con tu mote.',url});else{await navigator.clipboard.writeText(url);toast('Enlace copiado. Pásaselo a tu gente.');}}
  catch(error){if(error.name!=='AbortError'){selectedInvite=true;render();document.querySelector('#invite-link')?.select();}}return;
 }
 if(action==='leave'&&!confirm('¿Salir de la sala? Si organizas, otra persona se quedará al mando.'))return;
 if(action==='lobby'&&state.phase==='playing'&&!confirm('¿Volver al selector? Se cerrará la ronda actual.'))return;
 if(action==='reveal'&&state.round.submittedCount<state.round.expectedCount&&!confirm('Aún faltan respuestas. ¿Cerrar este turno con las que han llegado?'))return;
 if(action==='select')return perform('select',{mode:target.dataset.mode,level:state.level});
 if(action==='answer')return perform(action,{value:target.dataset.value});
 if(action==='skip')return perform('done',{skip:true});
 return perform(action);
});
function tickTimer(){
 const r=state?.round;if(!r||r.stage!=='perform')return;
 const remaining=r.startedAt?Math.max(0,r.duration-Math.floor((Date.now()-r.startedAt)/1000)):r.duration;
 const timer=document.querySelector('#timer');if(timer)timer.textContent=remaining;
 if(r.startedAt&&Date.now()>=r.startedAt+r.duration*1000+(isHost()&&r.actor!==state.me?1500:0)&&remaining===0&&(r.actor===state.me||isHost())&&!timerEnding&&!busy){timerEnding=true;perform('done').finally(()=>timerEnding=false);}
}
async function poll(){
 if(!session||!state||busy||polling||document.hidden)return;polling=true;
 try{sync(await api());if(networkFailures)toast('Conexión recuperada.');networkFailures=0;}
 catch(error){if([401,404].includes(error.status)){session=null;sessionStorage.removeItem('beberciules-session');showEntrance();toast(error.message);}else{networkFailures++;if(networkFailures===2)toast('Conexión interrumpida. Intentamos reconectar; tu respuesta se conserva.');}}
 finally{polling=false;}
}
showEntrance();
if(session){api().then(result=>{state=result;render();}).catch(error=>{if([401,404].includes(error.status)){session=null;sessionStorage.removeItem('beberciules-session');}toast(error.message);});}
setInterval(poll,2500);setInterval(tickTimer,250);document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll();});
// Integración opcional con navegadores que implementen WebMCP.
if(document.modelContext?.registerTool){
 const lifecycle=new AbortController();
 addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
 try{Promise.resolve(document.modelContext.registerTool({
  name:'read_current_game',title:'Consultar la partida',
  description:'Lee el estado visible de BEBERCIULES en este móvil, sin revelar respuestas privadas de otros jugadores.',
  inputSchema:{type:'object',properties:{},additionalProperties:false},
  annotations:{readOnlyHint:true,untrustedContentHint:true},
  execute(input){if(!input||Object.keys(input).length)throw new Error('No acepta parámetros.');return state?{phase:state.phase,code:state.code,players:state.players.map(p=>p.name),round:state.roundNumber,game:state.round?.type,stage:state.round?.stage}: {phase:'entrance'};}
 },{signal:lifecycle.signal})).catch(()=>{});}catch{}
}

