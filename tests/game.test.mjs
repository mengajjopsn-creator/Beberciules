import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createServer} from 'node:http';
import {createRoom,mutate,view,authenticate} from '../lib/game.js';
import {confessions,excluded} from '../lib/confessions.js';
import {modes} from '../lib/catalog.js';
import handler from '../api/game.js';
import {renderRoundResults} from '../public/results.js';
const token=()=>randomUUID()+randomUUID();
function setup(type='vote',n=3){const tokens=Array.from({length:n},token);const room=createRoom('Persona 1',tokens[0]);for(let i=1;i<n;i++)mutate(room,null,'join',{name:'Persona '+(i+1),token:tokens[i]});mutate(room,room.players[0],'select',{mode:type,level:2});mutate(room,room.players[0],'start');return {room,tokens,players:[...room.players]};}
function act(room,p,action,data={}){mutate(room,p,action,{roundId:room.round?.id,...data});}
function answer(room,p,value){act(room,p,'answer',{value});}

test('Resultados nominales solo al cierre; pasar no se confunde con no responder',()=>{
 const {room,players:p}=setup('never',4);
 answer(room,p[0],'yes');answer(room,p[1],'no');answer(room,p[2],'pass');
 for(const player of p){assert.equal(view(room,player).round.result,null);assert.equal(view(room,player).round.answers,undefined);}
 act(room,p[0],'reveal');
 assert.deepEqual(room.round.result.ballots.map(b=>b.value),['yes','no','pass',null]);
 const html=renderRoundResults(view(room,p[0]).round,p);
 for(const player of p)assert.ok(html.includes(player.name));
 assert.ok(html.includes('Sin responder'));assert.ok(html.includes('Han pasado'));
});

test('El señalado revela votantes y distingue el empate',()=>{
 const {room,players:p}=setup('vote');
 p[0].name='<script>alert(1)</script>';
 answer(room,p[0],p[1].id);answer(room,p[1],p[2].id);answer(room,p[2],p[0].id);
 const html=renderRoundResults(view(room,p[0]).round,p);
 assert.ok(html.includes('Empate entre'));assert.ok(html.includes('Le votaron:'));
 assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));
 assert.ok(p.every(x=>x.score===0));
});

test('Tiene un pero muestra cada nota, incluida cero, además de la media',()=>{
 const {room,players:p}=setup('ten');
 answer(room,p[0],'0');answer(room,p[1],'10');answer(room,p[2],'pass');
 const html=renderRoundResults(view(room,p[0]).round,p);
 assert.equal(room.round.result.average,5);assert.ok(html.includes('0/10'));assert.ok(html.includes('10/10'));
 assert.ok(html.includes(p[0].name));assert.ok(html.includes(p[1].name));
});

test('Mucho cuento revela autores y engañados solo después de votar y reparte puntos',()=>{
 const {room,players:p}=setup('bluff',4);
 answer(room,p[0],'Verdad');answer(room,p[1],'Mentira A');answer(room,p[2],'Mentira B');answer(room,p[3],'Mentira C');
 const before=view(room,p[1]).round;
 assert.ok(before.options.every(o=>o.authors===undefined&&o.truth===undefined));
 const a=room.round.options.find(o=>o.text==='Mentira A');const truth=room.round.options.find(o=>o.truth);
 answer(room,p[1],truth.id);answer(room,p[2],a.id);answer(room,p[3],a.id);
 assert.equal(p[1].score,4);assert.equal(p[0].score,0);
 const after=view(room,p[1]).round;
 assert.deepEqual(after.options.find(o=>o.id===a.id).authors,[p[1].id]);
 const html=renderRoundResults(after,p);assert.ok(html.includes('La eligieron: Persona 3, Persona 4'));
});

