"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import {
  RiDeleteBinLine,
  RiAddLine,
  RiCheckboxCircleFill,
  RiRadioButtonLine,
  RiEdit2Line,
  RiSaveLine,
  RiCloseLine,
  RiSearchLine,
  RiCalendarLine,
  RiFlag2Line,
} from "react-icons/ri";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  isEditing?: boolean;
}

type FilterType = "all" | "active" | "completed";
type PriorityFilter = "all" | "high" | "medium" | "low";

const PRI = {
  high: {
    color: "#f87171",
    bg: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.28)",
  },
  medium: {
    color: "#fb923c",
    bg: "rgba(251,146,60,0.12)",
    border: "rgba(251,146,60,0.28)",
  },
  low: {
    color: "#4ade80",
    bg: "rgba(74,222,128,0.12)",
    border: "rgba(74,222,128,0.28)",
  },
};

function getDueDays(date?: string) {
  if (!date) return null;

  const days = Math.ceil(
    (new Date(date).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) /
      86400000
  );

  if (days < 0) return { label: "Overdue", overdue: true };
  if (days === 0) return { label: "Due today", overdue: false };

  return {
    label: `${days}d left`,
    overdue: false,
  };
}

export default function TodoDashboard() {
  const { data: session } = useSession();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");

  const [priFilter, setPriFilter] = useState<PriorityFilter>("all");

  const [editingText, setEditingText] = useState("");
  const [dueDate, setDueDate] = useState("");

  const editRef = useRef<HTMLInputElement>(null);

  /* ───────────────── CRUD ───────────────── */

  const addTodo = () => {
    if (!input.trim()) return;

    setTodos((p) => [
      {
        id: Date.now(),
        text: input.trim(),
        completed: false,
        createdAt: new Date(),
        priority,
        dueDate: dueDate || undefined,
        isEditing: false,
      },
      ...p,
    ]);

    setInput("");
    setDueDate("");
    setPriority("medium");

    toast.success("Task added ✨");
  };

  const deleteTodo = (id: number) => {
    setTodos((p) => p.filter((t) => t.id !== id));
    toast.error("Task deleted");
  };

  const toggleTodo = (id: number) => {
    const target = todos.find((todo) => todo.id === id);

    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
            }
          : todo
      )
    );

    if (target?.completed) {
      toast("Task marked active 🔄");
    } else {
      toast.success("Task completed 🎉");
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingText(todo.text);

    setTodos((p) =>
      p.map((t) => ({
        ...t,
        isEditing: t.id === todo.id,
      }))
    );

    setTimeout(() => editRef.current?.focus(), 80);
  };

  const cancelEdit = (id: number) => {
    setTodos((p) =>
      p.map((t) => (t.id === id ? { ...t, isEditing: false } : t))
    );
  };

  const saveEdit = (id: number) => {
    if (!editingText.trim()) return;

    setTodos((p) =>
      p.map((t) =>
        t.id === id
          ? {
              ...t,
              text: editingText.trim(),
              isEditing: false,
            }
          : t
      )
    );

    toast.success("Task updated ✨");
  };

  const clearDone = () => setTodos((p) => p.filter((t) => !t.completed));

  /* ───────────────── FILTER ───────────────── */

  const filtered = useMemo(() => {
    let r = todos;

    if (filter === "active") {
      r = r.filter((t) => !t.completed);
    }

    if (filter === "completed") {
      r = r.filter((t) => t.completed);
    }

    if (priFilter !== "all") {
      r = r.filter((t) => t.priority === priFilter);
    }

    if (search.trim()) {
      r = r.filter((t) => t.text.toLowerCase().includes(search.toLowerCase()));
    }

    return [...r].sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;

      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [todos, filter, priFilter, search]);

  const doneCount = todos.filter((t) => t.completed).length;

  const progress =
    todos.length === 0 ? 0 : Math.round((doneCount / todos.length) * 100);

  /* ───────────────── STORAGE ───────────────── */

  useEffect(() => {
    const savedTodos = localStorage.getItem("todo-dashboard");

    if (savedTodos) {
      const parsed = JSON.parse(savedTodos);

      setTodos(
        parsed.map((todo: Todo) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
        }))
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("todo-dashboard", JSON.stringify(todos));
  }, [todos]);

  /* ───────────────── RENDER ───────────────── */

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          padding: "clamp(1rem,4vw,2rem)",
          boxSizing: "border-box",
        }}
      >
        {/* HEADING */}

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ marginBottom: "1.5rem" }}
        >
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
              color: "#fff",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              marginBottom: 6,
            }}
          >
            My Tasks
          </h1>

          <p
            style={{
              fontSize: "clamp(12px,2vw,14px)",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            {todos.length === 0
              ? "Start by adding your first task below ✦"
              : `${doneCount} of ${todos.length} tasks completed`}
          </p>
        </motion.div>

        {/* STATS */}

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.45 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
            gap: 12,
            marginBottom: "1.5rem",
          }}
        >
          {(
            [
              {
                label: "Total",
                value: todos.length,
                accent: "#a78bfa",
              },
              {
                label: "Completed",
                value: doneCount,
                accent: "#4ade80",
              },
              {
                label: "Remaining",
                value: todos.length - doneCount,
                accent: "#fb923c",
              },
            ] as const
          ).map(({ label, value, accent }) => (
            <div
              key={label}
              style={{
                padding: "1rem 1.2rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18,
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.3)",
                  marginBottom: 8,
                }}
              >
                {label}
              </p>

              <p
                style={{
                  fontSize: "clamp(2rem,6vw,2.6rem)",
                  fontWeight: 800,
                  color: accent,
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* PROGRESS */}

        {todos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginBottom: "1.5rem" }}
          >
            <div
              style={{
                height: 5,
                borderRadius: 999,
                background: "rgba(255,255,255,0.07)",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  height: "100%",
                  borderRadius: 999,
                  background: "linear-gradient(90deg,#7c3aed,#a78bfa)",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 6,
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span>{progress}% complete</span>

              <span>
                {
                  todos.filter(
                    (t) => !t.completed && getDueDays(t.dueDate)?.overdue
                  ).length
                }{" "}
                overdue
              </span>
            </div>
          </motion.div>
        )}

        {/* SEARCH */}

        <div
          style={{
            position: "relative",
            marginBottom: "0.85rem",
          }}
        >
          <RiSearchLine
            style={{
              position: "absolute",
              left: 15,
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(255,255,255,0.22)",
              fontSize: 16,
            }}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            style={{
              width: "100%",
              padding: "12px 16px 12px 42px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 14,
              color: "#fff",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* ADD TASK */}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 10,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 16,
            padding: "12px",
            marginBottom: "1.2rem",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Add a new task…"
            style={{
              flex: "1 1 220px",
              minWidth: 0,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: 14,
            }}
          />

          {/* PRIORITY */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <RiFlag2Line
              style={{
                color: "rgba(255,255,255,0.25)",
                fontSize: 13,
              }}
            />

            {(["high", "medium", "low"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  cursor: "pointer",
                  background: PRI[p].bg,
                  border: `2px solid ${
                    priority === p ? PRI[p].color : "transparent"
                  }`,
                }}
              />
            ))}
          </div>

          {/* DATE */}

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: "7px 10px",
              color: "rgba(255,255,255,0.7)",
              fontSize: 12,
              outline: "none",
              colorScheme: "dark",
              width: "100%",
              maxWidth: 180,
            }}
          />

          <motion.button
            onClick={addTodo}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: "100%",
              maxWidth: 160,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 6,
              padding: "10px 18px",
              borderRadius: 11,
              background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
              border: "none",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RiAddLine style={{ fontSize: 15 }} />
            Add Task
          </motion.button>
        </motion.div>

        {/* FILTERS */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.16 }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: "1.5rem",
          }}
        >
          <Label>Status</Label>

          {(["all", "active", "completed"] as FilterType[]).map((f) => (
            <Pill
              key={f}
              active={filter === f}
              onClick={() => setFilter(f)}
              label={f.charAt(0).toUpperCase() + f.slice(1)}
            />
          ))}

          <Divider />

          <Label>Priority</Label>

          {(["all", "high", "medium", "low"] as PriorityFilter[]).map((p) => (
            <Pill
              key={p}
              active={priFilter === p}
              onClick={() => setPriFilter(p)}
              label={
                p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)
              }
              color={p !== "all" ? PRI[p].color : undefined}
            />
          ))}
        </motion.div>

        {/* TODO LIST */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  textAlign: "center",
                  padding: "4rem 1rem",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px dashed rgba(255,255,255,0.07)",
                  borderRadius: 20,
                  color: "rgba(255,255,255,0.22)",
                  fontSize: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    marginBottom: 8,
                  }}
                >
                  ✦
                </div>

                {search
                  ? `No results for "${search}"`
                  : "No tasks here — add one above"}
              </motion.div>
            ) : (
              filtered.map((todo, i) => {
                const due = getDueDays(todo.dueDate);
                const pri = PRI[todo.priority];

                return (
                  <motion.div
                    key={todo.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        delay: i * 0.035,
                      },
                    }}
                    exit={{
                      opacity: 0,
                      x: 16,
                    }}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "14px",
                      background: due?.overdue
                        ? "rgba(248,113,113,0.06)"
                        : "rgba(255,255,255,0.04)",
                      border: due?.overdue
                        ? "1px solid rgba(248,113,113,0.22)"
                        : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 16,
                    }}
                  >
                    {/* CHECKBOX */}

                    <button
                      onClick={() => toggleTodo(todo.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        color: todo.completed
                          ? "#4ade80"
                          : "rgba(255,255,255,0.28)",
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      {todo.completed ? (
                        <RiCheckboxCircleFill />
                      ) : (
                        <RiRadioButtonLine />
                      )}
                    </button>

                    {/* BODY */}

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {todo.isEditing ? (
                        <input
                          ref={editRef}
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          style={{
                            width: "100%",
                            background: "rgba(255,255,255,0.07)",
                            border: "1px solid rgba(167,139,250,0.45)",
                            borderRadius: 10,
                            padding: "8px 12px",
                            color: "#fff",
                            fontSize: 14,
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                      ) : (
                        <>
                          <p
                            style={{
                              fontSize: 14,
                              lineHeight: 1.55,
                              marginBottom: 7,
                              wordBreak: "break-word",
                              color: todo.completed
                                ? "rgba(255,255,255,0.28)"
                                : "rgba(255,255,255,0.88)",
                              textDecoration: todo.completed
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {todo.text}
                          </p>

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 6,
                              alignItems: "center",
                            }}
                          >
                            <Badge
                              bg={pri.bg}
                              border={pri.border}
                              color={pri.color}
                            >
                              {todo.priority}
                            </Badge>

                            {due && (
                              <Badge
                                bg={
                                  due.overdue
                                    ? "rgba(248,113,113,0.14)"
                                    : "rgba(255,255,255,0.06)"
                                }
                                border={
                                  due.overdue
                                    ? "rgba(248,113,113,0.3)"
                                    : "rgba(255,255,255,0.1)"
                                }
                                color={
                                  due.overdue
                                    ? "#f87171"
                                    : "rgba(255,255,255,0.45)"
                                }
                              >
                                {due.label}
                              </Badge>
                            )}

                            <span
                              style={{
                                fontSize: 10,
                                color: "rgba(255,255,255,0.18)",
                              }}
                            >
                              {new Date(todo.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* ACTIONS */}

                    <div
                      style={{
                        display: "flex",
                        gap: 2,
                        flexShrink: 0,
                      }}
                    >
                      {todo.isEditing ? (
                        <>
                          <IconBtn
                            onClick={() => saveEdit(todo.id)}
                            hoverColor="#60a5fa"
                          >
                            <RiSaveLine />
                          </IconBtn>

                          <IconBtn
                            onClick={() => cancelEdit(todo.id)}
                            hoverColor="#fbbf24"
                          >
                            <RiCloseLine />
                          </IconBtn>
                        </>
                      ) : (
                        <IconBtn
                          onClick={() => startEdit(todo)}
                          hoverColor="#fff"
                        >
                          <RiEdit2Line />
                        </IconBtn>
                      )}

                      <IconBtn
                        onClick={() => deleteTodo(todo.id)}
                        hoverColor="#f87171"
                      >
                        <RiDeleteBinLine />
                      </IconBtn>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER */}

        {doneCount > 0 && (
          <div
            style={{
              marginTop: "1.4rem",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={clearDone}
              style={{
                width: "100%",
                maxWidth: 220,
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.2)",
                color: "rgba(248,113,113,0.75)",
                padding: "10px 16px",
                borderRadius: 11,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Clear completed ({doneCount})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────── COMPONENTS ───────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.2)",
      }}
    >
      {children}
    </span>
  );
}

function Divider() {
  return (
    <div
      style={{
        width: 1,
        height: 16,
        background: "rgba(255,255,255,0.1)",
        margin: "0 4px",
      }}
    />
  );
}

function Pill({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s",
        border: active
          ? `1px solid ${color ?? "rgba(167,139,250,0.4)"}`
          : "1px solid rgba(255,255,255,0.08)",
        background: active
          ? color
            ? `${color}1a`
            : "rgba(167,139,250,0.14)"
          : "rgba(255,255,255,0.03)",
        color: active ? color ?? "#c4b5fd" : "rgba(255,255,255,0.38)",
      }}
    >
      {label}
    </button>
  );
}

function Badge({
  children,
  bg,
  border,
  color,
}: {
  children: React.ReactNode;
  bg: string;
  border: string;
  color: string;
}) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 999,
        background: bg,
        border: `1px solid ${border}`,
        color,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

function IconBtn({
  onClick,
  hoverColor,
  children,
}: {
  onClick: () => void;
  hoverColor: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{
        scale: 1.15,
        color: hoverColor,
      }}
      whileTap={{ scale: 0.9 }}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "rgba(255,255,255,0.2)",
        fontSize: 17,
        display: "flex",
        alignItems: "center",
        padding: 5,
        borderRadius: 7,
      }}
    >
      {children}
    </motion.button>
  );
}
