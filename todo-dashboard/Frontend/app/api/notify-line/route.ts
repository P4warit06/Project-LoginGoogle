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
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "! NEW TASK !",
          weight: "bold",
          color: "#2A164F",
          size: "sm",
        },
        {
          type: "text",
          text: task.name,
          weight: "bold",
          size: "xxl",
          margin: "md",
          wrap: true,
        },
        {
          type: "text",
          text: `Priority: ${badge.label}`,
          size: "xs",
          color: "#aaaaaa",
          wrap: true,
        },
        {
          type: "separator",
          margin: "xxl",
        },
        {
          type: "box",
          layout: "vertical",
          margin: "xxl",
          spacing: "sm",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "Due Date",
                  size: "sm",
                  color: "#555555",
                  flex: 0,
                },
                {
                  type: "text",
                  text: task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Not specified",
                  size: "sm",
                  color: "#111111",
                  align: "end",
                },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "Created By",
                  size: "sm",
                  color: "#555555",
                  flex: 0,
                },
                {
                  type: "text",
                  text: task.createdBy ?? "System",
                  size: "sm",
                  color: "#111111",
                  align: "end",
                },
              ],
            },
            {
              type: "separator",
              margin: "xxl",
            },
            {
              type: "box",
              layout: "horizontal",
              margin: "xxl",
              contents: [
                {
                  type: "text",
                  text: "STATUS",
                  size: "sm",
                  color: "#555555",
                },
                {
                  type: "text",
                  text: "Pending",
                  size: "sm",
                  color: "#111111",
                  align: "end",
                },
              ],
            },
          ],
        },
        {
          type: "separator",
          margin: "xxl",
        },
        {
          type: "box",
          layout: "horizontal",
          margin: "md",
          contents: [
            {
              type: "text",
              text: "TASK ID",
              size: "xs",
              color: "#aaaaaa",
              flex: 0,
            },
            {
              type: "text",
              text: `#${Date.now().toString().slice(-8)}`,
              color: "#aaaaaa",
              size: "xs",
              align: "end",
            },
          ],
        },
        {
          type: "box",
          layout: "horizontal",
          spacing: "sm",
          margin: "xl",
          contents: [
            {
              type: "button",
              style: "primary",
              color: "#B388FF",
              action: {
                type: "uri",
                label: "View Details",
                uri: "https://googlelogin-pwratmosph.vercel.app",
              },
            },
            {
              type: "button",
              style: "secondary",
              action: {
                type: "uri",
                label: "Edit Task",
                uri: "https://googlelogin-pwratmosph.vercel.app",
              },
            },
          ],
        },
      ],
    },
    styles: {
      footer: {
        separator: true,
      },
    },
  };
}

/* ────Task Carousel (สรุปงานทั้งหมด)─── */

function buildTaskBubble(task: Task) {
  const due = getDueLabel(task.dueDate);

  let headerColor = "#27ACB2";
  let headerText = "In Progress";
  let progress = 50;

  if (task.status === "done") {
    headerColor = "#A17DF5";
    headerText = "Completed";
    progress = 100;
  } else if (due?.overdue) {
    headerColor = "#FF6B6E";
    headerText = "Overdue";
    progress = 100;
  } else if (due?.label === "Due today") {
    headerColor = "#FF6B6E";
    headerText = "Pending";
    progress = 80;
  }

  return {
    type: "bubble",
    size: "nano",
    header: {
      type: "box",
      layout: "vertical",
      backgroundColor: headerColor,
      paddingTop: "19px",
      paddingAll: "12px",
      paddingBottom: "16px",
      contents: [
        {
          type: "text",
          text: headerText,
          color: "#ffffff",
          align: "start",
          size: "md",
          gravity: "center"
        },
        {
          type: "text",
          text: `${progress}%`,
          color: "#ffffff",
          align: "start",
          size: "xs",
          gravity: "center",
          margin: "lg"
        },
        {
          type: "box",
          layout: "vertical",
          backgroundColor: "#9FD8E36E",
          height: "6px",
          margin: "sm",
          contents: [
            {
              type: "box",
              layout: "vertical",
              width: `${progress}%`,
              backgroundColor: getProgressColor(headerColor),
              height: "6px",
              contents: [
                {
                  type: "filler"
                }
              ]
            }
          ]
        }
      ]
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      paddingAll: "12px",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          flex: 1,
          contents: [
            {
              type: "text",
              text: task.name,
              color: "#8C8C8C",
              size: "sm",
              wrap: true
            }
          ]
        }
      ]
    },
    styles: {
      footer: {
        separator: false
      }
    }
  };
}

function getProgressColor(headerColor: string): string {
  const colorMap: Record<string, string> = {
    "#1E40AF": "#EFF6FF", // In Progess
    "#A17DF5": "#34D399", // Completed
    "#FF6B6E": "#DE5658", //
  };
  return colorMap[headerColor] || "#0D8186";
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
