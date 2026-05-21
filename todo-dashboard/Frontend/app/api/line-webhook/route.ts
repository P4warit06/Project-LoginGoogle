import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET ?? "";
  const hash = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("base64");
  return hash === signature;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature") ?? "";

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(rawBody);

  for (const event of body.events ?? []) {
    // ── Step: copy userId จาก Vercel logs แล้วใส่ใน LINE_USER_ID env ──
    if (event.source?.userId) {
      console.log("LINE userId:", event.source.userId);
    }

    if (event.type === "message" && event.replyToken) {
      await fetch("https://api.line.me/v2/bot/message/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          replyToken: event.replyToken,
          messages: [
            {
              type: "text",
              text: "✅ เชื่อมต่อสำเร็จ!\nคุณจะได้รับ Todo notification ที่นี่",
            },
          ],
        }),
      });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ status: "LINE Webhook active" });
}
