import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createServer} from 'node:http';
import {createRoom,mutate,view} from '../lib/game.js';
import {resolveOcaRoll} from '../lib/oca.js';
import {ocaCells,ocaGoal} from '../public/oca-board.js';
import {boardCoordinates,renderOca} from '../public/oca-ui.js';
import handler from '../api/game.js';
function setup(n=3){
 const tokens=Array.from({length:n},()=>randomUUID()+randomUUID());const room=createRoom('Jugador 1',tokens[0]);
 for(let i=1;i<n;i++)mutate(room,null,'join',{name:'Jugador '+(i+1),token:tokens[i]});
 mutate(room,room.players[0],'select',{mode:'oca'});mutate(room,room.players[0],'start');return {room,p:[...room.players],tokens};
}
const act=(room,p,action,data={})=>mutate(room,p,action,{turnId:room.oca?.turnId,...data});
function land(room,position){room.oca.positions[room.oca.actor]=position-1;resolveOcaRoll(room,1);}

test('Oca: salida, 50 pruebas y meta forman una espiral continua, con todas las pruebas',()=>{
 assert.equal(ocaCells.length,52);assert.deepEqual(ocaCells.map(c=>c.id),Array.from({length:52},(_,i)=>i));
 const xy=boardCoordinates();assert.equal(xy.length,52);assert.equal(new Set(xy.map(String)).size,52);
 for(let i=1;i<xy.length;i++)assert.equal(Math.abs(xy[i][0]-xy[i-1][0])+Math.abs(xy[i][1]-xy[i-1][1]),1);
 assert.ok(ocaCells.every(c=>c.text&&c.title));assert.equal(ocaCells[31].skip,1);assert.equal(ocaCells[47].goto,undefined);
});

test('Oca: el camino dibujado abre paso entre casillas consecutivas y cierra los laterales',()=>{
 const {room,p}=setup();const html=renderOca(view(room,p[0]));const coords=boardCoordinates();
 for(let i=0;i<coords.length;i++){
  const cell=html.match(new RegExp('<button[^>]+class="([^"]+)"[^>]+data-cell="'+i+'"'));
  assert.ok(cell);const [x,y]=coords[i];const neighbors=[coords[i-1],coords[i+1]].filter(Boolean);
  for(const [side,dx,dy]of [['left',-1,0],['right',1,0],['top',0,-1],['bottom',0,1]]){
   const isPassage=neighbors.some(([nx,ny])=>nx===x+dx&&ny===y+dy);
   assert.equal(cell[1].includes('oca-wall-'+side),!isPassage,`Casilla ${i}, ${side}`);
  }
 }
 assert.ok(html.includes('class="oca-route"'));assert.ok(html.includes('/assets/oca/pawn.webp'));
});

test('Oca: solo quien tiene turno tira, el dado viene del servidor y no admite doble tirada',()=>{
 const {room,p}=setup();assert.equal(room.phase,'board');assert.equal(room.round,null);
 assert.equal(view(room,p[0]).oca.canRoll,true);assert.equal(view(room,p[1]).oca.canRoll,false);
 assert.throws(()=>act(room,p[1],'oca_roll'),/otra persona/);
 const turnId=room.oca.turnId;mutate(room,p[0],'oca_roll',{turnId,die:999});
 assert.ok(room.oca.last.die>=1&&room.oca.last.die<=6);assert.equal(room.oca.stage,'challenge');
 assert.throws(()=>act(room,p[0],'oca_roll'));assert.throws(()=>act(room,p[1],'oca_complete'));
 act(room,p[0],'oca_complete');assert.notEqual(room.oca.turnId,turnId);
 assert.throws(()=>mutate(room,p[0],'oca_roll',{turnId}),/turno ha cambiado/);
});

test('Oca: rebote al sobrepasar la meta y victoria exacta, sin diez rondas',()=>{
 const {room,p}=setup();room.oca.positions[p[0].id]=50;resolveOcaRoll(room,3);
 assert.equal(room.oca.positions[p[0].id],49);assert.equal(room.oca.last.bounced,true);assert.equal(room.phase,'board');
 act(room,p[0],'oca_complete');room.oca.positions[room.oca.actor]=50;resolveOcaRoll(room,1);
 assert.equal(room.phase,'board-finished');assert.equal(room.oca.winner,room.oca.actor);assert.equal(room.oca.positions[room.oca.winner],51);
 assert.throws(()=>act(room,p[0],'oca_roll'));assert.ok(renderOca(view(room,p[0])).includes('Ha ganado'));
});

test('Oca: la casilla 1 repite tirada; no se inventan saltos de oca',()=>{
 const {room,p}=setup();land(room,1);act(room,p[0],'oca_pass');assert.equal(room.oca.actor,p[0].id);assert.equal(room.oca.stage,'roll');
 assert.ok(ocaCells.every(c=>c.gooseTo===undefined));
});

test('Oca: posada, cárcel y todos esperando consumen el número correcto de turnos',()=>{
 for(const [square,turns]of [[18,1],[29,1],[31,1]]){
  const {room,p}=setup(2);land(room,square);act(room,p[0],'oca_complete');assert.equal(room.oca.actor,p[1].id);
  for(let i=0;i<turns;i++){act(room,p[1],'oca_skip_turn');assert.equal(room.oca.actor,p[1].id);}
  act(room,p[1],'oca_skip_turn');assert.equal(room.oca.actor,p[0].id);assert.equal(room.oca.skips[p[0].id],0);
 }
 const {room,p}=setup(2);room.oca.skips={[p[0].id]:2,[p[1].id]:2};act(room,p[0],'oca_skip_turn');
 assert.equal(room.oca.stage,'roll');assert.equal(room.oca.skips[p[0].id],0);assert.equal(room.oca.skips[p[1].id],0);
});

