import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature") ?? "";
  const secret = process.env.LINE_CHANNEL_SECRET ?? "";

  // ── Verify signature ──
  if (secret) {
    const hash = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("base64");

    if (hash !== signature) {
      console.error("Invalid LINE signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let body: {
    events?: Array<{
      type: string;
      replyToken?: string;
      source?: { userId?: string };
      message?: { text?: string };
    }>;
  };

  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  for (const event of body.events ?? []) {
    const userId = event.source?.userId;

    if (userId) {
      console.log(`LINE userId: ${userId}`);
    }

    if (event.type === "message" && event.replyToken && userId) {
      const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
      if (token) {
        await fetch("https://api.line.me/v2/bot/message/reply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            replyToken: event.replyToken,
            messages: [
              {
                type: "text",
                text: ` เชื่อมต่อสำเร็จ!\nuserId: ${userId}\n\nคัดลอก userId นี้ไปใส่ใน Vercel Env ชื่อ LINE_USER_ID`,
              },
            ],
          }),
        });
      }
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ status: "LINE Webhook OK" }, { status: 200 });
}
