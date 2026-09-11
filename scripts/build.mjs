import {cp,mkdir,readFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {modes} from '../lib/catalog.js';
import {gameVisuals} from '../public/visuals.js';
for(const directory of ['lib','api','public'])for(const file of await readdir(directory)){if(file.endsWith('.js'))execFileSync(process.execPath,['--check',directory+'/'+file],{stdio:'inherit'});}
const html=await readFile('public/index.html','utf8');
for(const match of html.matchAll(/(?:src|href)="(\/[^"?#]+)"/g))await readFile('public'+match[1]);
for(const mode of modes){
 if(!gameVisuals[mode.id])throw new Error('Falta la identidad visual de '+mode.id);
 const file=await readFile('public/assets/games/'+mode.id+'.webp');
 if(file.toString('ascii',0,4)!=='RIFF'||file.toString('ascii',8,12)!=='WEBP')throw new Error('Ilustración no válida: '+mode.id);
}
if(!html.includes('BEBERCIULES'))throw new Error('Falta el nombre de la aplicación.');
for(const asset of ['pawn','wood','board-photo']){
 const file=await readFile('public/assets/oca/'+asset+'.webp');
 if(file.toString('ascii',0,4)!=='RIFF'||file.toString('ascii',8,12)!=='WEBP')throw new Error('Recurso de oca no válido: '+asset);
}
await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});
console.log('BEBERCIULES: sintaxis, logo, favicons y las 11 ilustraciones comprobados. Web preparada en dist/; API en api/.');
