// Adaptación editorial de la batería facilitada por el usuario. Solo personas adultas.
// Los números conservan la correspondencia con el original; no se publica este archivo.
export const excluded = {1:'Coerción',37:'Coerción mediante alcohol',99:'Plataformas con edad indeterminada',115:'Lesiones',125:'Privacidad íntima de terceros',145:'Persona dormida',151:'Tema familiar sexual',175:'Actividad peligrosa al conducir',181:'Tema familiar sexual',211:'Coerción mediante alcohol',237:'Referencia animal sexual',274:'Coerción',275:'Coerción',328:'Expresión ambigua sin significado verificable',329:'Menores',330:'Menores',338:'Especular sobre la orientación ajena'};
const source = `
2|He estado con más de una persona en un mismo día.
3|Me ha atraído la madre o el padre de un amigo.
4|Me ha atraído un hermano adulto de un amigo.
5|He querido liarme con alguien presente.
6|He fantaseado con alguien que no me parecía atractivo.
7|He tenido sexo sin preservativo.
8|He terminado en la boca de alguien o alguien en la mía.
9|Me ha atraído la pareja de un amigo.
10|Me han pedido que fuera más despacio en la cama.
11|He dejado a alguien con las ganas.
12|Me han dejado con las ganas.
13|He discutido sobre hacerlo con la luz encendida o apagada.
14|Me he encontrado un pelo en la boca haciendo sexo oral.
15|He puesto los cuernos.
16|Me han puesto los cuernos.
17|He dudado de mi orientación sexual.
18|Me he liado con personas de distinto género en una misma noche.
19|Me he arrepentido de un beso inmediatamente después.
20|He tenido intimidad por pena en vez de por ganas.
21|He vuelto a acostarme con mi ex.
22|Me han pillado en pleno acto.
23|He tenido sexo en un lugar público.
24|Lo he hecho en la cama de otra persona.
25|He tenido sexo con más gente alrededor.
26|He hecho un trío.
27|He fantaseado con un trío con mi pareja y otra persona.
28|He usado un objeto para masturbarme.
29|Me he hecho daño sin querer al masturbarme.
30|Me ha decepcionado estar con alguien a quien tenía muchas ganas.
31|He practicado BDSM de mutuo acuerdo.
32|He intentado sexo anal y no ha salido bien.
33|He disfrutado del sexo anal.
34|He estado con alguien adulto al menos cinco años mayor que yo.
35|He tenido un encuentro íntimo en la universidad siendo adulto.
36|Me han hecho un chupetón en un sitio poco habitual.
38|He visto porno con otra persona.
39|Me he grabado en la intimidad con el consentimiento de todos.
40|Me he masturbado con una película que no era porno.
41|He tenido un gatillazo.
42|He tenido sexo durante la regla.
43|He querido liarme con más de dos personas presentes.
44|He usado un disfraz para cumplir una fantasía.
45|Me he liado con la persona con la que intentaba ligar un amigo.
46|Me lo he tragado.
47|Me he excitado en un momento inoportuno.
48|Se me ha roto un preservativo.
49|He pasado un año sin sexo después de haberlo probado.
50|He puesto o me han puesto un preservativo con la boca.
51|He incorporado comida a un encuentro íntimo.
52|He tenido sexo en una fiesta.
53|He comprado o tomado anticoncepción de emergencia.
54|He tenido sexo telefónico.
55|He corrido a buscar mi ropa porque llamaron al timbre.
56|He parado un encuentro para preguntar cómo se llamaba la otra persona.
57|He estado con el ex de un amigo.
58|He mentido a una pareja sobre mi experiencia sexual.
59|He necesitado una explicación para desabrochar un sujetador.
60|Siendo adulto, he fantaseado con un profesor de la universidad.
61|He pillado a mis padres en un momento íntimo.
62|Me he hecho fotos sin ropa siendo adulto.
63|He dicho un nombre equivocado en la cama.
64|He dado o recibido sexo oral anal.
65|He tenido sexo en la ducha.
66|He consultado el Kamasutra para probar posturas.
67|He estado con una persona adulta en su primera vez.
68|He mentido sobre si era mi primera vez.
69|He hecho un 69.
70|He borrado conversaciones de tonteo para ocultárselas a mi pareja.
71|He estado con alguien que no me atraía por no quedarme solo.
72|He tenido un susto relacionado con una ITS.
73|He fingido o exagerado un orgasmo.
74|He tenido una amistad con derecho a roce.
75|He salido de casa sin ropa interior.
76|He ligado con alguien de otro país.
77|He comparado mis genitales con los de otra persona.
78|Me he masturbado en casa de un amigo.
79|He dado o recibido sexo oral con preservativo.
80|He usado hielo en un encuentro íntimo.
81|He propuesto un fetiche y no ha interesado a mi pareja.
82|He intentado ocultar una erección sin éxito.
83|He disfrutado de juegos intensos previamente acordados en la cama.
84|Se me ha escapado un pedo durante el sexo, o a mi pareja.
85|He roto una prenda al quitársela a mi pareja.
86|He deseado que una pareja rompiera.
87|He hecho o recibido una cubana.
88|He visto hentai para masturbarme.
89|Siendo adulto, he aceptado un encuentro sexual por dinero libremente.
90|He usado o recibido más de tres dedos en un encuentro íntimo.
91|Lo he hecho en un coche aparcado y ha sonado la bocina.
92|He necesitado una foto para recordar con quién me había liado.
93|Me he depilado por si surgía algo y al final nada.
94|He fantaseado con unirme a dos amigos adultos.
95|He hecho una lista de las personas con las que me he liado.
96|He conseguido estar con un amor platónico.
97|He usado más de dos preservativos en un mismo encuentro.
98|He tenido sexo en todas las habitaciones de una casa.
100|He usado una app para ligar.
101|Me he dado cuenta de que me miraban durante un encuentro íntimo.
102|Me he liado con alguien presente.
103|He estado con alguien que me caía mal.
104|He terminado sobre el cuerpo de mi pareja, o al revés.
105|Me han dado una bofetada por intentar ligar.
106|Me he arrepentido de con quién fue mi primera vez.
107|He besado a alguien que acababa de vomitar.
108|Me ha atraído alguien adulto al menos cuatro años menor que yo.
109|He empezado una relación sabiendo que duraría poco.
110|Me he medido el pene.
111|He tenido sexo con nuestros padres cerca siendo ambos adultos.
112|He ligado para dar celos.
113|Me he resbalado durante el sexo en la ducha.
114|He dicho «te quiero» sin sentirlo para conseguir sexo.
116|He tenido un encuentro sexual malísimo.
117|Me he masturbado al menos cinco veces en un día.
118|He tenido un sueño húmedo.
119|He pensado que el sexo oral me daba asco.
120|He preferido el sexo oral a la penetración.
121|He pensado en otra persona durante el sexo.
122|He estado con alguien cuyo pene me parecía pequeño.
123|He usado preservativos de sabores.
124|He terminado dentro sin preservativo o han terminado dentro de mí.
126|He recurrido a la marcha atrás como anticonceptivo.
127|Me he liado con alguien que tenía pareja.
128|Me ha tirado la caña un familiar adulto de mi pareja.
129|He propuesto ser solo amigos después de liarnos.
130|Me he alegrado de algo malo que le pasó a un ex.
131|He tenido sexo más de cinco veces en un día.
132|Siendo adulto, me he liado con alguien de mi clase.
133|Me han hecho una cobra de verdad.
134|Me he arrepentido de un tatuaje.
135|Me ha dado más morbo hacerlo fuera de casa.
136|Me he quedado dormido durante un encuentro íntimo.
137|Me he pillado por alguien teniendo pareja.
138|He terminado una relación por incompatibilidad sexual.
139|He roto una cama durante el sexo.
140|Los vecinos se han quejado del ruido de un encuentro íntimo.
141|He acordado juegos de tirar del pelo con mi pareja.
142|He durado menos de diez minutos en la cama.
143|He estado con alguien que duró menos de diez minutos.
144|He tenido sexo tres veces seguidas o más.
146|He compartido intimidad en una videollamada entre adultos.
147|He creado una cuenta falsa para mirar las redes de un ex.
148|He acabado saliendo con alguien que antes solo me veía como amigo.
149|Mis padres me han descubierto un chupetón.
150|Tendría una relación con alguien presente si se diera el caso.
152|He practicado sexo oral profundo.
153|Me he sentido mal después de masturbarme.
154|He seguido un tonteo por pena.
155|Me ha excitado que me besaran o lamieran la cara.
156|He fingido otra nacionalidad para ligar.
157|He tenido una pareja de un origen étnico distinto al mío.
158|Me ha frustrado la intimidad con una persona a la que quería.
159|He participado en masturbación en grupo entre adultos.
160|Me he obsesionado con alguien después de un solo beso.
161|He lamido unos pezones.
162|Me han lamido los pezones.
163|Alguien presente solo me ha visto como amigo cuando yo quería más.
164|He dejado a alguien para salir con otra persona.
165|Me han dejado para salir con otra persona.
166|He tenido sexo estando enfermo.
167|Me ha atraído mi mejor amigo.
168|He tenido una preferencia clara entre culos y tetas.
169|He tenido pique con la nueva pareja de mi ex.
170|He pensado que me casaría con una pareja.
171|He soñado con alguien y me ha decepcionado despertarme.
172|He besado a alguien con muy mal aliento.
173|Me han hecho daño sin querer durante el sexo oral.
174|He tenido un susto de embarazo por un retraso.
176|He seguido un tonteo para que me invitaran a una copa.
177|Un juguete sexual me ha despertado curiosidad.
178|He tenido un sueño íntimo con alguien adulto presente.
179|He tenido curiosidad por estar con alguien de mi mismo género.
180|He comparado cómo sería estar con personas de distintos géneros.
182|Me ha sorprendido para mal un sabor durante el sexo oral.
183|Mi mascota ha interrumpido un encuentro íntimo.
184|Ha habido una confusión de agujero en un encuentro íntimo.
185|Me he masturbado antes de un encuentro para durar más.
186|He intentado imitar algo visto en un vídeo porno.
187|Me he vestido para llamar la atención de alguien y ha pasado de mí.
188|He reservado una habitación solo para un encuentro íntimo.
189|Fantasearía con un trío con adultos presentes.
190|He jugado a un juego con striptease voluntario.
191|He besado a alguien que besaba fatal.
192|He mirado el móvil durante el sexo.
193|He tenido sexo sin contacto visual.
194|El vello de otra persona ha cambiado mis ganas.
195|Me he reído durante el sexo.
196|He tonteado de broma y me ha salido bien.
197|He estado con el mejor amigo de mi ex.
198|He enviado fotos íntimas propias de adulto a alguien que quería recibirlas.
199|He pensado que alguien presente me estaba tirando la caña.
200|Alguien ha querido algo serio conmigo después de un rollo y yo no.
201|He tenido un rollo con alguien a quien nunca volví a ver.
202|He imaginado cómo sería alguien adulto presente sin ropa.
203|Alguien de mi clase de adultos me atraía al principio y luego dejó de hacerlo.
204|He experimentado squirting con mi pareja.
205|He tenido marcas tras juegos íntimos consentidos.
206|He dado o recibido un golpe juguetón con el pene, de mutuo acuerdo.
207|Me han tirado la caña para conseguir una copa.
208|He tenido sexo con música.
209|He pensado que alguien con quien ligué estaba fuera de mi alcance.
210|He salido decepcionado de una cita que prometía.
212|He mentido sobre mí para ligar.
213|He tenido sexo tras consumir alcohol o cannabis.
214|He cogido preservativos de un familiar sin pedirlos.
215|He llevado preservativos por si acaso y acabé regalándolos.
216|He jugado a roles en la cama.
217|He usado saliva como lubricante.
218|He repetido un rollo sin tener una relación.
219|He negado un beso que sí ocurrió.
220|He compartido cama con alguien que podía atraerme sin que pasara nada.
221|Me he liado con más de diez personas.
222|He amenazado con contar un secreto de alguien.
223|He ocultado a un amigo que su pareja le era infiel.
224|He pasado más de un mes sin masturbarme.
225|He ido directamente al sexo sin preliminares.
226|He preferido quedarme en los preliminares.
227|He parado un encuentro íntimo a mitad.
228|Me ha impresionado el tamaño de un pene.
229|He besado a alguien justo después de vomitar yo.
230|Me he dado cuenta de que me miraban mientras hacía pis.
231|He tenido arcadas durante el sexo oral.
232|Me ha puesto alguien que no me parecía atractivo.
233|He probado sexo oral bajo el agua.
234|He rechazado a un ex que quería repetir.
235|He tenido sexo en otro país.
236|Me he masturbado con una foto de una persona adulta.
238|He comprado algo en un sex shop.
239|He hecho un baile sensual a mi pareja.
240|Me he encarado con alguien por molestar a mi pareja.
241|Me han propuesto un reto de besar a alguien.
242|He fantaseado a solas con alguien que no era mi pareja.
243|He estado con alguien a quien deseaba cuando todavía tenía pareja.
244|He tenido sexo casi sin quitarme la ropa.
245|Un ex ha cambiado cómo define su orientación tras nuestra relación.
246|He hecho una cobra por venganza.
247|He excitado a alguien con un susurro.
248|He tenido sexo de reconciliación.
249|Volvería con un ex.
250|Repetiría un beso con alguien presente.
251|He mantenido una sola postura durante todo el encuentro.
252|He probado unas diez posturas en un encuentro.
253|He pasado un mes sin sexo teniendo pareja.
254|He terminado sobre mi propio cuerpo sin querer.
255|Me he excitado hasta temblar.
256|Se me ha dormido una parte del cuerpo durante el sexo.
257|Un objeto íntimo se ha quedado atascado.
258|He parado para comprobar que la otra persona estaba bien.
259|Me han propuesto un trío en serio.
260|He archivado un chat para ocultárselo a mi pareja.
261|He negado que me masturbara.
262|Me he excitado bailando con alguien en una fiesta.
263|Me han utilizado para dar celos.
264|He compartido cama con alguien y solo hubo besos.
265|Me han pillado rascándome los genitales en público.
266|He tenido sexo con los calcetines puestos.
267|He rechazado practicar sexo oral porque no me apetecía.
268|He ligado con un chico más bajo o una chica más alta que yo.
269|He tenido sexo con gafas.
270|He besado tras beber a alguien con quien no quería complicarme.
271|He tenido un complejo con mi cuerpo.
272|He tenido sexo antes de dormir y al despertar.
273|Alguien ha ligado conmigo suponiendo otra orientación sexual.
276|He recibido fotos íntimas de otra persona adulta.
277|Me han pillado mirando un escote.
278|Me ha atraído la idea de hacerlo sin preservativo.
279|He continuado después de un orgasmo.
280|Me ha atraído un hermano adulto de mi pareja o de un ex.
281|He dejado una mancha en la ropa o la cama tras un encuentro.
282|He preferido un rol dominante acordado en la cama.
283|Me he masturbado en una ducha ajena.
284|He contado un encuentro sexual nada más terminar.
285|He tenido sexo en una bañera.
286|He tenido sexo en el suelo.
287|Siendo adulto, me han pillado haciendo algo íntimo en un cine.
288|He tenido sexo esta última semana.
289|Me he masturbado hoy.
290|He sudado mucho durante el sexo.
291|He buscado consejos sobre sexo en internet.
292|He preferido estar debajo.
293|He preferido estar encima.
294|He salido con alguien a quien no quería.
295|Un amigo se ha liado con mi ex.
296|Alguien presente me ha hecho una cobra.
297|He hecho una cobra a alguien presente.
298|Me he masturbado en otro país.
299|He ligado gracias a la ayuda de un amigo.
300|He pensado que tendría algo con alguien presente sin ser correspondido.
301|Me he masturbado en privado mientras había amigos en casa.
302|He fantaseado con una persona adulta más joven que yo.
303|He tonteado sin intención de quedar.
304|Me he pillado por alguien con una orientación incompatible con la mía.
305|He imaginado que alguien presente sería muy bueno en la cama.
306|He vuelto con un ex.
307|He estado con alguien con quien había jurado que jamás estaría.
308|Me he arrepentido de pillarme por alguien presente.
309|Me he puesto ropa interior de otro género.
310|He tenido un orgasmo a la vez que mi pareja.
311|He tenido sexo en una cama individual.
312|He estado en una playa nudista.
313|He usado lubricante de sabores.
314|He usado un juguete sexual con mi pareja.
315|Me ha excitado practicar sexo oral.
316|Un amigo me ha oído durante un encuentro íntimo.
317|He oído a un amigo durante un encuentro íntimo.
318|He dejado manchas en una pared tras un encuentro íntimo.
319|Me he mirado en un espejo durante el sexo.
320|He dicho que no al sexo aunque mi pareja insistiera.
321|He hablado con mis padres de mi primera vez.
322|He cancelado una quedada para quedarme con un rollo.
323|Me he puesto celoso al ver a mi pareja hablar con su ex.
324|He preferido un rol sumiso acordado en la cama.
325|He pensado en una operación de pecho.
326|Me he hecho daño sin querer al cambiar de postura.
327|He probado algo que juraba que nunca haría.
331|He rendido menos en un deporte después de tener sexo.
332|He intentado ponerme un preservativo al revés.
333|He usado lubricantes de efecto frío o calor.
334|Un preservativo me ha resultado demasiado apretado.
335|Me he masturbado con preservativo.
336|He usado un antifaz en un encuentro acordado.
337|He perdido el equilibrio durante el sexo.
339|Alguien ha interrumpido un beso que estaba a punto de pasar.
340|He entrado en un club de alterne siendo adulto.
341|He tenido curiosidad por entrar en un club de alterne.
342|He enviado o recibido por accidente una foto íntima de adultos.
343|Me ha dado morbo estar con mi pareja adulta con los padres cerca.
344|Siendo adulto, he intentado no hacer ruido para que no nos oyeran los padres.
345|He probado una postura por complacer a mi pareja aunque no fuera mi favorita.
346|He sido incapaz de recrear una postura del Kamasutra.
347|He tenido un rollo para olvidar a otra persona.
348|Me ha tirado la caña un familiar adulto de un amigo.
349|He tenido menos deseo sexual que mi pareja.
350|He tenido más deseo sexual que mi pareja.
351|He empezado una relación menos de un mes después de una ruptura.
352|Me he liado con alguien que tenía un rollo con un amigo mío.
353|He descubierto que era el amor platónico de alguien.
354|He tenido agujetas después del sexo.
355|He ligado con alguien en otro país.
356|He acabado ligando con alguien distinto de quien me gustaba al llegar.
357|He dejado de masturbarme a mitad.
358|Me plantearía un trío con adultos de distintos géneros.
359|He pedido parar porque la intensidad era excesiva.
360|Un familiar ha encontrado un preservativo usado mío.
361|Me he excitado con una conversación por mensajes entre adultos.
362|Me ha tirado la caña la pareja de un amigo.
363|He estado con un hombre circuncidado.
364|Me han tirado la caña y no me he enterado.
365|Siendo adulto, he correspondido al tonteo de un profesor de universidad adulto.
366|He sentido envidia de la relación de un amigo.
367|He medido o pedido medir el pene de mi pareja.
`;
const light = new Set([19,76,95,96,100,109,112,129,133,134,148,154,156,160,167,169,170,171,172,187,191,195,196,199,200,201,209,210,212,219,220,234,240,241,246,249,263,268,271,294,299,303,306,307,312,323,327,339,347,351,353,355,356,364,366]);
const warm = new Set([3,4,5,9,11,12,15,16,17,18,21,30,43,45,57,70,74,75,86,93,102,103,108,127,128,130,132,137,147,149,150,163,164,165,176,178,179,197,207,215,218,221,223,245,250,259,260,264,270,273,280,284,295,296,297,300,304,308,316,317,322,348,352,362]);
export const confessions = source.trim().split('\n').map(line=>{const [id,text]=line.split('|');return {id:Number(id),text:'Yo nunca '+text[0].toLowerCase()+text.slice(1),level:light.has(+id)?0:warm.has(+id)?1:2};});

