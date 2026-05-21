import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ── LINE Messaging API push message ──
async function pushMessage(userId: string, message: string): Promise<boolean> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return false;

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [{ type: "text", text: message }],
    }),
  });

  return res.ok;
}

// POST /api/notify-line
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await req.json();
  if (!message?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const userId = process.env.LINE_USER_ID;
  if (!userId) {
    return NextResponse.json(
      { error: "LINE_USER_ID not configured. See setup guide." },
      { status: 500 }
    );
  }

  try {
    const ok = await pushMessage(userId, message);
    if (!ok) throw new Error("LINE API rejected");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("LINE push error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
