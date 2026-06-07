import { env } from "./env";

const RUNWAY_API_URL = "https://api.dev.runwayml.com/v1";

export async function generateVideoFromImage(
  imageUrl: string,
  prompt: string
): Promise<string> {
  // Crear tarea de generación
  const createRes = await fetch(`${RUNWAY_API_URL}/image_to_video`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RUNWAY_API_KEY}`,
      "Content-Type": "application/json",
      "X-Runway-Version": "2024-11-06",
    },
    body: JSON.stringify({
      model: "gen3a_turbo",
      promptImage: imageUrl,
      promptText: prompt,
      duration: 10,
      ratio: "9:16",
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Runway create failed: ${err}`);
  }

  const { id: taskId } = await createRes.json();

  // Polling — máx 5 minutos (300s), cada 10s
  const deadline = Date.now() + 5 * 60 * 1000;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 10_000));

    const pollRes = await fetch(`${RUNWAY_API_URL}/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${env.RUNWAY_API_KEY}`,
        "X-Runway-Version": "2024-11-06",
      },
    });

    if (!pollRes.ok) continue;

    const task = await pollRes.json();

    if (task.status === "SUCCEEDED") {
      return task.output?.[0] as string;
    }

    if (task.status === "FAILED") {
      throw new Error(`Runway task failed: ${JSON.stringify(task.failure)}`);
    }
  }

  throw new Error("Runway timeout: el video no se generó en 5 minutos");
}
