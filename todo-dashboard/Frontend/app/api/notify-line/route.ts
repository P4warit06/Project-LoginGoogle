import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type Task = { name: string; status: string; dueDate?: string };

type NewTaskInfo = {
  name: string;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  createdBy?: string;
};

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

function formatThaiDueDate(dueDate?: string) {
  if (!dueDate) return "วันกำหนดส่ง: ไม่ระบุ";
  const formatted = new Date(dueDate).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `วันกำหนดส่ง: ${formatted}`;
}

const PRIORITY_BADGE: Record<
  NewTaskInfo["priority"],
  { emoji: string; label: string }
> = {
  high: { emoji: "🔴", label: "HIGH" },
  medium: { emoji: "🟠", label: "MEDIUM" },
  low: { emoji: "🟢", label: "LOW" },
};

/* ─── New Task Creation Alert (Hero Bubble) ────ตอนมีการสร้าง task ใหม่เท่านั้น */
function buildNewTaskBubble(task: NewTaskInfo) {
  const badge = PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE.medium;

  return {
    type: "bubble",
    size: "mega",
    hero: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1535957998253-26ae1ef29506?q=80&w=1036&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          size: "full",
          aspectMode: "cover",
          aspectRatio: "20:13",
          gravity: "center",
        },
        {
          type: "box",
          layout: "vertical",
          position: "absolute",
          offsetBottom: "0px",
          offsetStart: "0px",
          offsetEnd: "0px",
          backgroundColor: "#00000099",
          paddingAll: "16px",
          paddingTop: "40px",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: `${badge.emoji} ${badge.label}`,
              color: "#FFFFFF",
              size: "xs",
              weight: "bold",
            },
            {
              type: "text",
              text: task.name,
              color: "#FFFFFF",
              weight: "bold",
              size: "xl",
              wrap: true,
            },
            {
              type: "text",
              text: formatThaiDueDate(task.dueDate),
              color: "#FFFFFFCC",
              size: "sm",
            },
          ],
        },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      paddingAll: "16px",
      spacing: "sm",
      contents: [
        {
          type: "text",
          text: "แจ้งเตือนงานใหม่",
          size: "xs",
          color: "#9CA3AF",
          weight: "bold",
        },
        {
          type: "text",
          text: `${
            task.createdBy ?? "มีคน"
          } ได้เพิ่มงานใหม่เข้าสู่ระบบ Todo Dashboard กรุณาตรวจสอบรายละเอียดและกำหนดเวลาดำเนินการ`,
          size: "sm",
          color: "#6B7280",
          wrap: true,
        },
      ],
    },
    footer: {
      type: "box",
      layout: "horizontal",
      spacing: "sm",
      paddingAll: "12px",
      contents: [
        {
          type: "button",
          style: "primary",
          color: "#16A34A",
          action: {
            type: "uri",
            label: "ดูรายละเอียด",
            uri: "https://googlelogin-pwratmosph.vercel.app",
          },
        },
        {
          type: "button",
          style: "secondary",
          action: {
            type: "uri",
            label: "แก้ไขงาน",
            uri: "https://googlelogin-pwratmosph.vercel.app",
          },
        },
      ],
    },
  };
}

/* ────Task Carousel (สรุปงานทั้งหมด)─── */

function buildTaskBubble(task: Task) {
  const due = getDueLabel(task.dueDate);

  let headerColor = "#2563EB";
  let headerText = "IN PROGRESS";
  let progress = 40;

  if (task.status === "done") {
    headerColor = "#1A8241";
    headerText = "COMPLETED";
    progress = 100;
  } else if (due?.overdue) {
    headerColor = "#E84D4D";
    headerText = "OVERDUE";
    progress = 100;
  } else if (due?.label === "Due today") {
    headerColor = "#CCA210";
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

function buildCarousel(tasks: Task[]) {
  return {
    type: "carousel",
    contents: tasks.slice(0, 10).map(buildTaskBubble),
  };
}

async function pushMessages(userId: string, messages: unknown[]) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return false;

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ to: userId, messages: messages.slice(0, 5) }),
  });
  return res.ok;
}
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tasks, newTask } = (await req.json()) as {
    tasks: Task[];
    newTask?: NewTaskInfo;
  };

  if (!tasks?.length) {
    return NextResponse.json({ error: "tasks required" }, { status: 400 });
  }

  const userId = process.env.LINE_USER_ID;
  if (!userId) {
    return NextResponse.json(
      { error: "LINE_USER_ID not configured" },
      { status: 500 }
    );
  }

  const messages: unknown[] = [];

  if (newTask) {
    messages.push({
      type: "flex",
      altText: `แจ้งเตือน: มีการสร้างงานใหม่ - ${newTask.name}`,
      contents: buildNewTaskBubble(newTask),
    });
  }

  messages.push({
    type: "flex",
    altText: "Your Daily To-Do List",
    contents: buildCarousel(tasks),
  });

  try {
    const ok = await pushMessages(userId, messages);
    if (!ok) throw new Error("LINE API rejected");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("LINE push error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
