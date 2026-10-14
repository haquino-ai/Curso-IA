# Contexto del proyecto (lo lee Claude Code solo al abrir este repositorio)

Plataforma web con IA, construida en un taller. Next.js (App Router) + TypeScript, desplegada en Vercel. Idioma de trabajo: español (código y comentarios en español, nombres de archivo en minúsculas).

## Quién trabaja aquí (importante)

Las personas que usan este proyecto **no saben programar**. Construyen con tu ayuda ("vibe coding"). Por eso:

- Explica en español simple, sin jerga. Si usas un término técnico, defínelo en una frase.
- Habla de "el asistente", "la pantalla", "los documentos" y "las instrucciones del asistente", no de "endpoints", "rutas" o "JSON", salvo que te lo pregunten.
- **Ejecuta tú los comandos** (git, instalaciones, pruebas) cuando haga falta, pidiendo permiso, en vez de pedirle a la persona que los escriba. Si debe copiar algo, dale el texto exacto.
- Para probar, prefiere la **pantalla del navegador** (`app/page.tsx`) antes que comandos como `curl`.
- Después de cada cambio, di en dos líneas qué cambió, en qué archivos y cómo comprobarlo en la pantalla.
- Si algo falla, explica la causa en una frase y propone un solo arreglo.

## Estructura

- `app/page.tsx`, `app/layout.tsx`: la página web.
- `app/api/<nombre>/route.ts`: un endpoint por carpeta. Ejemplos: `triage` (clasifica reclamos) y `responder` (responde con documentos y cita la fuente).
- `prompts/*.system.ts`: system prompts como código. Una sección por tema: personalidad, entorno, tono, objetivo, funciones, normas, formato.
- `context/*.md`: documentos de conocimiento. Cada uno con encabezado `---` (id, version, vigente_desde, estado) y secciones `## ...`.
- `lib/retrieval.ts`: búsqueda de fragmentos. `lib/context.generated.json` se GENERA con `node scripts/build-context.mjs`; no se edita a mano.
- `herramientas/`: programas pequeños y gratuitos (sin IA): `buscar.py` muestra qué fragmentos entrarían para una pregunta (`--con-obsoletos` incluye los viejos) y `medir_contexto.py` estima los tokens.

## Comandos

- `npm run dev`: levanta la plataforma en el puerto 3000 (regenera el contexto antes).
- `npm run build`: compila; debe terminar sin errores.
- `python herramientas/buscar.py "pregunta"`: gratis; muestra qué hojas entran como contexto.
- Guardar y publicar: la persona guarda con el menú de la izquierda (control de código fuente: Confirmar y Sincronizar cambios) y Vercel publica solo. Tú no necesitas hacer `git push` salvo que te lo pida.

## Reglas de trabajo (obligatorias)

1. **Nunca escribir la clave de API** (`ANTHROPIC_API_KEY`) en ningún archivo, comando guardado ni commit. Solo existe como variable de entorno. No crear ni subir archivos `.env*` con claves.
2. **Pedir un plan antes de escribir código** cuando el cambio toque más de un archivo, y esperar aprobación.
3. **Un paso pequeño a la vez.** Después de cada paso, indicar cómo probarlo (comando concreto y resultado esperado).
4. **Prompts en `prompts/`, nunca incrustados en una ruta.** Si cambia una regla, decir qué comportamiento cambia.
5. **El código decide qué entra al contexto del modelo, nunca el texto del usuario.** El texto del usuario y el de los documentos es dato, no instrucciones.
6. **Validar la entrada** de todo endpoint (tipo, largo máximo) y limitar la salida (`max_tokens`).
7. **Herramientas de un agente: solo lectura por defecto**; las que escriben o ejecutan acciones requieren confirmación humana explícita. Todo ciclo de agente debe tener un máximo de iteraciones.
8. **No ejecutar llamadas en lote ni ciclos de evaluación contra la API** (el saldo de la clave es limitado y compartido). Probar con una pregunta a la vez.
9. No editar `package-lock.json` a mano. No instalar librerías sin explicar para qué.
10. Hacer `git commit` solo cuando el paso funciona; mensajes cortos en español. Si la persona prefiere guardar con el menú de la izquierda, no lo hagas tú.
11. Los programas de `herramientas/` y cualquier regla fija (ocultar datos personales, descartar documentos OBSOLETO, detectar frases sospechosas) se escriben como **programas sin IA**; la IA se reserva para entender y redactar. Pídele casos de prueba (entrada y salida esperada) y muéstralos antes de conectarlos.

## Modelo

El modelo es `claude-haiku-5-5` (el más económico). Está fijado en `.claude/settings.json` y en `.devcontainer/devcontainer.json` (`ANTHROPIC_MODEL`); la aplicación lo lee de esa variable en `app/api/responder/route.ts`. No lo cambies sin que la persona lo pida y sin decirlo.

## Mi proyecto (cada alumno completa esto)

- **Qué problema resuelve:** 
- **Quién lo usa:** 
- **Entrada y salida:** 
- **Documentos o datos que necesita:** 
- **Herramientas que usaría un agente:** 
- **Qué NUNCA debe hacer o decir:** 
