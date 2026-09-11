const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={flag:'⚑',dice:'⚄',cup:'♧',ice:'❄',rest:'☾',chat:'☏',shield:'◇',swap:'⇄',heart:'♡',back:'↶',crown:'♛',fire:'♨',vote:'☞',jump:'↗',star:'☆',moon:'☾',book:'▤',gift:'✧',coin:'◉',lock:'▣',eye:'◎',bottle:'↻',clock:'◷'};
const dice=['','⚀','⚁','⚂','⚃','⚄','⚅'];
const button=(text,action,disabled=false,cls='')=>`<button type="button" data-action="${action}" class="${cls}" ${disabled?'disabled':''}>${text}</button>`;
export function boardCoordinates(){
 // Clockwise rectangular spiral: a continuous route, never a row-major jump.
 const cells=[];let left=0,right=7,top=0,bottom=7;
 while(left<=right&&top<=bottom){
  for(let y=top;y<=bottom;y++)cells.push([left,y]);left++;
  for(let x=left;x<=right;x++)cells.push([x,bottom]);bottom--;
  if(left<=right){for(let y=bottom;y>=top;y--)cells.push([right,y]);right--;}
  if(top<=bottom){for(let x=right;x>=left;x--)cells.push([x,top]);top++;}
 }
 return cells.slice(0,52);
}
export function renderOca(state,selectedCell=null,{zoom=false}={}){
 const g=state.oca,finished=state.phase==='board-finished',mine=g.actor===state.me,host=state.host===state.me;
 const name=id=>esc(g.players.find(p=>p.id===id)?.name||'Alguien que salió');
 const token=id=>{const p=g.players.find(x=>x.id===id);return `<span class="oca-token oca-token-${p.color}" title="${name(id)}" aria-label="Ficha de ${name(id)}"><img src="/assets/oca/pawn.webp" width="64" height="80" alt=""><span class="oca-token-number">${p.color+1}</span></span>`;};
 const selected=g.cells[selectedCell??g.last?.landed??0]||g.cells[0];
 const current=g.stage==='challenge'?g.cells[g.last.landed]:null;
 const effect=c=>c.gooseTo?`Oca → ${c.gooseTo}. Vuelves a tirar.`:c.skip?`Pierdes ${c.skip} ${c.skip===1?'turno':'turnos'}.`:c.goto!==undefined?`Salto al ${c.goto}.`:c.back?`Retrocedes ${c.back}.`:c.coin?'Cara: 2 tragos · cruz: 1 trago.':c.repeat?'Vuelves a tirar.':'';
 const card=c=>`<p class="eyebrow">CASILLA ${c.id}${c.gooseTo?' · OCA':''}</p><h2>${esc(c.title)}</h2><p>${esc(c.text)}</p>${effect(c)?`<p class="oca-effect">${effect(c)}</p>`:''}`;
 const tone=c=>c.id===0?'start':c.id===51?'finish':c.skip?'rest':c.goto!==undefined||c.back?'travel':['heart','fire'].includes(c.icon)?'kiss':['cup','coin'].includes(c.icon)?'drink':c.icon==='shield'?'safe':'challenge';
 const coords=boardCoordinates();
 const route=coords.map(([x,y],i)=>`${i?'L':'M'}${x*100+50},${y*100+50}`).join(' ');
 const routeArrows=coords.slice(0,-1).map(([x,y],i)=>{
  const [nx,ny]=coords[i+1],dx=nx-x,dy=ny-y,mx=(x+nx)*50+50,my=(y+ny)*50+50;
  return `<path d="M${mx-dx*7+dy*7},${my-dy*7-dx*7} L${mx+dx*5},${my+dy*5} L${mx-dx*7-dy*7},${my-dy*7+dx*7}"/>`;
 }).join('');
 const road=`<svg class="oca-route" viewBox="0 0 800 800" aria-hidden="true"><path class="oca-route-road" d="${route}"/><path class="oca-route-line" d="${route}"/><g class="oca-route-arrows">${routeArrows}</g></svg>`;

 const board=`<div class="oca-board-frame ${zoom?'is-zoomed':''}"><div class="oca-board-toolbar"><span>EL TABLERO</span>${button(zoom?'Reducir ↙':'Ampliar ↗','oca_zoom',false,'oca-zoom-button')}</div><div class="oca-board-scroll"><div class="oca-board" aria-label="Tablero de la oca: salida, 50 pruebas y meta">${g.cells.map((c,i)=>{
  const [x,y]=coords[i],next=coords[i+1];const arrow=!next?'⚑':next[0]>x?'→':next[0]<x?'←':next[1]>y?'↓':'↑';
  const occupants=g.order.filter(id=>g.positions[id]===i);
  const linked=[coords[i-1],coords[i+1]].filter(Boolean);
  const walls=[['left',-1,0],['right',1,0],['top',0,-1],['bottom',0,1]].filter(([,dx,dy])=>!linked.some(([lx,ly])=>lx===x+dx&&ly===y+dy)).map(([side])=>'oca-wall-'+side).join(' ');
  return `<button type="button" class="oca-cell ${walls} oca-tile-${tone(c)} oca-x-${x+1} oca-y-${y+1} ${c.gooseTo?'goose':''} ${c.skip?'penalty':''} ${i===g.positions[g.actor]?'active':''} ${i===51?'finish':''}" data-cell="${i}" aria-label="Casilla ${i}: ${esc(c.title)}${occupants.length?'. '+occupants.map(name).join(', '):''}" aria-pressed="${selected.id===i}"><span class="oca-cell-number">${i===0?'SAL':i}<span aria-hidden="true">${arrow}</span></span><span class="oca-cell-icon" aria-hidden="true">${c.gooseTo?'🪿':icons[c.icon]}</span><span class="oca-cell-name">${esc(c.title)}</span><span class="oca-occupants">${occupants.slice(0,3).map(token).join('')}${occupants.length>3?`<span class="oca-overflow">+${occupants.length-3}</span>`:''}</span></button>`;
 }).join('')}${road}<div class="oca-board-center"><img src="/assets/games/oca.webp" width="160" height="160" alt=""><span>BEBERCIULES</span><strong>LA OCA</strong></div></div></div><div class="oca-board-key"><span class="key-kiss">Besos y retos</span><span class="key-drink">Tragos</span><span class="key-travel">Saltos</span><span class="key-rest">Esperas</span></div></div>`;
 const extra=g.last?.extra;
 const extraText=extra===null||extra===undefined?'':g.last.landed===37?`Ronda ${g.last.extraRolls}/10: la botella señala a ${name(extra)}.`:g.last.landed===28?`${extra==='cara'?'Cara: dos tragos.':'Cruz: un trago.'}`:`${name(g.last.actor)}: ${extra.die} · ${name(extra.opponent)}: ${extra.opponentDie}. ${extra.die===extra.opponentDie?'Empate. Volved a tirar.':'Bebe '+name(extra.die<extra.opponentDie?g.last.actor:extra.opponent)+'.'}`;
 const canExtra=current&&(current.id===28&&extra===null||current.id===37&&g.last.extraRolls<10||current.id===39&&(!extra||extra.die===extra.opponentDie));
 const opponentSelect=mine&&current?.id===39&&!extra?`<label for="oca-opponent">¿A quién retas?</label><select id="oca-opponent">${g.order.filter(id=>id!==g.actor).map(id=>`<option value="${id}">${name(id)}</option>`).join('')}</select>`:'';
 let controls='';
 if(finished)controls=`<div class="oca-winner"><p class="eyebrow">¡META!</p><h2>Ha ganado ${name(g.winner)}.</h2><p>El último trago va por ti.</p>${host?button('Volver a elegir juego','lobby',false,'primary'):'<p>Quien organiza puede abrir otra partida.</p>'}</div>`;
 else if(current)controls=`<div class="oca-challenge">${card(current)}${extraText?`<p class="oca-effect" role="status">${extraText}</p>`:''}${opponentSelect}<div class="actions">${mine&&canExtra?button(current.id===28?'Lanzar moneda':current.id===37?'Girar botella ('+(g.last.extraRolls+1)+'/10)':extra?'Desempatar':'Tirar los dos dados','oca_extra',false,'primary'):''}${mine||host?button(mine?'Prueba hecha →':'Cerrar prueba →','oca_complete',false,'primary')+button(mine?'Paso →':'Pasar prueba →','oca_pass',false,'secondary'):`<p>${name(g.actor)} está resolviendo la prueba.</p>`}</div></div>`;
 else controls=`<div class="oca-roll-controls">${button(mine?'Tirar el dado':'Turno de '+name(g.actor),'oca_roll',!g.canRoll,'primary')}${mine||host?button(mine?'Pasar mi turno':'Saltar este turno','oca_skip_turn',false,'secondary'):''}${!g.participant?'<p class="fine">Has llegado con la partida empezada. Puedes mirar el tablero; tendrás ficha en la siguiente.</p>':''}</div>`;
 return `<section class="oca"><div class="oca-turn"><div><p class="eyebrow">${finished?'PARTIDA TERMINADA':'TURNO '+g.turn}</p><h2>${finished?'Ya tenemos ganador':mine?'Te toca a ti':name(g.actor)}</h2>${!finished?`<p>${token(g.actor)} ${mine?'Tu ficha':name(g.actor)} · casilla ${g.positions[g.actor]}</p>`:''}</div><div class="oca-die" role="img" aria-label="${g.last?'Último dado: '+g.last.die:'Dado preparado'}">${dice[g.last?.die||0]||'⚄'}</div></div>${g.last?`<p class="oca-move" role="status">${name(g.last.actor)}: ${g.last.from} → ${g.last.landed}${g.last.landed!==g.last.to?' → '+g.last.to:''} · dado ${g.last.die}${g.last.bounced?' · rebote':''}${g.last.repeat?' · repite turno':''}</p>`:''}<div class="oca-players-strip" aria-label="Fichas de los jugadores">${g.order.map(id=>`<span class="oca-player-chip ${id===g.actor?'playing':''}">${token(id)}<span>${name(id)}${id===state.me?' · tú':''}</span><b>${g.positions[id]}</b></span>`).join('')}</div><div class="oca-layout"><div>${board}<p class="fine">Sigue la línea y las flechas: salida 0 → meta 51. Toca una casilla para leer su prueba.</p>${selectedCell!==null?`<div class="oca-inspect" id="oca-inspect" tabindex="-1">${card(selected)}</div>`:''}</div><div class="oca-side">${controls}<details class="oca-details"><summary>Fichas y posiciones · ${g.order.length}</summary><div class="oca-roster">${g.order.map(id=>`<div>${token(id)}<span>${name(id)}${id===state.me?' · tú':''}</span><strong>${g.positions[id]}${g.skips[id]?' · espera '+g.skips[id]:''}</strong></div>`).join('')}</div></details><details class="oca-details"><summary>Reglas de esta oca</summary><p>${esc(g.rules)}</p></details><details class="oca-details"><summary>Últimos movimientos</summary><ol class="oca-history">${g.history.map(e=>`<li>${e.kind==='move'?`${name(e.actor)}: ${e.from} → ${e.to} (dado ${e.die})${e.passed?' · pasó la prueba':''}`:e.kind==='rest'?`${e.ids.map(name).join(', ')} cumplen turnos de espera.`:`${name(e.actor)} ${e.kind==='left'?'ha salido':'ha pasado su turno'}.`}</li>`).join('')||'<li>Todavía no se ha tirado.</li>'}</ol></details>${host&&!finished?button('Cambiar de juego','lobby',false,'secondary'):''}</div></div></section>`;
}
