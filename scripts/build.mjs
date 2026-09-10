import {cp,mkdir,readFile,readdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
for(const directory of ['lib','api','public'])for(const file of await readdir(directory)){if(file.endsWith('.js'))execFileSync(process.execPath,['--check',directory+'/'+file],{stdio:'inherit'});}
const html=await readFile('public/index.html','utf8');
for(const match of html.matchAll(/(?:src|href)="(\/[^"?#]+)"/g))await readFile('public'+match[1]);
if(!html.includes('BEBERCIULES'))throw new Error('Falta el nombre de la aplicación.');
await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});
console.log('BEBERCIULES: sintaxis y recursos comprobados. Web preparada en dist/; API en api/.');
