import {
  recordDeliveryEvent,
  verifyDeliveryWebhook,
} from "@/lib/recruitment-webhooks";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret)
    return Response.json(
      { error: "Webhook is not configured." },
      { status: 503 },
    );
  if (!request.body)
    return Response.json({ error: "Missing payload." }, { status: 400 });
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      length += part.value.length;
      if (length > 65536) {
        await reader.cancel();
        return Response.json({ error: "Payload too large." }, { status: 413 });
      }
      chunks.push(part.value);
    }
  } finally {
    reader.releaseLock();
  }
  let event: unknown;
  try {
    event = verifyDeliveryWebhook(
      Buffer.concat(chunks).toString("utf8"),
      request.headers,
      secret,
    );
  } catch {
    return Response.json(
      { error: "Invalid webhook signature." },
      { status: 400 },
    );
  }
  const id = request.headers.get("svix-id") ?? "";
  if (!id || id.length > 200)
    return Response.json({ error: "Invalid event ID." }, { status: 400 });
  try {
    await recordDeliveryEvent(id, event);
    return Response.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Unable to persist event. Retry later." },
      { status: 503 },
    );
  }
}