test('Oca: atajos y retrocesos no encadenan pruebas; la curva no vuelve a salida',()=>{
 for(const [square,to]of [[13,8],[20,25],[30,35],[32,31],[40,45],[47,47]]){
  const {room,p}=setup();land(room,square);assert.equal(room.oca.positions[p[0].id],to);assert.equal(room.oca.last.landed,square);
  assert.equal(room.oca.skips[p[0].id]||0,0);
 }
});

test('Oca: moneda sin movimiento, diez rondas de botella y duelo con dos dados',()=>{
 const {room,p}=setup();land(room,28);act(room,p[0],'oca_extra');const coin=room.oca.last.extra;
 act(room,p[0],'oca_extra');assert.equal(room.oca.last.extra,coin);assert.equal(room.oca.positions[p[0].id],28);
 act(room,p[0],'oca_pass');assert.equal(room.oca.positions[p[0].id],28);
 const bottle=setup();land(bottle.room,37);
 for(let i=1;i<=10;i++){act(bottle.room,bottle.p[0],'oca_extra');assert.equal(bottle.room.oca.last.extraRolls,i);assert.ok(bottle.p.slice(1).some(x=>x.id===bottle.room.oca.last.extra));}
 act(bottle.room,bottle.p[0],'oca_extra');assert.equal(bottle.room.oca.last.extraRolls,10);
 const duel=setup();land(duel.room,39);assert.throws(()=>act(duel.room,duel.p[0],'oca_extra',{opponent:duel.p[0].id}));
 act(duel.room,duel.p[0],'oca_extra',{opponent:duel.p[1].id});
 const extra=duel.room.oca.last.extra;assert.equal(extra.opponent,duel.p[1].id);assert.ok(extra.die>=1&&extra.die<=6);assert.ok(extra.opponentDie>=1&&extra.opponentDie<=6);
 assert.ok(renderOca(view(duel.room,duel.p[0])).includes('Jugador 2'));
});

test('Oca: salir transfiere el turno y el mando; nuevos jugadores esperan otra partida',()=>{
 const {room,p}=setup();const token=randomUUID()+randomUUID();mutate(room,null,'join',{name:'Espectador',token});
 const guest=room.players.at(-1);assert.equal(view(room,guest).oca.participant,false);assert.throws(()=>act(room,guest,'oca_roll'));
 act(room,p[0],'leave');assert.equal(room.host,p[1].id);assert.equal(room.oca.actor,p[1].id);assert.equal(room.oca.positions[p[0].id],undefined);
 act(room,p[2],'leave');assert.equal(room.phase,'lobby');assert.equal(room.oca,null);
 mutate(room,p[1],'start');assert.equal(view(room,guest).oca.participant,true);
});

test('Oca: fichas de 20 personas, nombres escapados y sin tokens en las vistas',()=>{
 const {room,p,tokens}=setup(20);room.oca.players[0].name='<img src=x onerror=alert(1)>';
 const state=view(room,p[0]);const html=renderOca(state);
 assert.equal(state.oca.order.length,20);assert.ok(html.includes('+17'));assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<img src=x'));assert.ok(!html.includes('style='));assert.ok(html.includes('oca-x-1 oca-y-1'));
 for(const token of tokens)assert.ok(!JSON.stringify(state).includes(token));assert.ok(!JSON.stringify(state).includes(p[0].hash));
});

test('Oca: partidas completas y retorno a otros juegos sin estado residual',()=>{
 const {room,p}=setup();
 // Repeated sixes skip hazards and eventually hit the goal, independent of random API dice.
 for(let guard=0;room.phase==='board'&&guard<100;guard++){
  const actor=room.players.find(x=>x.id===room.oca.actor);const pos=room.oca.positions[actor.id];
  resolveOcaRoll(room,Math.min(6,ocaGoal-pos));if(room.phase==='board')act(room,actor,'oca_complete');
 }
 assert.equal(room.phase,'board-finished');mutate(room,p[0],'lobby');assert.equal(room.oca,null);
 mutate(room,p[0],'select',{mode:'never'});mutate(room,p[0],'start');assert.equal(room.round.type,'never');assert.equal(view(room,p[0]).oca,undefined);
});

test('Oca API: dos móviles comparten ficha y dado; reintentar una tirada no mueve dos veces',async()=>{
 const server=createServer(handler);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port+'/api/game';
 const tokens=Array.from({length:2},()=>randomUUID()+randomUUID());let code;
 async function call(i,data){const r=await fetch(base,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tokens[i]},body:JSON.stringify({code,requestId:randomUUID(),...data})});assert.equal(r.status,200);return r.json();}
 try{
  code=(await call(0,{action:'create',name:'A',adult:true})).code;await call(1,{action:'join',name:'B',adult:true});await call(0,{action:'select',mode:'oca'});
  const initial=await call(0,{action:'start'});const request={action:'oca_roll',turnId:initial.oca.turnId,requestId:'same-roll'};
  const [a,b]=await Promise.all([call(0,request),call(0,request)]);assert.deepEqual(a.oca.last,b.oca.last);
  const guest=await fetch(base+'?code='+code,{headers:{Authorization:'Bearer '+tokens[1]}}).then(r=>r.json());assert.deepEqual(guest.oca.positions,a.oca.positions);assert.equal(guest.oca.canRoll,false);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
