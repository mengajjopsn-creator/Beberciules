export const gameVisuals = {
 oca: {label:'Tablero y dados',color:'lime',detail:'De oca a oca, con vuestro grupo'},
 mix: {label:'La mezcla',color:'lime',detail:'Todos los juegos, una noche'},
 vote: {label:'Votación secreta',color:'lime',detail:'Señala y descubre'},
 paranoia: {label:'Pregunta secreta',color:'violet',detail:'Solo uno sabe la pregunta'},
 faker: {label:'Pilla al impostor',color:'violet',detail:'Responde, disimula, acusa'},
 bluff: {label:'Verdad o mentira',color:'violet',detail:'Que no te cuelen un cuento'},
 speed: {label:'Reto de 8 segundos',color:'lime',detail:'Tres respuestas contra reloj'},
 match: {label:'Tonteo mutuo',color:'pink',detail:'Solo se revelan los matches'},
 never: {label:'Yo nunca',color:'pink',detail:'Cada respuesta tiene nombre'},
 ten: {label:'Ponle nota',color:'lime',detail:'Del cero al diez, mójate'},
 defend: {label:'Reto de 15 segundos',color:'pink',detail:'Vende esa red flag'}
};
export function artwork(type,{className='',loading='lazy',size=160}={}){
 const safeType=Object.hasOwn(gameVisuals,type)?type:'mix';
 return `<img class="game-art ${className}" src="/assets/games/${safeType}.webp" width="${size}" height="${size}" alt="" loading="${loading}" decoding="async">`;
}