test('Infiltrado sin votos no gana puntos por defecto',()=>{
 const {room,players:p}=setup('faker');for(const x of p)answer(room,x,'Respuesta');for(const x of p)answer(room,x,'pass');
 assert.equal(room.round.result.noVotes,true);assert.ok(p.every(x=>x.score===0));
 assert.ok(renderRoundResults(view(room,p[0]).round,p).includes('no se reparten puntos'));
});

for(const type of ['speed','defend'])test(type+': empates y abstención total tienen veredicto explícito',()=>{
 for(const values of [['yes','no'],['pass','pass']]){
  const {room,players:p}=setup(type);act(room,p[0],'timer');act(room,p[0],'done');
  answer(room,p[1],values[0]);answer(room,p[2],values[1]);
  assert.equal(p[0].score,0);
  assert.ok(renderRoundResults(view(room,p[0]).round,p).includes(values[0]==='yes'?'Empate':'No hay veredicto'));
 }
});

test('El anfitrión puede terminar un reloj vencido, pero no uno en curso',()=>{
 const {room,players:p}=setup('speed');room.round.actor=p[1].id;
 act(room,p[1],'timer');assert.throws(()=>act(room,p[0],'done'));
 room.round.startedAt=Date.now()-9000;
 assert.throws(()=>act(room,p[2],'done'));act(room,p[0],'done');assert.equal(room.round.stage,'answer');
});

test('Una confesión continúa al salir el anfitrión si quedan suficientes jugadores',()=>{
 const {room,players:p}=setup('never');act(room,p[0],'leave');
 assert.equal(room.round.stage,'answer');answer(room,p[1],'yes');answer(room,p[2],'no');
 assert.equal(room.round.result.yes,1);assert.equal(room.round.result.no,1);
});

test('Se cancela una ronda que se queda por debajo de su mínimo de participantes',()=>{
 const {room,players:p}=setup('vote');act(room,p[2],'leave');
 assert.equal(room.round.result.skipped,true);act(room,p[0],'next');assert.equal(room.phase,'lobby');
});

test('Salir durante la votación del infiltrado invalida los votos a quien se fue',()=>{
 const {room,players:p}=setup('faker',4);room.round.faker=p[0].id;
 for(const x of p)answer(room,x,'Respuesta');answer(room,p[2],p[1].id);
 act(room,p[1],'leave');answer(room,p[0],p[2].id);answer(room,p[3],p[0].id);
 assert.equal(room.round.result.counts[p[1].id],undefined);
 assert.equal(room.round.result.ballots.find(b=>b.id===p[2].id).value,'pass');
});

