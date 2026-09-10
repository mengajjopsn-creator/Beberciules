import {randomBytes,createHash,randomInt} from 'node:crypto';
import {modes,prompts} from './catalog.js';
import {confessions} from './confessions.js';
export const hash=t=>createHash('sha256').update(t).digest('hex');
const uid=()=>randomBytes(10).toString('hex');
const pick=a=>a[randomInt(a.length)];
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=randomInt(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
export function fail(message,status=400){throw Object.assign(new Error(message),{status});}
const clean=(s,max=160)=>String(s??'').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,max);
function makePlayer(name,token){name=clean(name,24);if(!name)fail('Escribe tu nombre o mote.');if(!/^[a-zA-Z0-9-]{32,100}$/.test(token||''))fail('No se pudo crear tu sesión. Recarga la página.');return {id:uid(),name,hash:hash(token),score:0};}
export function createRoom(name,token,code){const player=makePlayer(name,token);return {code:code||randomBytes(3).toString('hex').toUpperCase(),version:0,host:player.id,players:[player],phase:'lobby',selected:'mix',level:1,roundNumber:0,round:null,used:[],recent:[]};}
export function authenticate(room,token){if(typeof token!=='string'||token.length>120)fail('Vuelve a unirte a la sala.',401);const p=room.players.find(p=>p.hash===hash(token));if(!p)fail('Tu sesión ya no está en esta sala.',401);return p;}
function pool(type,level){return (type==='never'?confessions:prompts[type]).filter(p=>p.level<=level);}
function beginRound(room){
 const available=modes.filter(m=>m.id!=='mix'&&m.min<=room.players.length);
 const type=room.selected==='mix'?pick(available).id:room.selected;
 const all=pool(type,room.level);let choices=all.filter(p=>!room.used.includes(type+':'+p.id));if(!choices.length)choices=all;
 const prompt=pick(choices);room.used.push(type+':'+prompt.id);room.used=room.used.slice(-500);
 const actor=room.players[(room.roundNumber-1)%room.players.length].id;
 room.round={id:uid(),type,prompt:prompt.text,actor,faker:type==='faker'?pick(room.players).id:null,participants:room.players.map(p=>p.id),stage:['speed','defend'].includes(type)?'perform':'answer',answers:{},votes:{},options:[],startedAt:null,result:null};
 room.phase='playing';
}
function activeIds(room){return room.round.participants.filter(id=>room.players.some(p=>p.id===id));}
function required(room){const r=room.round;const ids=activeIds(room);if(['paranoia'].includes(r.type)||(r.type==='bluff'&&r.stage==='answer'))return ids.filter(id=>id===r.actor);if(r.type==='bluff')return ids.filter(id=>id!==r.actor);if(['speed','defend'].includes(r.type))return ids.filter(id=>id!==r.actor);return ids;}
function bucket(r){return r.stage==='vote'?r.votes:r.answers;}
function score(room,id,amount=1){const p=room.players.find(p=>p.id===id);if(p)p.score+=amount;}
function finish(room,skipped=false){
 const r=room.round;if(r.stage==='results')return;
 const values=Object.values(r.stage==='vote'?r.votes:r.answers).filter(x=>x!=='pass');
 let result={skipped};
 if(!skipped){
  if(r.type==='never'){result={yes:values.filter(x=>x==='yes').length,no:values.filter(x=>x==='no').length,passed:activeIds(room).length-values.length};}
  if(r.type==='ten'){result={average:values.length?Math.round(values.reduce((s,n)=>s+Number(n),0)/values.length*10)/10:null,count:values.length};}
  if(r.type==='vote'){const counts={};for(const id of values)counts[id]=(counts[id]||0)+1;result={counts};}
  if(r.type==='paranoia'){const target=r.answers[r.actor];result={target:target==='pass'?null:target,showQuestion:randomInt(2)===1};}
  if(r.type==='match'){const pairs=[];for(const [id,target]of Object.entries(r.answers)){if(target!=='pass'&&r.answers[target]===id&&id<target)pairs.push([id,target]);}result={pairs};}
  if(r.type==='faker'){const counts={};for(const id of values)counts[id]=(counts[id]||0)+1;const max=Math.max(0,...Object.values(counts));const winners=Object.keys(counts).filter(id=>counts[id]===max);const caught=winners.length===1&&winners[0]===r.faker;for(const [id,target]of Object.entries(r.votes))if(target===r.faker)score(room,id);if(!caught)score(room,r.faker,2);result={counts,faker:r.faker,caught};}
  if(r.type==='bluff'){for(const [id,choice]of Object.entries(r.votes)){const option=r.options.find(o=>o.id===choice);if(option?.truth)score(room,id,2);else if(option)for(const author of option.authors)score(room,author);}result={truth:r.answers[r.actor],counts:Object.fromEntries(r.options.map(o=>[o.id,values.filter(v=>v===o.id).length]))};}
  if(['speed','defend'].includes(r.type)){const yes=values.filter(x=>x==='yes').length,no=values.filter(x=>x==='no').length;const success=yes>no;if(success)score(room,r.actor,2);result={yes,no,success};}
 }
 r.result=result;r.stage='results';
}
function advanceStage(room,forced=false){
 const r=room.round;if(r.stage==='results')return;
 if(!forced&&!required(room).every(id=>Object.hasOwn(bucket(r),id)))return;
 if(r.type==='bluff'&&r.stage==='answer'){
  if(!r.answers[r.actor]||r.answers[r.actor]==='pass')return finish(room,true);
  r.stage='bluff';return;
 }
 if(r.type==='bluff'&&r.stage==='bluff'){
  const groups=new Map();for(const[id,text]of Object.entries(r.answers)){if(text==='pass')continue;const key=text.toLocaleLowerCase('es');const existing=groups.get(key);if(existing){existing.authors.push(id);existing.truth ||= id===r.actor;}else groups.set(key,{id:uid(),text,authors:[id],truth:id===r.actor});}
  r.options=shuffle([...groups.values()]);r.stage='vote';return;
 }
 if(r.type==='faker'&&r.stage==='answer'){r.stage='vote';return;}
 finish(room);
}
export function mutate(room,player,action,data={}){
 const r=room.round;const host=player?.id===room.host;
 if(action==='join'){
  const existing=room.players.find(p=>p.hash===hash(data.token||''));if(existing)return;
  if(room.players.length>=20)fail('La sala está llena (máximo 20).');
  const p=makePlayer(data.name,data.token);if(room.players.some(x=>x.name.toLocaleLowerCase('es')===p.name.toLocaleLowerCase('es')))fail('Ese mote ya está pillado. Prueba con otro.');room.players.push(p);return;
 }
 if(action==='leave'){
  room.players=room.players.filter(p=>p.id!==player.id);if(host)room.host=room.players[0]?.id||null;
  if(r&&r.stage!=='results'&&room.phase==='playing'){
   r.participants=r.participants.filter(id=>id!==player.id);delete r.answers[player.id];delete r.votes[player.id];
   for(const[id,value]of Object.entries(r.answers))if(['match','vote','paranoia'].includes(r.type)&&value===player.id)r.answers[id]='pass';
   if(r.actor===player.id||r.faker===player.id||activeIds(room).length<2)finish(room,true);else advanceStage(room);
  }return;
 }
 if(['select','start','next','reveal','lobby'].includes(action)&&!host)fail('Solo quien organiza puede cambiar la ronda.',403);
 if(['answer','timer','done','reveal','next'].includes(action)&&(!r||data.roundId!==r.id))fail('La ronda ha cambiado. Ya estamos actualizando tu pantalla.',409);
 if(action==='select'){
  if(room.phase!=='lobby')fail('Vuelve al selector para cambiar de juego.');
  if(!modes.some(m=>m.id===data.mode))fail('Ese juego no existe.');room.selected=data.mode;room.level=[0,1,2].includes(Number(data.level))?Number(data.level):1;return;
 }
 if(action==='start'){
  if(room.phase!=='lobby')fail('La partida ya ha empezado.',409);
  const mode=modes.find(m=>m.id===room.selected);if(room.players.length<mode.min)fail('Este juego necesita al menos '+mode.min+' personas.');
  room.roundNumber=1;room.players.forEach(p=>p.score=0);beginRound(room);return;
 }
 if(action==='lobby'){room.phase='lobby';room.round=null;return;}
 if(action==='next'){
  if(r.stage!=='results')fail('Primero hay que cerrar esta ronda.');
  if(room.roundNumber>=10){room.phase='finished';return;}
  if(room.players.length<modes.find(m=>m.id===room.selected).min){room.phase='lobby';room.round=null;return;}
  room.roundNumber++;beginRound(room);return;
 }
 if(action==='reveal'){if(r.stage==='perform')fail('Primero se hace el reto o se pasa.');advanceStage(room,true);return;}
 if(action==='timer'){
  if(r.actor!==player.id||r.stage!=='perform')fail('No es tu turno.',403);if(!r.startedAt)r.startedAt=Date.now();return;
 }
 if(action==='done'){
  if(r.actor!==player.id||r.stage!=='perform')fail('No es tu turno.',403);
  if(data.skip){finish(room,true);return;}if(!r.startedAt)fail('Inicia el cronómetro primero.');r.stage='answer';return;
 }
 if(action==='answer'){
  if(room.phase!=='playing'||!['answer','bluff','vote'].includes(r.stage))fail('Esta ronda ya está cerrada.',409);
  if(!required(room).includes(player.id))fail('En este turno te toca mirar.',403);
  const b=bucket(r);if(Object.hasOwn(b,player.id))return;
  let value=clean(data.value);if(!value)fail('Escribe una respuesta.');
  if(value!=='pass'){
   if(['vote','match','paranoia'].includes(r.type)||(r.type==='faker'&&r.stage==='vote')){
    if(value===player.id||!activeIds(room).includes(value))fail('Elige a otra persona de esta ronda.');
   }else if(r.type==='bluff'&&r.stage==='vote'){
    const option=r.options.find(o=>o.id===value);if(!option||option.authors.includes(player.id))fail('No puedes votar tu propia respuesta.');
   }else if(['never','speed','defend'].includes(r.type)){if(!['yes','no'].includes(value))fail('Respuesta no válida.');}
   else if(r.type==='ten'){if(!/^(10|[0-9])$/.test(value))fail('Elige una nota de cero a diez.');}
  }
  b[player.id]=value;advanceStage(room);return;
 }
 fail('Acción desconocida.');
}
export function view(room,player){
 const result={code:room.code,version:room.version,host:room.host,me:player.id,phase:room.phase,selected:room.selected,level:room.level,roundNumber:room.roundNumber,players:room.players.map(({id,name,score})=>({id,name,score})),modes};
 if(!room.round)return result;
 const r=room.round;const ids=required(room);const b=bucket(r);const isResult=r.stage==='results';
 const visiblePrompt=!(r.type==='paranoia'&&player.id!==r.actor&&!(isResult&&r.result?.showQuestion))&&!(r.type==='faker'&&player.id===r.faker&&!isResult);
 result.round={id:r.id,type:r.type,actor:r.actor,stage:r.stage,prompt:visiblePrompt?r.prompt:null,isFaker:r.type==='faker'&&player.id===r.faker,canAnswer:!isResult&&ids.includes(player.id)&&!Object.hasOwn(b,player.id),submitted:Object.hasOwn(b,player.id),submittedCount:ids.filter(id=>Object.hasOwn(b,id)).length,expectedCount:ids.length,participant:r.participants.includes(player.id),eligible:r.participants.filter(id=>id!==player.id&&room.players.some(p=>p.id===id)),startedAt:r.startedAt,duration:r.type==='speed'?8:15,result:isResult?r.result:null};
 if(r.type==='faker'&&['vote','results'].includes(r.stage))result.round.responses=Object.entries(r.answers).map(([id,text])=>({id,text:text==='pass'?'Ha pasado':text}));
 if(r.type==='bluff'&&['vote','results'].includes(r.stage))result.round.options=r.options.map(o=>({id:o.id,text:o.text,own:o.authors.includes(player.id),...(isResult?{truth:o.truth}: {})}));
 return result;
}
