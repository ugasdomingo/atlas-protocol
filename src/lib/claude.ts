import Anthropic from "@anthropic-ai/sdk";
import { env } from "./env";

export const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY ?? "" });

const BRAND_SYSTEM_PROMPT = `Eres el creador de contenido de Protocolo Atlas.

Protocolo Atlas es una marca de desarrollo masculino minimalista y directa.
Su filosofía: el hombre moderno debe construir con propósito, disciplina y claridad.
Tono: directo, sin rodeos, reflexivo, masculino pero no tóxico.
Estética: minimalista, oscura, premium. Nada de clickbait ni emojis en exceso.

Público objetivo: hombres de 25-40 años que buscan mejorar en finanzas personales,
relaciones, hábitos y propósito de vida.

El contenido es faceless — no hay cara visible, solo frases y visuales poderosos.`;

export async function generateContentIdea(
  recentPosts: string[],
  topPerformers: string[]
): Promise<{
  idea: string;
  pillar: string;
  slides: string[];
  caption: string;
  hashtags: string[];
}> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: [
      {
        type: "text",
        text: BRAND_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Genera UNA idea de contenido nueva para hoy.

Últimos 10 posts publicados (evita repetir temas):
${recentPosts.slice(0, 10).join("\n")}

Posts con mejor rendimiento (inspírate en el estilo):
${topPerformers.slice(0, 5).join("\n")}

Responde SOLO en este JSON exacto, sin markdown:
{
  "idea": "descripción breve de la idea",
  "pillar": "finanzas|relaciones|hábitos|propósito",
  "slides": ["texto slide 1", "texto slide 2", "texto slide 3", "texto slide 4", "texto slide 5", "texto slide 6"],
  "caption": "caption para Instagram (máx 150 palabras, sin emojis excesivos)",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"]
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return JSON.parse(text);
}
