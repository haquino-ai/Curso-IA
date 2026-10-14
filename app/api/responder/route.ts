// app/api/responder/route.ts  (Next.js App Router, desplegado en Vercel)
// Pregunta -> recuperar fragmentos -> llamar a Claude con los fragmentos como contexto -> respuesta con fuentes.
// La clave ANTHROPIC_API_KEY vive solo en variables de entorno del servidor.
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM } from "@/prompts/responder.system";
import { SYSTEM_REESCRIBIR } from "@/prompts/reescribir.system";
import { buscar, expandir, formatear } from "@/lib/retrieval";

const client = new Anthropic(); // lee ANTHROPIC_API_KEY del entorno

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-5-5"; // el modelo económico; el Codespace lo fija en .devcontainer y .claude/settings.json
const MAX_INPUT_CHARS = 1000;
const MAX_TOKENS = 500;
const K = 3; // fragmentos que entran como contexto: la perilla que decide costo y precisión

// Esquema de salida como herramienta (misma técnica que /api/triage de la Sesión 3).
const RESPUESTA_TOOL: Anthropic.Tool = {
  name: "registrar_respuesta",
  description: "Registra la respuesta basada en los documentos.",
  input_schema: {
    type: "object",
    properties: {
      respuesta: { type: "string", maxLength: 600 },
      fuentes: { type: "array", items: { type: "string" } },
      suficiente_contexto: { type: "boolean" },
      alerta_inyeccion: { type: "boolean" },
    },
    required: ["respuesta", "fuentes", "suficiente_contexto", "alerta_inyeccion"],
  },
};

// Si la reescritura falla o sale rara, se busca con la pregunta original: la respuesta nunca se rompe por esto.
async function reescribir(pregunta: string): Promise<string> {
  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 60,
      system: SYSTEM_REESCRIBIR,
      messages: [{ role: "user", content: `<pregunta>\n${pregunta}\n</pregunta>` }],
    });
    const bloque = msg.content.find((b) => b.type === "text");
    const texto = bloque?.type === "text" ? bloque.text.trim() : "";
    return texto && texto.length <= 200 ? texto : pregunta;
  } catch {
    return pregunta;
  }
}

// Rate limit ingenuo en memoria (válido para el taller; en producción use un almacén compartido).
const hits = new Map<string, number[]>();
function limitado(ip: string, max = 10, ventanaMs = 60_000) {
  const ahora = Date.now();
  const recientes = (hits.get(ip) ?? []).filter((t) => ahora - t < ventanaMs);
  recientes.push(ahora);
  hits.set(ip, recientes);
  return recientes.length > max;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (limitado(ip)) return Response.json({ error: "rate_limit" }, { status: 429 });

  const { pregunta } = await req.json().catch(() => ({}));
  if (typeof pregunta !== "string" || !pregunta.trim() || pregunta.length > MAX_INPUT_CHARS)
    return Response.json({ error: "input_invalido" }, { status: 400 });

  // 1. Recuperar: el CÓDIGO decide qué entra al contexto (nunca el usuario). Los documentos obsoletos se excluyen aquí.
  const reescrita = await reescribir(pregunta);
  const encontrados = buscar(expandir(reescrita), K);
  const contexto = formatear(encontrados);

  // 2. Responder con ese contexto.
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM,
    tools: [RESPUESTA_TOOL],
    tool_choice: { type: "tool", name: "registrar_respuesta" },
    messages: [{ role: "user", content: `${contexto}\n<pregunta>\n${pregunta}\n</pregunta>` }],
  });

  // Registro de costo y de qué contexto entró: sin esto no se puede auditar ni optimizar.
  console.log(
    JSON.stringify({
      evento: "responder",
      in: msg.usage.input_tokens,
      out: msg.usage.output_tokens,
      fragmentos: encontrados.map((r) => `${r.fragmento.doc}/${r.fragmento.titulo}`),
    }),
  );

  const bloque = msg.content.find((b) => b.type === "tool_use");
  if (!bloque || bloque.type !== "tool_use") return Response.json({ error: "salida_invalida" }, { status: 502 });
  const datos = bloque.input as { suficiente_contexto: boolean };
  const documentos = [...new Set(encontrados.map((r) => r.fragmento.doc))];
  // Los pasos que se muestran en la pantalla para explicar cómo se llegó a la respuesta.
  const pasos = [
    {
      quien: "IA",
      titulo: "Reescribir la pregunta",
      detalle: reescrita === pregunta ? "No la cambió; se usó su pregunta original." : `Cambió su pregunta a: "${reescrita}". Solo sirve para buscar; la respuesta usa su pregunta original.`,
    },
    {
      quien: "Programa",
      titulo: "Buscar en los documentos",
      detalle: `Eligió ${encontrados.length} fragmentos de ${documentos.length} documento(s) comparando palabras. Los documentos obsoletos quedan fuera.`,
    },
    {
      quien: "IA",
      titulo: "Redactar la respuesta",
      detalle: datos.suficiente_contexto ? "Leyó los fragmentos y redactó la respuesta con sus fuentes." : "Leyó los fragmentos y dijo que no tenía información suficiente.",
    },
    {
      quien: "Programa",
      titulo: "Mostrar en pantalla",
      detalle: "Mostró la respuesta, la fuente y los fragmentos que vio el asistente.",
    },
  ];
  return Response.json({
    ...(bloque.input as object),
    pregunta_original: pregunta,
    pregunta_reescrita: reescrita,
    pasos,
    contexto_usado: documentos,
    // Lo que el asistente vio, para el botón "Ver lo que vio el asistente" de la pantalla.
    fragmentos: encontrados.map((r) => ({ documento: r.fragmento.doc, seccion: r.fragmento.titulo, texto: r.fragmento.texto })),
  });
}
