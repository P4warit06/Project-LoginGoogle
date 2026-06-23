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

type ClearEvent = {
  type: "all_completed" | "all_deleted";
  clearedBy?: string; // display name ของ user
  taskCount: number; // จำนวน task ที่ถูกจัดการ
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

const THEME = {
  bg: "#08090F",
  card: "#111827",
  primary: "#6D4AFF",
  secondary: "#8B5CF6",
  success: "#00E5A8",
  warning: "#FF8A3D",
  danger: "#FF5E7A",
  text: "#FFFFFF",
  textSecondary: "#B4B4C7",
  border: "#23243A",
};
function buildNewTaskBubble(task: NewTaskInfo) {
  const badge = PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE.medium;

  const priorityColor =
    task.priority === "high"
      ? THEME.danger
      : task.priority === "medium"
      ? THEME.warning
      : THEME.success;

  return {
    type: "bubble",
    styles: {
      body: {
        backgroundColor: THEME.bg,
      },
    },
    body: {
      type: "box",
      layout: "vertical",
      backgroundColor: THEME.bg,
      contents: [
        {
          type: "text",
          text: "✨ NEW TASK",
          weight: "bold",
          color: THEME.secondary,
          size: "sm",
        },
        {
          type: "text",
          text: task.name,
          weight: "bold",
          color: THEME.text,
          size: "xxl",
          margin: "md",
          wrap: true,
        },
        {
          type: "text",
          text: `${badge.emoji} ${badge.label}`,
          size: "xs",
          color: priorityColor,
          margin: "sm",
        },
        {
          type: "separator",
          margin: "xl",
          color: THEME.border,
        },
        {
          type: "box",
          layout: "vertical",
          backgroundColor: THEME.card,
          cornerRadius: "12px",
          paddingAll: "14px",
          margin: "xl",
          spacing: "md",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: "Due Date",
                  color: THEME.textSecondary,
                  size: "sm",
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
                  color: THEME.text,
                  size: "sm",
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
                  color: THEME.textSecondary,
                  size: "sm",
                  flex: 0,
                },
                {
                  type: "text",
                  text: task.createdBy ?? "System",
                  color: THEME.text,
                  size: "sm",
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
                  text: "Status",
                  color: THEME.textSecondary,
                  size: "sm",
                  flex: 0,
                },
                {
                  type: "text",
                  text: "Pending",
                  color: THEME.warning,
                  size: "sm",
                  align: "end",
                },
              ],
            },
          ],
        },
        {
          type: "box",
          layout: "horizontal",
          margin: "xl",
          contents: [
            {
              type: "text",
              text: "TASK ID",
              size: "xs",
              color: THEME.textSecondary,
              flex: 0,
            },
            {
              type: "text",
              text: `#${Date.now().toString().slice(-8)}`,
              size: "xs",
              color: THEME.textSecondary,
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
              color: THEME.primary,
              action: {
                type: "uri",
                label: "View Details",
                uri: "https://googlelogin-pwratmosph.vercel.app",
              },
            },
            {
              type: "button",
              style: "primary",
              color: THEME.border,
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
  };
}

function buildAllClearBubble(event: ClearEvent) {
  const isCompleted = event.type === "all_completed";

  const config = isCompleted
    ? {
        headerBg: THEME.success,
        headerIcon: "!",
        headerLabel: "ALL TASKS DONE",
        headline: "Nice Job! All task is done",
        subtext:
          "You have successfully completed all the tasks.\n Take a break ☕ ... and then plan your next assignment.",
        actionLabel: "Add Next Task",
        accentColor: THEME.success,
        statsLabel: "Task completed",
      }
    : {
        headerBg: THEME.secondary,
        headerIcon: "🗑️",
        headerLabel: "BOARD CLEARED",
        headline: "All task Entries have been successfully deleted.",
        subtext: "Task has been deleted \n Ready to Start New Task",
        actionLabel: "Create New Task",
        accentColor: THEME.secondary,
        statsLabel: "Task deleted",
      };

  const nowTh = new Date().toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    type: "bubble",
    styles: {
      body: { backgroundColor: THEME.bg },
    },
    body: {
      type: "box",
      layout: "vertical",
      backgroundColor: THEME.bg,
      spacing: "none",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          alignItems: "center",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: config.headerIcon,
              size: "sm",
              flex: 0,
            },
            {
              type: "text",
              text: config.headerLabel,
              weight: "bold",
              color: config.accentColor,
              size: "sm",
            },
          ],
        },
        {
          type: "text",
          text: config.headline,
          weight: "bold",
          color: THEME.text,
          size: "xl",
          margin: "md",
          wrap: true,
        },
        {
          type: "text",
          text: config.subtext,
          color: THEME.textSecondary,
          size: "sm",
          margin: "sm",
          wrap: true,
        },
        {
          type: "separator",
          margin: "xl",
          color: THEME.border,
        },
        {
          type: "box",
          layout: "vertical",
          backgroundColor: THEME.card,
          cornerRadius: "12px",
          paddingAll: "14px",
          margin: "xl",
          spacing: "md",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: [
                {
                  type: "text",
                  text: config.statsLabel,
                  color: THEME.textSecondary,
                  size: "sm",
                  flex: 0,
                },
                {
                  type: "text",
                  text: `${event.taskCount} รายการ`,
                  color: config.accentColor,
                  size: "sm",
                  weight: "bold",
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
                  text: "Modifiy By",
                  color: THEME.textSecondary,
                  size: "sm",
                  flex: 0,
                },
                {
                  type: "text",
                  text: event.clearedBy ?? "System",
                  color: THEME.text,
                  size: "sm",
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
                  text: "Time",
                  color: THEME.textSecondary,
                  size: "sm",
                  flex: 0,
                },
                {
                  type: "text",
                  text: nowTh,
                  color: THEME.text,
                  size: "sm",
                  align: "end",
                },
              ],
            },
          ],
        },
        {
          type: "button",
          style: "primary",
          color: config.accentColor,
          margin: "xl",
          action: {
            type: "uri",
            label: config.actionLabel,
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
  let headerColor = THEME.primary;
  let headerText = "In Progress";
  let progress = 50;

  if (task.status === "done") {
    headerColor = THEME.success;
    headerText = "Completed";
    progress = 100;
  } else if (due?.overdue) {
    headerColor = THEME.danger;
    headerText = "Overdue";
    progress = 100;
  } else if (due?.label === "Due today") {
    headerColor = THEME.warning;
    headerText = "Due Today";
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
          gravity: "center",
        },
        {
          type: "text",
          text: `${progress}%`,
          color: "#ffffff",
          align: "start",
          size: "xs",
          gravity: "center",
          margin: "lg",
        },
        {
          type: "box",
          layout: "vertical",
          backgroundColor: "#23243A",
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
                  type: "filler",
                },
              ],
            },
          ],
        },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      backgroundColor: THEME.card,
      spacing: "md",
      paddingAll: "12px",
      contents: [
        {
          type: "text",
          text: task.name,
          color: THEME.text,
          size: "sm",
          wrap: true,
        },
      ],
    },
    styles: {
      footer: {
        separator: false,
      },
    },
  };
}

