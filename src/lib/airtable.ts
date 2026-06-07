import Airtable, { Base } from "airtable";
import { env } from "./env";

let cachedBase: Base | null = null;

function getBase() {
  if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE_ID) {
    throw new Error("Airtable no esta configurado.");
  }

  cachedBase ??= new Airtable({ apiKey: env.AIRTABLE_TOKEN }).base(
    env.AIRTABLE_BASE_ID
  );

  return cachedBase;
}

export type PostRecord = {
  id: string;
  idea: string;
  pillar: string;
  slides: string[];
  caption: string;
  hashtags: string[];
  imageUrls: string[];
  videoUrl?: string;
  status: "ready_for_video" | "ready_to_publish" | "published" | "error";
  bufferIds?: string[];
  impressions?: number;
  reach?: number;
  engagement?: number;
  createdAt: string;
};

export async function getRecentPosts(limit = 30): Promise<PostRecord[]> {
  const records = await getBase()("Posts")
    .select({
      maxRecords: limit,
      sort: [{ field: "Created", direction: "desc" }],
      filterByFormula: "NOT({Status} = 'error')",
    })
    .all();

  return records.map((r) => ({
    id: r.id,
    idea: (r.get("Idea") as string) ?? "",
    pillar: (r.get("Pillar") as string) ?? "",
    slides: JSON.parse((r.get("Slides") as string) ?? "[]"),
    caption: (r.get("Caption") as string) ?? "",
    hashtags: JSON.parse((r.get("Hashtags") as string) ?? "[]"),
    imageUrls: JSON.parse((r.get("ImageUrls") as string) ?? "[]"),
    videoUrl: (r.get("VideoUrl") as string) ?? undefined,
    status: (r.get("Status") as PostRecord["status"]) ?? "ready_for_video",
    bufferIds: JSON.parse((r.get("BufferIds") as string) ?? "[]"),
    impressions: (r.get("Impressions") as number) ?? 0,
    reach: (r.get("Reach") as number) ?? 0,
    engagement: (r.get("Engagement") as number) ?? 0,
    createdAt: (r.get("Created") as string) ?? "",
  }));
}

export async function createPostRecord(
  data: Omit<PostRecord, "id" | "createdAt">
): Promise<string> {
  const record = await getBase()("Posts").create({
    Idea: data.idea,
    Pillar: data.pillar,
    Slides: JSON.stringify(data.slides),
    Caption: data.caption,
    Hashtags: JSON.stringify(data.hashtags),
    ImageUrls: JSON.stringify(data.imageUrls),
    Status: data.status,
  });

  return record.id;
}

export async function updatePostRecord(
  id: string,
  fields: Partial<{
    VideoUrl: string;
    Status: PostRecord["status"];
    BufferIds: string;
    Impressions: number;
    Reach: number;
    Engagement: number;
  }>
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await getBase()("Posts").update(id, fields as any);
}
