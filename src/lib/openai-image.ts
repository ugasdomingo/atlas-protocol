import OpenAI from "openai";
import { env } from "./env";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY ?? "" });

export async function generateSlideImage(
  slideText: string,
  pillar: string,
  index: number
): Promise<string> {
  const prompt = `Minimal dark background image for a social media carousel slide.
Style: ultra-minimalist, dark (near-black background), premium typography.
No faces, no people. Abstract or architectural elements only.
The image should feel: ${pillar === "finanzas" ? "structured and precise" : pillar === "relaciones" ? "deep and introspective" : pillar === "hábitos" ? "disciplined and clean" : "purposeful and vast"}.
Concept for slide ${index + 1}: "${slideText}"
Avoid any text in the image. Cinematic, high contrast, masculine aesthetic.`;

  const response = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1024x1024",
    quality: "high",
    n: 1,
  });

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) throw new Error(`No se generó imagen para slide ${index}`);
  return imageUrl;
}
