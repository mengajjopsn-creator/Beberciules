import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve('public');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 try{
  if(req.url.startsWith('/api/game')) {const {default:handler}=await import('./api/game.js');return await handler(req,res);}
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+ '/'.replace('/',process.platform==='win32'?'\\':'/'))) {res.writeHead(403);return res.end();}
  res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(await readFile(file));
 }catch{res.writeHead(404);res.end('No encontrado');}
});
server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('BEBERCIULES: http://localhost:'+(process.env.PORT||3000)));