function getProgressColor(headerColor: string): string {
  const colorMap: Record<string, string> = {
    [THEME.primary]: "#C4B5FD",
    [THEME.success]: "#D1FAE5",
    [THEME.warning]: "#FED7AA",
    [THEME.danger]: "#FFE4E6",
  };

  return colorMap[headerColor] || "#C4B5FD";
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

  const { tasks, newTask, clearEvent } = (await req.json()) as {
    tasks?: Task[];
    newTask?: NewTaskInfo;
    clearEvent?: ClearEvent;
  };

  if (!tasks?.length && !newTask && !clearEvent) {
    return NextResponse.json(
      { error: "tasks, newTask, or clearEvent required" },
      { status: 400 }
    );
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
      altText: `แจ้งเตือน: มีการสร้างงานใหม่ — ${newTask.name}`,
      contents: buildNewTaskBubble(newTask),
    });
  }

  if (clearEvent) {
    const altTextMap: Record<ClearEvent["type"], string> = {
      all_completed: `🎉 ยินดีด้วย! คุณทำงานครบ ${clearEvent.taskCount} รายการแล้ว`,
      all_deleted: `🗑️ ล้างรายการงานทั้งหมด ${clearEvent.taskCount} รายการเรียบร้อย`,
    };
    messages.push({
      type: "flex",
      altText: altTextMap[clearEvent.type],
      contents: buildAllClearBubble(clearEvent),
    });
  }
  if (tasks?.length) {
    messages.push({
      type: "flex",
      altText: "Your Daily To-Do List",
      contents: buildCarousel(tasks),
    });
  }

  try {
    const ok = await pushMessages(userId, messages);
    if (!ok) throw new Error("LINE API rejected");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("LINE push error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
