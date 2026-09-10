import {randomBytes} from 'node:crypto';
import {createRoom,authenticate,mutate,view,fail} from '../lib/game.js';
import {getStore,isConfigured} from '../lib/store.js';
import {modes} from '../lib/catalog.js';
async function bodyOf(req){
 if(req.body!==undefined){const b=typeof req.body==='string'?JSON.parse(req.body):req.body;if(JSON.stringify(b).length>4096)fail('La petición es demasiado grande.',413);return b;}
 let text='';for await(const chunk of req){text+=chunk;if(text.length>4096)fail('La petición es demasiado grande.',413);}return JSON.parse(text||'{}');
}
export default async function handler(req,res){
 res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store, private');res.setHeader('Vary','Authorization');
 try{
  if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');fail('Método no permitido.',405);}
  if(req.method==='GET'&&new URL(req.url,'http://local').searchParams.has('catalog'))return res.end(JSON.stringify({modes,storage:isConfigured()?'supabase':'local',configured:isConfigured()||!process.env.VERCEL}));
  const store=getStore();const data=req.method==='POST'?await bodyOf(req):Object.fromEntries(new URL(req.url,'http://local').searchParams);
  if(req.method==='POST'&&req.headers.origin){const host=req.headers.host;if(new URL(req.headers.origin).host!==host)fail('Origen no permitido.',403);}
  const token=(req.headers.authorization||'').replace(/^Bearer /,'');
  if(data.action==='create'){
   if(req.method!=='POST'||data.adult!==true)fail('Debes ser mayor de edad para jugar.');
   const room=createRoom(data.name,token);if(!await store.commit(room.code,-1,room))fail('Vuelve a intentar crear la sala.',409);
   return res.end(JSON.stringify(view(room,room.players[0])));
  }
  const code=String(data.code||'').toUpperCase();if(!/^[A-F0-9]{6}$/.test(code))fail('El código de sala tiene seis letras o números.');
  for(let attempt=0;attempt<12;attempt++){
   const room=await store.get(code);if(!room||!room.players.length)fail('Esta sala no existe o ha caducado. Crea una nueva.',404);
   if(req.method==='GET'){const p=authenticate(room,token);return res.end(JSON.stringify(view(room,p)));}
   let player;if(data.action==='join'){if(data.adult!==true)fail('Debes ser mayor de edad para jugar.');mutate(room,null,'join',{name:data.name,token});player=authenticate(room,token);}
   else{
    player=authenticate(room,token);
    const requestId=typeof data.requestId==='string'?data.requestId.slice(0,64):randomBytes(12).toString('hex');
    const op=player.id+':'+requestId;
    if(room.recent.includes(op))return res.end(JSON.stringify(view(room,player)));
    mutate(room,player,data.action,data);room.recent.push(op);room.recent=room.recent.slice(-100);
   }
   const expected=room.version;room.version++;
   if(await store.commit(code,expected,room))return res.end(JSON.stringify(data.action==='leave'?{left:true}:view(room,player)));
  }
  fail('Hay muchas respuestas a la vez. Vuelve a intentarlo.',409);
 }catch(error){res.statusCode=error.status||(error instanceof SyntaxError?400:500);res.end(JSON.stringify({error:error.status?error.message:error instanceof SyntaxError?'Petición no válida.':'No se pudo completar la acción. Inténtalo de nuevo.'}));}
}
