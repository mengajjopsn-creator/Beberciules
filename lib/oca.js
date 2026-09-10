import {randomInt,randomBytes} from 'node:crypto';
import {ocaCells,ocaRules,ocaGoal} from '../public/oca-board.js';
const uid=()=>randomBytes(10).toString('hex');
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
export function startOca(room){
 room.round=null;room.phase='board';
 room.oca={turnId:uid(),turn:1,order:room.players.map(p=>p.id),actor:room.host,players:room.players.map((p,i)=>({id:p.id,name:p.name,color:i})),positions:Object.fromEntries(room.players.map(p=>[p.id,0])),skips:{},stage:'roll',last:null,history:[],winner:null};
}
function remember(g,event){g.history.unshift(event);g.history=g.history.slice(0,12);}
function nextTurn(g,repeat=false){
 let index=g.order.indexOf(g.actor);
 const skipped=[];
 if(!repeat){
  // Every penalty is finite (at most two turns), including when everybody is resting.
  for(let guard=0;guard<g.order.length*3+1;guard++){
   index=(index+1)%g.order.length;const id=g.order[index];
   if((g.skips[id]||0)>0){g.skips[id]--;skipped.push(id);continue;}break;
  }
 }
 g.actor=g.order[index];g.turn++;g.turnId=uid();g.stage='roll';
 if(skipped.length)remember(g,{kind:'rest',ids:skipped});
}
export function resolveOcaRoll(room,die){
 const g=room.oca;
 if(!Number.isInteger(die)||die<1||die>6)fail('Dado no válido.');
 const from=g.positions[g.actor];const raw=from+die;const landed=raw>ocaGoal?2*ocaGoal-raw:raw;
 const cell=ocaCells[landed];let to=landed;
 if(cell.goto!==undefined)to=cell.goto;
 if(cell.back)to=Math.max(0,landed-cell.back);
 if(cell.gooseTo)to=cell.gooseTo;
 if(cell.skip)g.skips[g.actor]=cell.skip;
 g.positions[g.actor]=to;
 g.last={actor:g.actor,die,from,landed,to,bounced:raw>ocaGoal,repeat:!!cell.repeat,extra:null,extraRolls:0,resolved:false,passed:false};
 g.stage='challenge';
 if(to===ocaGoal){g.winner=g.actor;g.stage='finished';room.phase='board-finished';remember(g,{...g.last,kind:'move'});}
}
export function mutateOca(room,player,action,data){
 const g=room.oca;
 if(room.phase!=='board'||!g)fail('La partida de oca ya no está en curso.',409);
 if(data.turnId!==g.turnId)fail('El turno ha cambiado. Actualizamos el tablero.',409);
 const actor=player.id===g.actor,host=player.id===room.host;
 if(action==='oca_roll'){
  if(!actor)fail('Ahora le toca a otra persona.',403);
  if(g.stage!=='roll')fail('Primero resuelve la casilla.',409);
  resolveOcaRoll(room,randomInt(1,7));return;
 }
 if(action==='oca_extra'){
  if(!actor||g.stage!=='challenge')fail('No es tu prueba.',403);
  const cell=ocaCells[g.last.landed];
  if(![28,37,39].includes(cell.id))fail('Esta casilla no tiene otra tirada.');
  if(cell.id===37){if(g.last.extraRolls>=10)return;const others=g.order.filter(id=>id!==g.actor);g.last.extra=others[randomInt(others.length)];g.last.extraRolls++;}
  else if(cell.coin){if(g.last.extra!==null)return;g.last.extra=randomInt(2)===0?'cara':'cruz';}
  else {
   if(g.last.extra&&g.last.extra.die!==g.last.extra.opponentDie)return;
   const opponent=g.last.extra?.opponent||data.opponent;
   if(!g.order.includes(opponent)||opponent===g.actor)fail('Elige a otra persona para el duelo.');
   g.last.extra={opponent,die:randomInt(1,7),opponentDie:randomInt(1,7)};
  }
  return;
 }
 if(action==='oca_complete'||action==='oca_pass'){
  if(!actor&&!host)fail('Solo quien juega o quien organiza puede cerrar la prueba.',403);
  if(g.stage!=='challenge')fail('Primero hay que tirar el dado.',409);
  g.last.resolved=true;g.last.passed=action==='oca_pass';remember(g,{...g.last,kind:'move'});nextTurn(g,g.last.repeat);return;
 }
 if(action==='oca_skip_turn'){
  if(!actor&&!host)fail('No puedes saltar este turno.',403);
  if(g.stage!=='roll')fail('Cierra primero la prueba de la casilla.');
  remember(g,{kind:'pass',actor:g.actor});nextTurn(g);return;
 }
 fail('Acción de oca desconocida.');
}
export function leaveOca(room,id){
 const g=room.oca;if(!g)return;
 const wasActor=g.actor===id;const oldIndex=g.order.indexOf(id);
 g.order=g.order.filter(x=>x!==id);delete g.positions[id];delete g.skips[id];
 if(room.phase!=='board')return;
 if(g.order.length<2){room.phase='lobby';room.oca=null;return;}
 if(wasActor){
  remember(g,{kind:'left',actor:id});g.actor=g.order[(oldIndex-1+g.order.length)%g.order.length];nextTurn(g);
 }
}
export function viewOca(room,player){
 const g=room.oca;
 return {...g,cells:ocaCells,rules:ocaRules,participant:g.order.includes(player.id),canRoll:room.phase==='board'&&g.stage==='roll'&&g.actor===player.id};
}
