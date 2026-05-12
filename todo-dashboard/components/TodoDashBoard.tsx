"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiDeleteBinLine,
  RiAddLine,
  RiCheckboxCircleFill,
  RiRadioButtonLine,
} from "react-icons/ri";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}

type FilterType = "all" | "active" | "completed";

export default function TodoDashboard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  // Add Todo
  const addTodo = () => {
    if (!input.trim()) return;

    const newTodo: Todo = {
      id: Date.now(),
      text: input,
      completed: false,
      createdAt: new Date(),
    };

    setTodos((prev) => [newTodo, ...prev]);
    setInput("");
  };

  // Delete Todo
  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  // Toggle Complete
  const toggleTodo = (id: number) => {
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
  };

  // Clear Completed
  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  // Filter Todos
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);

      case "completed":
        return todos.filter((todo) => todo.completed);

      default:
        return todos;
    }
  }, [todos, filter]);

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div
      style={{
        marginTop: "2rem",
        padding: "2rem",
        borderRadius: 28,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        width: "100%",
        maxWidth: "none",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* ───────── HEADER ───────── */}
      <div
        style={{
          marginBottom: "1.8rem",
        }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: "white",
            marginBottom: 8,
          }}
        >
          Todo Dashboard
        </h1>

        <p
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 14,
          }}
        >
          Organize your tasks and stay productive ✨
        </p>
      </div>

      {/* ───────── STATS ───────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          marginBottom: "1.8rem",
        }}
      >
        <StatCard label="Total Tasks" value={todos.length} />
        <StatCard label="Completed" value={completedCount} />
        <StatCard label="Remaining" value={todos.length - completedCount} />
      </div>

      {/* ───────── INPUT ───────── */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: "1.5rem",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTodo();
          }}
          placeholder="What needs to be done?"
          style={{
            flex: 1,
            padding: "15px 18px",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.05)",
            color: "white",
            outline: "none",
            fontSize: 15,
          }}
        />

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={addTodo}
          style={{
            width: 60,
            borderRadius: 16,
            border: "none",
            background: "linear-gradient(135deg,#8b5cf6 0%,#6366f1 100%)",
            color: "white",
            cursor: "pointer",
            fontSize: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 30px rgba(139,92,246,0.35)",
          }}
        >
          <RiAddLine />
        </motion.button>
      </div>

      {/* ───────── FILTERS ───────── */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: "1.5rem",
        }}
      >
        <FilterButton
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label="All"
        />

        <FilterButton
          active={filter === "active"}
          onClick={() => setFilter("active")}
          label="Active"
        />

        <FilterButton
          active={filter === "completed"}
          onClick={() => setFilter("completed")}
          label="Completed"
        />
      </div>

      {/* ───────── TODO LIST ───────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <AnimatePresence>
          {filteredTodos.map((todo) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{
                duration: 0.22,
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px",
                borderRadius: 18,
                background: todo.completed
                  ? "rgba(34,197,94,0.08)"
                  : "rgba(255,255,255,0.04)",
                border: todo.completed
                  ? "1px solid rgba(34,197,94,0.18)"
                  : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTodo(todo.id)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: todo.completed ? "#4ade80" : "rgba(255,255,255,0.4)",
                  fontSize: 26,
                  display: "flex",
                }}
              >
                {todo.completed ? (
                  <RiCheckboxCircleFill />
                ) : (
                  <RiRadioButtonLine />
                )}
              </button>

              {/* Content */}
              <div
                style={{
                  flex: 1,
                }}
              >
                <p
                  style={{
                    color: todo.completed
                      ? "rgba(255,255,255,0.4)"
                      : "rgba(255,255,255,0.9)",
                    textDecoration: todo.completed ? "line-through" : "none",
                    fontSize: 15,
                    lineHeight: 1.5,
                  }}
                >
                  {todo.text}
                </p>

                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  {todo.createdAt.toLocaleString()}
                </span>
              </div>

              {/* Delete */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => deleteTodo(todo.id)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#f87171",
                  cursor: "pointer",
                  fontSize: 20,
                }}
              >
                <RiDeleteBinLine />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ───────── EMPTY ───────── */}
      {filteredTodos.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "2rem 0",
            color: "rgba(255,255,255,0.35)",
          }}
        >
          No tasks found ✨
        </div>
      )}

      {/* ───────── FOOTER ───────── */}
      {todos.length > 0 && (
        <div
          style={{
            marginTop: "1.8rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 13,
            }}
          >
            {completedCount} of {todos.length} completed
          </span>

          <button
            onClick={clearCompleted}
            style={{
              border: "none",
              background: "rgba(239,68,68,0.12)",
              color: "#f87171",
              padding: "10px 14px",
              borderRadius: 12,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Clear Completed
          </button>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────── */
/* Components */
/* ───────────────────────────────────── */

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: "1rem",
        borderRadius: 18,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <p
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.4)",
          marginBottom: 6,
        }}
      >
        {label}
      </p>

      <h2
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "white",
        }}
      >
        {value}
      </h2>
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 16px",
        borderRadius: 12,
        border: active
          ? "1px solid rgba(139,92,246,0.45)"
          : "1px solid rgba(255,255,255,0.06)",
        background: active ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.03)",
        color: active ? "#c4b5fd" : "rgba(255,255,255,0.55)",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {label}
    </button>
  );
}
