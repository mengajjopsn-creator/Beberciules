const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function renderRoundResults(r,players){
 const result=r.result;
 const name=id=>esc(players.find(p=>p.id===id)?.name||result.names?.[id]||'Alguien que salió');
 const ballots=result.ballots||[];
 const names=ids=>ids.length?ids.map(name).join(', '):'Nadie';
 const row=(label,detail)=>`<div class="result result-detail"><span>${label}</span><strong>${detail}</strong></div>`;
 const panel=body=>`<div class="results">${body}</div>`;
 const note=text=>`<p class="waiting">${text}</p>`;
 const group=(label,value)=>{const ids=ballots.filter(b=>b.value===value).map(b=>b.id);return row(`${label} · ${ids.length}`,names(ids));};
 const abstentions=()=>panel(group('Han pasado','pass')+group('Sin responder',null));
 const voters=value=>names(ballots.filter(b=>b.value===value).map(b=>b.id));
 if(result.skipped)return note('Ronda pasada. Vamos a por otra.');
 if(r.type==='never')return panel(group('Sí, lo han hecho','yes')+group('Yo nunca','no'))+abstentions()+note('¿Quién quiere contar la historia? Compartir los detalles es opcional.');
 if(r.type==='match')return result.pairs.length?panel(result.pairs.map(pair=>row(`${name(pair[0])} + ${name(pair[1])}`,'¡MATCH!')).join(''))+note('Habéis coincidido. ¿Os sorprende? Las demás elecciones siguen siendo privadas.'):note('No hubo matches esta ronda. Las demás elecciones siguen siendo privadas.');
 if(r.type==='paranoia')return `<div class="card"><span class="tag">${name(r.actor)} ELIGIÓ A…</span><h2 class="question">${result.target?name(result.target):'Nadie'}</h2><p>${!result.target?'Turno sin elección.':result.showQuestion?'La moneda ha decidido revelar la pregunta. ¿Por qué esa persona?':'La moneda ha decidido guardar el secreto. Podéis especular, pero la pregunta sigue bajo llave.'}</p></div>`;
 if(r.type==='ten'){
  const ratings=ballots.filter(b=>b.value!==null&&b.value!=='pass').sort((a,b)=>Number(b.value)-Number(a.value));
  const spread=ratings.length>1&&Number(ratings[0].value)!==Number(ratings.at(-1).value);
  return `<div class="waiting"><div class="timer">${result.average??'—'}<small>/10</small></div><p>La nota del grupo · ${result.count} respuestas</p></div>`+panel(ratings.map(b=>row(name(b.id),`${b.value}/10`)).join(''))+abstentions()+note(spread?'Las notas más alta y más baja: ¿qué os ha convencido y qué os echa para atrás?':ratings.length?'Parece que lo tenéis claro. ¿Dónde está vuestro límite?':'Sin notas, no hay media.');
 }
 if(['speed','defend'].includes(r.type))return `<div class="waiting"><h2>${result.noVotes?'No hay veredicto.':result.tied?'Empate: el reto queda sin punto.':result.success?'¡Lo ha conseguido!':'Esta vez no ha colado.'}</h2><p>${name(r.actor)}${result.success?' suma 2 puntos.':' no suma puntos.'}</p></div>`+panel(group('A favor','yes')+group('En contra','no'))+abstentions();
 if(r.type==='bluff')return `<div class="card"><span class="tag">LA VERDAD DE ${name(r.actor)}</span><h2 class="question">${esc(result.truth)}</h2></div>`+panel((r.options||[]).map(o=>row(`<b>${esc(o.text)}${o.truth?' ✓ Verdad':''}</b><br>De: ${names(o.authors||[])}<br>La eligieron: ${voters(o.id)}`,`${result.counts[o.id]||0} votos`)).join(''))+abstentions()+note('Acertar la verdad suma 2 puntos. Cada voto a una mentira suma 1 a cada autor de esa mentira.');
 const rows=Object.entries(result.counts||{}).sort((a,b)=>b[1]-a[1]);
 const top=rows.length?rows.filter(([,n])=>n===rows[0][1]).map(([id])=>id):[];
 let heading=r.type==='faker'?`<div class="waiting"><h2>Era ${name(result.faker)}.</h2><p>${result.noVotes?'Nadie ha votado: no se reparten puntos.':result.caught?'Habéis cazado al infiltrado. Cada acierto suma 1 punto.':'El infiltrado suma 2 puntos. Un empate no lo descubre; acertar su identidad suma 1 punto.'}</p></div>`:note(top.length?`${top.length>1?'Empate entre':'El grupo ha señalado a'} ${names(top)}. ¿Qué tenéis que decir?`:'No hubo votos esta ronda.');
 if(r.type==='faker')heading+=panel((r.responses||[]).map(b=>row(name(b.id),esc(b.text))).join(''));
 return heading+panel(rows.map(([id,count])=>row(`<b>${name(id)}</b><br>Le votaron: ${voters(id)}`,`${count} ${count===1?'voto':'votos'}`)).join(''))+abstentions();
}
