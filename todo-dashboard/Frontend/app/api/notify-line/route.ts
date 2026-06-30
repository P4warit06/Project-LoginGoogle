import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type Task = { name: string; status: string; dueDate?: string };

type ActorInfo = {
  name?: string;
  provider?: string;
};

type NewTaskInfo = {
  name: string;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  createdBy?: ActorInfo;
};

type ClearEvent = {
  type: "all_completed" | "all_deleted";
  clearedBy?: ActorInfo;
  taskCount: number;
};

type ProviderBadge = {
  label: string;
  color: string;
  icon: string;
};

const PROVIDER_BADGE: Record<string, ProviderBadge> = {
  line: {
    label: "LINE",
    color: "#06C755",
    icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/line.svg",
  },
  google: {
    label: "Google",
    color: "#4285F4",
    icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/google.svg",
  },
  "azure-ad": {
    label: "Microsoft",
    color: "#0078D4",
    icon: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/microsoft.svg",
  },
};
function getProviderBadge(provider?: string): ProviderBadge | undefined {
  if (!provider) return undefined;
  return PROVIDER_BADGE[provider.toLowerCase()];
}

/**
 * สร้าง "row" สำหรับแสดงผู้ดำเนินการ พร้อม provider badge (รูปไอคอน + label สี)
 * ใช้ร่วมกันทั้ง "Created By" (new task) และ "Modify By" (all-clear)
 */
function buildActorRow(label: string, actor?: ActorInfo) {
  const badge = getProviderBadge(actor?.provider);
  const name = actor?.name ?? "System";

  return {
    type: "box",
    layout: "horizontal",
    alignItems: "center",
    contents: [
      {
        type: "text",
        text: label,
        color: THEME.textSecondary,
        size: "sm",
        flex: 2,
      },
      {
        type: "box",
        layout: "horizontal",
        flex: 4,
        justifyContent: "flex-end",
        alignItems: "center",
        spacing: "sm",
        contents: [
          {
            type: "text",
            text: name,
            color: THEME.text,
            size: "sm",
            flex: 0,
          },
          ...(badge
            ? [
                {
                  type: "image",
                  url: badge.icon,
                  size: "18px",
                  aspectMode: "fit",
                  flex: 0,
                },
                {
                  type: "text",
                  text: badge.label,
                  color: badge.color,
                  weight: "bold",
                  size: "xs",
                  flex: 0,
                },
              ]
            : []),
        ],
      },
    ],
  };
}

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
/* ─── New Task Creation Alert (Hero Bubble) ────ตอนมีการสร้าง task ใหม่เท่านั้น */
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
            buildActorRow("Created By", task.createdBy),
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

/* ─── All-Clear Notification Bubble ─────────────────────────────────────────
   ส่งเมื่อ user เคลียร์งานครบ (all_completed) หรือลบทิ้งทั้งหมด (all_deleted)
   ─────────────────────────────────────────────────────────────────────────── */
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
        /* ── Header badge ── */
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
        /* ── Headline ── */
        {
          type: "text",
          text: config.headline,
          weight: "bold",
          color: THEME.text,
          size: "xl",
          margin: "md",
          wrap: true,
        },
        /* ── Subtext ── */
        {
          type: "text",
          text: config.subtext,
          color: THEME.textSecondary,
          size: "sm",
          margin: "sm",
          wrap: true,
        },
        /* ── Divider ── */
        {
          type: "separator",
          margin: "xl",
          color: THEME.border,
        },
        /* ── Stats card ── */
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
            buildActorRow("Modify By", event.clearedBy),
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

  const { tasks, newTask, clearEvent, lineUserId } = (await req.json()) as {
    tasks?: Task[];
    newTask?: NewTaskInfo;
    clearEvent?: ClearEvent;
    lineUserId?: string; // LINE userId ส่งมาจาก client
  };

  if (!tasks?.length && !newTask && !clearEvent) {
    return NextResponse.json(
      { error: "tasks, newTask, or clearEvent required" },
      { status: 400 }
    );
  }

  /**
   * หา target LINE userId ตามลำดับความสำคัญ:
   * 1) lineUserId ที่ client ส่งมา (ผูกกับ session ปัจจุบันที่ login ด้วย LINE)
   * 2) session.user.id เมื่อ provider คือ "line" (เผื่อ client ไม่ได้ส่งมา)
   * 3) LINE_USER_ID env var — เก็บไว้เป็น fallback สำหรับ admin/testing เท่านั้น
   */
  const sessionProvider = (session.user as any)?.provider;
  const sessionLineId =
    sessionProvider === "line" ? (session.user as any)?.id : undefined;

  const targetUserId = lineUserId || sessionLineId || process.env.LINE_USER_ID;

  if (!targetUserId) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "no-line-account-linked",
    });
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
      all_completed: `Congratulation ! You have Completed ${clearEvent.taskCount} task.`,
      all_deleted: ` Cleared all  ${clearEvent.taskCount} tasks.`,
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

  if (messages.length === 0) {
    return NextResponse.json({ ok: true, skipped: true, reason: "no-content" });
  }

  try {
    const ok = await pushMessages(targetUserId, messages);
    if (!ok) {
      return NextResponse.json(
        {
          error:
            "LINE push rejected — ผู้ใช้อาจยังไม่ได้เพิ่มเพื่อน LINE Official Account",
        },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("LINE push error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
