const memory = new Map();
export const isConfigured=()=>!!(process.env.SUPABASE_URL&&(process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY));
export function memoryStore(){return {
 async get(code){const row=memory.get(code);if(!row||row.expires<Date.now()){memory.delete(code);return null;}return structuredClone(row.state);},
 async commit(code,expected,state){const row=memory.get(code);if(row&&row.expires<Date.now())memory.delete(code);const current=memory.get(code);if(expected===-1?!!current:current?.state.version!==expected)return false;memory.set(code,{state:structuredClone(state),expires:Date.now()+21600000});return true;}
};}
async function request(path,options={}){
 const key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
 const headers={apikey:key,'Content-Type':'application/json'};
 if(!key.startsWith('sb_secret_'))headers.Authorization='Bearer '+key;
 const response=await fetch(process.env.SUPABASE_URL.replace(/\/$/,'')+'/rest/v1/'+path,{...options,headers,signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Object.assign(new Error('No se pudo conectar con las salas. Revisa la configuración de Supabase y el SQL.'),{status:503});
 return response.status===204?null:response.json();
}
export function getStore(){
 if(isConfigured())return {
  async get(code){const rows=await request('beberciules_rooms?code=eq.'+code+'&expires_at=gt.'+encodeURIComponent(new Date().toISOString())+'&select=state');return rows[0]?.state||null;},
  async commit(code,expected,state){return request('rpc/beberciules_commit',{method:'POST',body:JSON.stringify({p_code:code,p_expected:expected,p_state:state})});}
 };
 if(process.env.VERCEL||process.env.NODE_ENV==='production')throw Object.assign(new Error('Falta conectar Supabase. Añade SUPABASE_URL y SUPABASE_SECRET_KEY en Vercel y ejecuta el SQL del proyecto.'),{status:503});
 return memoryStore();
}
