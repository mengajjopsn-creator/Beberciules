# BEBERCIULES

Juego de previa para adultos, diseñado primero para móvil. Cada persona entra con su nombre o mote. Quien crea la sala comparte el enlace y elige uno de once juegos. Hasta 20 participantes: diez modalidades de rondas y una oca con tablero propio.

## Publicar con GitHub, Vercel y Supabase

El repositorio es https://github.com/mengajjopsn-creator/Beberciules . Vercel sirve la web y la API; Supabase conserva el estado compartido. No hacen falta Supabase Auth, Realtime, tarjetas, correos ni contraseñas para los jugadores.

1. Crea un proyecto en https://supabase.com/dashboard y espera a que termine de prepararse.
2. Abre **SQL Editor → New query**, pega **todo** `docs/supabase.sql` y pulsa **Run**. Crea la tabla de salas y una función para guardar respuestas simultáneas sin pisarlas. Se puede ejecutar de nuevo.
3. Copia la **Project URL** desde **Connect**. En **Settings → API Keys**, crea o copia una clave **secret** (`sb_secret_...`). No uses la publishable/anon key.
4. En Vercel, abre el proyecto vinculado a este repositorio y ve a **Settings → Environment Variables**. Añade:

   | Variable | Valor |
   | --- | --- |
   | `SUPABASE_URL` | `https://TU-PROYECTO.supabase.co` |
   | `SUPABASE_SECRET_KEY` | Tu clave `sb_secret_...` |

   Marca **Production** y **Preview**. Nunca añadas el prefijo `NEXT_PUBLIC_`. Si tu proyecto solo tiene claves heredadas, usa `SUPABASE_SERVICE_ROLE_KEY` con su clave `service_role` en lugar de `SUPABASE_SECRET_KEY`.
5. En **Settings → Build and Deployment**, selecciona **Other** como framework y la raíz del repositorio. El archivo `vercel.json` ya configura `npm run build` y el directorio `dist`. Si existen overrides antiguos, restáuralos para usar esta configuración.
6. Vercel desplegará cuando reciba el push. Si añadiste las variables después, abre **Deployments → último despliegue → Redeploy**.
7. Abre tu enlace de Vercel, escribe un mote, confirma que eres adulto y pulsa **Crear sala**. Pulsa **Invitar** y comparte el enlace. Los amigos escriben su mote y pulsan **Unirme**. También pueden introducir el código de seis caracteres.

La sincronización se consulta cada 2,5 segundos con la pestaña visible. Son peticiones a Vercel y Supabase: el consumo depende de la duración y el número de móviles; no se presupone ningún plan gratuito concreto.

## Juegos

| Nombre | Mecánica |
| --- | --- |
| La oca | Tablero de la foto: 50 pruebas y meta, dado, fichas y turnos compartidos. |
| Modo previa | Mezcla aleatoria de los modos disponibles según el grupo. |
| El señalado | Votos ocultos hasta el cierre; se revelan destinatarios, votantes y empates. |
| Bajo cuerda | Solo quien tiene turno recibe la pregunta; el servidor sortea si la revela al grupo. |
| El infiltrado | Una persona responde sin conocer la pregunta; después todos votan. |
| Mucho cuento | Una respuesta verdadera, mentiras del grupo y votación. |
| Sin pensarlo | Tres respuestas en ocho segundos; el grupo juzga. |
| Cruce de miradas | Elecciones secretas; solo se revelan coincidencias mutuas. |
| Aquí se confiesa | 350 preguntas adaptadas de la batería original. Nombres agrupados por sí, no y paso; ausencias separadas. |
| Tiene un pero | Notas individuales de cero a diez y media del grupo. |
| Defiende lo indefendible | Quince segundos para defender una red flag; después votación. |

Las rondas de habilidad y deducción dan puntos. Confesiones, matches y señalamientos no premian ni penalizan experiencias personales. No hay penalización por pasar ni obligación de beber.

## Privacidad y funcionamiento

- Las claves de Supabase solo existen en el servidor. La tabla tiene RLS y no concede acceso a `anon` ni `authenticated`.
- Cada móvil recibe únicamente su vista autorizada; las preguntas secretas y respuestas ajenas pendientes no se envían al navegador.
- El mote no sirve como contraseña: se utiliza un token aleatorio, guardado por pestaña en `sessionStorage`, y su hash en el servidor. Recargar la misma pestaña recupera la sesión. Cerrar la pestaña puede perderla; un mote distinto permite volver a entrar.
- Al salir mediante el botón, si organizabas, el primer participante restante recibe el control. Si quien organiza cierra la pestaña sin salir, tendrá que reabrirla para continuar; esta versión no transfiere el control por ausencia.
- Quien llega a mitad de ronda participa en la siguiente. El anfitrión puede cerrar un turno con las respuestas disponibles o volver al selector.
- Las salas dejan de ser accesibles tras seis horas sin cambios. Las filas caducadas se eliminan en la siguiente escritura de cualquier sala; no hay un cron de eliminación inmediata. Las respuestas de una ronda se reemplazan al comenzar la siguiente.
- El archivo de preguntas está en el servidor y mantiene los números originales. `excluded` documenta 17 exclusiones; las 350 restantes están corregidas/adaptadas y repartidas por intensidad. Las referencias de edad se limitan a personas adultas. No hay referencias locales a Madrid.
- Cualquiera con el enlace puede solicitar entrar hasta el límite de 20. Pensado para un grupo privado; no hay moderación, expulsión ni panel público.