test('La mezcla no repite juego seguido y todos los modos terminan con respuestas reales',()=>{
 for(const mode of modes.filter(m=>m.id!=='oca')){
  const {room,players:p}=setup(mode.id);let previous;
  for(let n=0;n<10;n++){
   if(mode.id==='mix')assert.notEqual(room.round.type,previous);previous=room.round.type;
   let guard=0;
   while(room.round.stage!=='results'&&guard++<8){
    const r=room.round;
    if(r.stage==='perform'){const actor=p.find(x=>x.id===r.actor);act(room,actor,'timer');act(room,actor,'done');continue;}
    for(const player of p){const visible=view(room,player).round;if(!visible.canAnswer)continue;
     let value;
     if(r.type==='bluff')value=r.stage==='vote'?visible.options.find(o=>!o.own)?.id||'pass':'Frase '+player.id;
     else if(r.type==='faker'&&r.stage==='answer')value='Respuesta '+player.name;
     else if(r.type==='ten')value='7';
     else if(['never','speed','defend'].includes(r.type))value='yes';
     else value=visible.eligible[0];
     answer(room,player,value);
    }
   }
   assert.equal(room.round.stage,'results',mode.id);
   assert.ok(renderRoundResults(view(room,p[0]).round,p).length>0);
   if(['match','paranoia'].includes(room.round.type))assert.equal(room.round.result.ballots,undefined);
   act(room,p[0],'next');
  }
  assert.equal(room.phase,'finished');
 }
});
test('367 entradas originales: 350 adaptadas y 17 excluidas, sin huecos',()=>{const ids=[...confessions.map(p=>p.id),...Object.keys(excluded).map(Number)].sort((a,b)=>a-b);assert.deepEqual(ids,Array.from({length:367},(_,i)=>i+1));assert.equal(new Set(confessions.map(p=>p.id)).size,350);assert.ok(confessions.every(p=>p.text&&[0,1,2].includes(p.level)));});
test('Bajo cuerda mantiene privada la pregunta antes de revelar',()=>{const {room,players}=setup('paranoia');const guest=view(room,players[1]);assert.equal(guest.round.prompt,null);assert.equal(guest.round.faker,undefined);answer(room,players[0],players[1].id);assert.equal(room.round.stage,'results');const result=view(room,players[1]);assert.equal(!!result.round.prompt,result.round.result.showQuestion);assert.equal(result.round.result.target,players[1].id);});
test('Cruce de miradas solo devuelve matches mutuos',()=>{const {room,players:p}=setup('match');answer(room,p[0],p[1].id);answer(room,p[1],p[0].id);answer(room,p[2],p[0].id);const result=view(room,p[2]);assert.equal(result.round.result.pairs.length,1);assert.equal(result.round.answers,undefined);assert.equal(result.round.result.counts,undefined);assert.ok(!JSON.stringify(result).includes(p[0].hash));});
test('Confesiones con nombres al cierre y pasar',()=>{const {room,players:p}=setup('never');answer(room,p[0],'yes');answer(room,p[1],'no');answer(room,p[2],'pass');assert.equal(view(room,p[0]).round.result.yes,1);assert.deepEqual(room.round.result.ballots,p.map((x,i)=>({id:x.id,value:['yes','no','pass'][i]})));assert.equal(view(room,p[1]).round.answers,undefined);assert.ok(p.every(p=>p.score===0));});
test('Infiltrado no recibe la pregunta y la identidad permanece privada',()=>{const {room,players}=setup('faker');const faker=players.find(p=>p.id===room.round.faker);assert.equal(view(room,faker).round.prompt,null);assert.ok(!Object.hasOwn(view(room,players.find(p=>p!==faker)).round,'faker'));for(const p of players)answer(room,p,'Una respuesta de '+p.name);assert.equal(room.round.stage,'vote');for(const p of players)answer(room,p,p===faker?'pass':faker.id);assert.equal(room.round.stage,'results');assert.equal(room.round.result.caught,true);assert.equal(faker.score,0);assert.ok(players.filter(p=>p!==faker).every(p=>p.score===1));});
test('Mucho cuento separa verdad, mentiras y votos, fusionando duplicados',()=>{const {room,players:p}=setup('bluff');answer(room,p[0],'Una verdad');assert.equal(room.round.stage,'bluff');assert.equal(view(room,p[1]).round.answers,undefined);answer(room,p[1],'Una mentira');answer(room,p[2],'UNA MENTIRA');assert.equal(room.round.stage,'vote');assert.equal(room.round.options.length,2);const truth=room.round.options.find(o=>o.truth);assert.ok(view(room,p[1]).round.options.every(o=>!Object.hasOwn(o,'truth')));const lie=room.round.options.find(o=>!o.truth);assert.throws(()=>answer(room,p[1],lie.id));answer(room,p[1],truth.id);answer(room,p[2],truth.id);assert.equal(room.round.result.truth,'Una verdad');assert.equal(p[1].score,2);});
test('Mucho cuento se puede pasar en el turno de verdad',()=>{const {room,players:p}=setup('bluff');answer(room,p[0],'pass');assert.equal(room.round.stage,'results');assert.equal(room.round.result.skipped,true);});
for(const type of ['speed','defend'])test(type+': cronómetro, votación y puntos',()=>{const {room,players:p}=setup(type);assert.throws(()=>act(room,p[1],'timer'));act(room,p[0],'timer');assert.ok(room.round.startedAt);act(room,p[0],'done');answer(room,p[1],'yes');answer(room,p[2],'yes');assert.equal(room.round.result.success,true);assert.equal(p[0].score,2);});
test('Notas de cero a diez y validación del rango',()=>{const {room,players:p}=setup('ten');assert.throws(()=>answer(room,p[0],'11'));answer(room,p[0],'10');answer(room,p[1],'0');answer(room,p[2],'pass');assert.equal(room.round.result.average,5);});
test('Votos no se duplican; rechaza autovotos y acciones de no anfitriones',()=>{const {room,players:p}=setup('vote');assert.throws(()=>answer(room,p[0],p[0].id));assert.throws(()=>act(room,p[1],'next'));answer(room,p[0],p[1].id);answer(room,p[0],p[2].id);assert.equal(room.round.answers[p[0].id],p[1].id);assert.throws(()=>mutate(room,p[0],'answer',{roundId:'anterior',value:p[1].id}));});
test('Entrada tardía espera a la siguiente ronda; salida del anfitrión transfiere control',()=>{const {room,players:p}=setup('paranoia');mutate(room,null,'join',{name:'Nueva',token:token()});assert.equal(view(room,room.players[3]).round.participant,false);act(room,p[0],'leave');assert.equal(room.host,p[1].id);assert.equal(room.round.stage,'results');act(room,p[1],'next');assert.equal(room.round.participants.length,3);});
test('Los diez modos pueden completar diez rondas sin bloqueo',()=>{for(const mode of modes.filter(m=>m.id!=='oca')){const {room}=setup(mode.id);for(let round=1;round<=10;round++){let safety=0;while(room.round.stage!=='results'&&safety++<8){if(room.round.stage==='perform'){const actor=room.players.find(p=>p.id===room.round.actor);act(room,actor,'done',{skip:true});}else for(const p of room.players){if(view(room,p).round.canAnswer)answer(room,p,'pass');}}assert.equal(room.round.stage,'results',mode.id);act(room,room.players[0],'next');}assert.equal(room.phase,'finished',mode.id);}});
test('Autenticación por token y motes únicos',()=>{const {room}=setup();assert.throws(()=>authenticate(room,token()));assert.throws(()=>mutate(room,null,'join',{name:'persona 1',token:token()}));});
test('API: salas sincronizadas, escrituras simultáneas y reintentos idempotentes',async()=>{
 const server=createServer(handler);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port+'/api/game';
 async function call(t,data){const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+t},body:JSON.stringify({requestId:randomUUID(),...data})});const body=await res.json();assert.equal(res.status,200,JSON.stringify(body));return body;}
 try{const tokens=Array.from({length:10},token);const created=await call(tokens[0],{action:'create',name:'Host',adult:true});const code=created.code;
 await Promise.all(tokens.slice(1).map((t,i)=>call(t,{action:'join',code,name:'Invitado '+i,adult:true})));
 let state=await call(tokens[0],{action:'select',code,mode:'never',level:1});assert.equal(state.players.length,10);state=await call(tokens[0],{action:'start',code});
 const roundId=state.round.id;
 await Promise.all(tokens.map(t=>call(t,{action:'answer',code,roundId,value:'yes'})));
 const current=await fetch(url+'?code='+code,{headers:{Authorization:'Bearer '+tokens[0]}}).then(r=>r.json());assert.equal(current.round.result.yes,10);
 const req={action:'next',code,roundId,requestId:'repeat-next'};const next=await call(tokens[0],req);const repeat=await call(tokens[0],req);assert.equal(next.round.id,repeat.round.id);assert.equal(repeat.roundNumber,2);
 const forbidden=await fetch(url+'?code='+code,{headers:{Authorization:'Bearer '+token()}});assert.equal(forbidden.status,401);
 const bad=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:'{'});assert.equal(bad.status,400);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
