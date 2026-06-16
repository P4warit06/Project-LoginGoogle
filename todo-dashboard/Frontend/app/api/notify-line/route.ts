import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type Task = { name: string; status: string; dueDate?: string };

function getDueLabel(
  dueDate?: string
): { label: string; overdue: boolean } | null {
  if (!dueDate) return null;
  const diff = Math.ceil(
    (new Date(dueDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) /
      86400000
  );
  if (diff < 0) return { label: "Overdue", overdue: true };
  if (diff === 0) return { label: "Due today", overdue: false };
  return { label: `${diff}d left`, overdue: false };
}

function buildTaskBubble(task: Task) {
  const due = getDueLabel(task.dueDate);

  let headerColor = "#2563EB"; // In Progress (default)
  let headerText = "IN PROGRESS";
  let progress = 40;

  if (task.status === "done") {
    headerColor = "#16A34A";
    headerText = "COMPLETED";
    progress = 100;
  } else if (due?.overdue) {
    headerColor = "#DC2626";
    headerText = "OVERDUE";
    progress = 100;
  } else if (due?.label === "Due today") {
    headerColor = "#F59E0B";
    headerText = "PENDING";
    progress = 80;
  }

  return {
    type: "bubble",
    size: "kilo",
    header: {
      type: "box",
      layout: "vertical",
      backgroundColor: headerColor,
      paddingAll: "16px",
      contents: [
        {
          type: "text",
          text: headerText,
          color: "#FFFFFF",
          weight: "bold",
          size: "sm",
        },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      paddingAll: "16px",
      spacing: "md",
      contents: [
        {
          type: "text",
          text: task.name,
          weight: "bold",
          size: "lg",
          wrap: true,
        },
        {
          type: "text",
          text: due ? `Due: ${due.label}` : "No due date",
          size: "sm",
          color: "#666666",
        },
        {
          type: "box",
          layout: "vertical",
          backgroundColor: "#E5E7EB",
          height: "6px",
          cornerRadius: "999px",
          margin: "md",
          contents: [
            {
              type: "box",
              layout: "vertical",
              backgroundColor: headerColor,
              height: "6px",
              width: `${progress}%`,
              cornerRadius: "999px",
              contents: [],
            },
          ],
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      paddingAll: "12px",
      contents: [
        {
          type: "button",
          style: "primary",
          color: headerColor,
          action: {
            type: "message",
            label: "View Details",
            text: `ดูรายละเอียด: ${task.name}`,
          },
        },
      ],
    },
  };
}

async function pushCarouselFlex(userId: string, tasks: Task[]) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return false;

  const bubbles = tasks.slice(0, 10).map(buildTaskBubble);

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: userId,
      messages: [
        {
          type: "flex",
          altText: "Your Daily To-Do List",
          contents: { type: "carousel", contents: bubbles },
        },
      ],
    }),
  });
  return res.ok;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tasks } = (await req.json()) as { tasks: Task[] };
  if (!tasks?.length)
    return NextResponse.json({ error: "tasks required" }, { status: 400 });

  const userId = process.env.LINE_USER_ID;
  if (!userId)
    return NextResponse.json(
      { error: "LINE_USER_ID not configured" },
      { status: 500 }
    );

  try {
    const ok = await pushCarouselFlex(userId, tasks);
    if (!ok) throw new Error("LINE API rejected");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("LINE push error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