## Desarrollo local

Necesita Node.js 22 o superior. No tiene dependencias externas.

```sh
npm run dev
npm test
npm run build
```

Abre http://localhost:3000. Sin `.env`, el servidor local conserva salas en memoria mientras está encendido. Para probar desde móviles, usa el despliegue HTTPS de Vercel: las sesiones utilizan las funciones criptográficas del navegador que requieren un contexto seguro. En producción **nunca** se usa memoria como sustituto de Supabase: una configuración incompleta muestra un error explícito.

Para probar la base de datos real, copia `.env.example` como `.env` y rellena las dos variables. No subas `.env` al repositorio.

## Comprobaciones

`npm test` verifica los diez modos, privacidad de preguntas y matches, autenticación, validación de votos, cierre de diez rondas, traspaso explícito de anfitrión, llegadas tardías y diez respuestas concurrentes mediante HTTP. `npm run build` valida sintaxis y referencias antes de copiar solo los archivos públicos.

Las pruebas de integración locales usan almacenamiento en memoria con control de versiones; la conexión real a Supabase necesita el SQL y las variables del proyecto. La integración WebMCP es opcional: expone únicamente un resumen de la partida y se omite en navegadores que no la soportan.

## Si algo falla

- **Falta conectar Supabase:** comprueba los nombres de las variables, su entorno en Vercel y haz Redeploy.
- **No se pudo conectar con las salas:** comprueba la URL, que la clave sea secreta y que ejecutaste el SQL completo. Una publishable key no tiene acceso a esta tabla.
- **Sala caducada:** crea una nueva; expiran tras seis horas sin cambios.
- **Mote ya pillado:** cambia el mote o vuelve a la pestaña original.
- **Web antigua:** revisa que el último commit haya terminado de desplegar y recarga la página.

Referencias oficiales: https://vercel.com/docs/functions/runtimes/node-js , https://supabase.com/docs/guides/getting-started/api-keys , https://supabase.com/docs/guides/database/functions .


## Identidad visual

Logo propio: una B formada por dos vasos brindando, en verde lima, violeta y rosa. Se usa en la cabecera, la entrada y los favicons PNG/ICO; también se incluye un icono Apple Touch. El logo original está en `public/assets/brand/logo.png`.

Cada juego tiene una ilustración 3D original en `public/assets/games/`. Se reutiliza en sus preguntas y retos para reconocer la modalidad; no se genera una imagen por cada pregunta de la batería. Las once imágenes WebP están optimizadas para móvil, y las tarjetas fuera de la primera pantalla usan carga diferida. Los prompts y archivos están documentados en `docs/visual-assets.json`; se usó la herramienta integrada de generación de imágenes.

La interfaz permite elegir claramente entre crear sala y unirse, muestra participantes con iniciales, tarjetas ilustradas, el juego seleccionado junto al botón de inicio, progreso de diez rondas y controles adaptados al móvil.

## La oca

El recorrido va de salida (0) a meta (51), con 50 pruebas basadas en la foto aportada. Se gana llegando exactamente; el exceso de dado rebota. No se mezcla con los juegos de diez rondas. El servidor genera los dados, la moneda y las diez rondas de botella; cada móvil recibe las mismas fichas y el mismo turno. El duelo permite elegir contrincante y tira un dado por persona.

La casilla 1 repite tirada, las posadas 18 y 29 y la cárcel 31 hacen perder un turno. Los atajos 20→25, 30→35 y 40→45, y los retrocesos 13 y 32 son automáticos. No se añaden saltos de oca ni vuelta a salida en la curva peligrosa: no aparecen en la foto. La moneda de la casilla 28 indica tragos, no desplazamientos. Cambiar de asiento tampoco intercambia fichas. Las pruebas sociales se resuelven en persona.

Se conservan las descripciones y el tono de la foto; los títulos sin instrucciones no se sustituyen por retos inventados. Hidalgo (1 y 26), recta final (50) y tardones (45) no exigen vaciar vasos de golpe. Las casillas 4 y 43 son Modo sexo y Zona segura. Una sola regla general permite pasar y exige contacto acordado.

Quien llega tarde observa hasta la siguiente partida. Si sale quien tiene el turno, pasa a la siguiente ficha; si quedan menos de dos fichas, se vuelve al selector. El anfitrión puede cerrar pruebas o saltar un turno pendiente para evitar bloqueos.
