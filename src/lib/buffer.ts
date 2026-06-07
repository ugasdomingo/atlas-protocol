import { env } from "./env";

const BUFFER_API = "https://api.bufferapp.com/1";
const accessToken = env.BUFFER_ACCESS_TOKEN ?? "";

export async function getProfiles(): Promise<
  Array<{ id: string; service: string; service_username: string }>
> {
  const res = await fetch(`${BUFFER_API}/profiles.json?access_token=${accessToken}`);
  if (!res.ok) throw new Error("No se pudo obtener perfiles de Buffer");
  return res.json();
}

export async function scheduleCarousel(
  profileIds: string[],
  caption: string,
  hashtags: string[],
  imageUrls: string[]
): Promise<string[]> {
  const text = `${caption}\n\n${hashtags.map((h) => `#${h}`).join(" ")}`;

  const ids: string[] = [];

  for (const profileId of profileIds) {
    const body = new URLSearchParams({
      access_token: accessToken,
      profile_ids: profileId,
      text,
      now: "true",
    });

    imageUrls.forEach((url) => body.append("media[photo_urls][]", url));

    const res = await fetch(`${BUFFER_API}/updates/create.json`, {
      method: "POST",
      body,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Buffer carousel error para ${profileId}:`, err);
      continue;
    }

    const data = await res.json();
    ids.push(data.updates?.[0]?.id ?? "");
  }

  return ids;
}

export async function scheduleVideo(
  profileIds: string[],
  caption: string,
  hashtags: string[],
  videoUrl: string
): Promise<string[]> {
  const text = `${caption}\n\n${hashtags.map((h) => `#${h}`).join(" ")}`;

  const ids: string[] = [];

  for (const profileId of profileIds) {
    const body = new URLSearchParams({
      access_token: accessToken,
      profile_ids: profileId,
      text,
      now: "true",
      "media[video]": videoUrl,
    });

    const res = await fetch(`${BUFFER_API}/updates/create.json`, {
      method: "POST",
      body,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Buffer video error para ${profileId}:`, err);
      continue;
    }

    const data = await res.json();
    ids.push(data.updates?.[0]?.id ?? "");
  }

  return ids;
}
