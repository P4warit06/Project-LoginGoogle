"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import {
  RiLogoutBoxLine,
  RiShieldCheckLine,
  RiMapLine,
  RiLockLine,
  RiAddLine,
  RiCheckboxCircleFill,
  RiRadioButtonLine,
} from "react-icons/ri";
import TodoDashboard from "./TodoDashBoard";
import { HiSparkles } from "react-icons/hi2";
import { useState } from "react";
import { FaMicrosoft } from "react-icons/fa";

/* ── Animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.09,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
};

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  borderRadius: "32px",
  padding: "3rem",
  boxShadow:
    "0 0 0 1px rgba(255,255,255,0.05), 0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
};

/* ── Fake todo data for preview ── */
const PREVIEW_TODOS = [
  {
    id: 1,
    text: "Design new landing page",
    priority: "high",
    done: false,
    due: "Today",
  },
  {
    id: 2,
    text: "Review pull requests",
    priority: "medium",
    done: true,
    due: "2d left",
  },
  {
    id: 3,
    text: "Write weekly report",
    priority: "low",
    done: false,
    due: "5d left",
  },
  {
    id: 4,
    text: "Update dependencies",
    priority: "medium",
    done: false,
    due: "Overdue",
  },
];
const PRI_COLOR = {
  high: "#f87171",
  medium: "#fb923c",
  low: "#4ade80",
} as const;
const PRI_BG = {
  high: "rgba(248,113,113,0.12)",
  medium: "rgba(251,146,60,0.12)",
  low: "rgba(74,222,128,0.12)",
} as const;

/* ════════════════════════════════════ */
export function AuthCard() {
  const { data: session, status } = useSession();
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSignIn = async (provider: string) => {
    setSigningIn(true);

    // ── ตรวจว่ากำลังรันใน LINE WebView ไหม ──
    const isLineWebView =
      typeof window !== "undefined" && /Line\//.test(navigator.userAgent);

    if (isLineWebView) {
      // Google/Microsoft บล็อก OAuth ใน LINE embedded browser
      // ต้องเปิด external browser แทน
      const callbackUrl = encodeURIComponent(window.location.href);
      const signInUrl = `/api/auth/signin/${provider}?callbackUrl=${callbackUrl}`;

      // ถ้ามี LIFF SDK โหลดอยู่ — ใช้ openWindow เพื่อเปิด external browser
      const liff = (
        window as unknown as {
          liff?: {
            openWindow: (opt: { url: string; external: boolean }) => void;
          };
        }
      ).liff;
      if (liff?.openWindow) {
        liff.openWindow({
          url: window.location.origin + signInUrl,
          external: true,
        });
      } else {
        // Fallback: redirect ตรงๆ (บางครั้ง LINE อนุญาต)
        window.location.href = signInUrl;
      }
      setSigningIn(false);
      return;
    }

    await signIn(provider);
  };
  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: "/" });
  };

  const mobileStyles = `
    /* ── LINE LIFF / Mobile modal centering fix ── */
    .auth-modal-overlay {
      position: fixed !important;
      inset: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 101 !important;
      pointer-events: none !important;
    }
    .auth-modal-sheet {
      pointer-events: all !important;
      position: relative !important;
      top: auto !important;
      left: auto !important;
      transform: none !important;
      width: 90% !important;
      max-width: 400px !important;
    }

    @media (max-width: 480px) {
      .auth-hero-h1 { font-size: 1.9rem !important; }
      .auth-btn     { min-height: 48px !important; font-size: 15px !important; }
      /* bottom sheet บนมือถือ */
      .auth-modal-overlay {
        align-items: flex-end !important;
      }
      .auth-modal-sheet {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 24px 24px 0 0 !important;
        padding-bottom: max(1.5rem, env(safe-area-inset-bottom)) !important;
      }
    }
  `;

  if (status === "loading") {
    return (
      <div
        style={{
          ...cardStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "2px solid rgba(167,139,250,0.2)",
            borderTopColor: "#a78bfa",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: mobileStyles }} />
      <AnimatePresence mode="wait">
        {/* ══════════ LOGGED IN ══════════ */}
        {session ? (
          <motion.div
            key="logged-in"
            variants={scaleIn}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ width: "100%" }}
          >
            <div style={cardStyle}>
              <motion.div
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                style={{ marginBottom: "1.75rem" }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 12px",
                    borderRadius: 999,
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.2)",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#34d399",
                    letterSpacing: "0.05em",
                  }}
                >
                  <RiShieldCheckLine /> Focus Mode Active
                </span>
              </motion.div>

              <motion.div
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: -8,
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle, rgba(167,139,250,0.5) 0%, transparent 70%)",
                      filter: "blur(12px)",
                    }}
                  />
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                      width={92}
                      height={92}
                      style={{
                        position: "relative",
                        borderRadius: "50%",
                        outline: "2.5px solid rgba(167,139,250,0.55)",
                        outlineOffset: 3,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position: "relative",
                        width: 92,
                        height: 92,
                        borderRadius: "50%",
                        background: "rgba(139,92,246,0.2)",
                        outline: "2.5px solid rgba(167,139,250,0.55)",
                        outlineOffset: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2rem",
                        fontWeight: 700,
                        color: "#c4b5fd",
                      }}
                    >
                      {session.user?.name?.[0] ?? "U"}
                    </div>
                  )}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 2,
                      right: 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "#10b981",
                      border: "2.5px solid #070708",
                    }}
                  />
                </div>
              </motion.div>

              <motion.div
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                style={{ textAlign: "center", marginBottom: "1.75rem" }}
              >
                <h2
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "#fff",
                    letterSpacing: "-0.02em",
                    marginBottom: 4,
                  }}
                >
                  {session.user?.name}
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.35)",
                    fontWeight: 300,
                  }}
                >
                  Ready to crush your goals today? ✦
                </p>
              </motion.div>

              <motion.div
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: "1.75rem",
                }}
              >
                <InfoRow label="Profile" value={session.user?.name ?? "—"} />
                <InfoRow label="Account" value={session.user?.email ?? "—"} />
              </motion.div>

              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.06)",
                  marginBottom: "1.5rem",
                }}
              />

              <TodoDashboard />

              <motion.div
                custom={4}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                style={{ marginTop: "1.5rem" }}
              >
                <motion.button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  whileHover={{
                    scale: 1.02,
                    backgroundColor: "rgba(255,255,255,0.09)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "13px 24px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: signingOut ? "not-allowed" : "pointer",
                    opacity: signingOut ? 0.5 : 1,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <RiLogoutBoxLine />
                  {signingOut ? "Signing out…" : "End Session"}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          /* ══════════ LOGGED OUT ══════════ */
          <motion.div
            key="logged-out"
            variants={scaleIn}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ width: "100%" }}
          >
            {/* ── Hero header ── */}
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              style={{ textAlign: "center", marginBottom: "2rem" }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 60,
                  height: 60,
                  borderRadius: 18,
                  background: "rgba(139,92,246,0.18)",
                  border: "1px solid rgba(139,92,246,0.35)",
                  marginBottom: "1.25rem",
                  boxShadow:
                    "0 0 40px rgba(139,92,246,0.35), 0 0 80px rgba(139,92,246,0.15)",
                }}
              >
                <HiSparkles style={{ fontSize: 26, color: "#c4b5fd" }} />
              </div>
              <h1
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "clamp(2rem, 5vw, 2.6rem)",
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-0.035em",
                  lineHeight: 1.1,
                  marginBottom: "0.65rem",
                }}
              >
                Master Your{" "}
                <span
                  style={{
                    color: "#a78bfa",
                    textShadow: "0 0 40px rgba(167,139,250,0.7)",
                  }}
                >
                  Daily Tasks
                </span>
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.36)",
                  fontWeight: 300,
                  maxWidth: 320,
                  margin: "0 auto",
                  lineHeight: 1.75,
                }}
              >
                The ultimate workspace to organize your life, track progress,
                and achieve more every single day.
              </p>
            </motion.div>

            {/* ══════════════════════════════════════════
                LOCKED PREVIEW BOARD
            ══════════════════════════════════════════ */}
            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              style={{ marginBottom: "1.5rem" }}
            >
              <div
                style={{
                  position: "relative",
                  borderRadius: 24,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              >
                {/* ── Preview content (blurred & non-interactive) ── */}
                <div
                  style={{
                    pointerEvents: "none",
                    userSelect: "none",
                    filter: "blur(2px)",
                    padding: "1.5rem",
                  }}
                >
                  {/* Mini stat row */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3,1fr)",
                      gap: 8,
                      marginBottom: 14,
                    }}
                  >
                    {[
                      { label: "Total", value: "4", color: "#a78bfa" },
                      { label: "Done", value: "1", color: "#4ade80" },
                      { label: "Left", value: "3", color: "#fb923c" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 12,
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.3)",
                            marginBottom: 4,
                          }}
                        >
                          {s.label}
                        </p>
                        <p
                          style={{
                            fontSize: 24,
                            fontWeight: 800,
                            color: s.color,
                            lineHeight: 1,
                            fontFamily: "'DM Sans',sans-serif",
                          }}
                        >
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      height: 4,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.07)",
                      overflow: "hidden",
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        width: "25%",
                        height: "100%",
                        borderRadius: 999,
                        background: "linear-gradient(90deg,#7c3aed,#a78bfa)",
                      }}
                    />
                  </div>

                  {/* Fake search + add row */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <div
                      style={{
                        flex: 1,
                        height: 40,
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "rgba(255,255,255,0.2)",
                      }}
                    >
                      <RiAddLine />
                    </div>
                  </div>

                  {/* Fake todo items */}
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {PREVIEW_TODOS.map((todo) => (
                      <div
                        key={todo.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "12px 14px",
                          background:
                            todo.due === "Overdue"
                              ? "rgba(248,113,113,0.06)"
                              : "rgba(255,255,255,0.04)",
                          border:
                            todo.due === "Overdue"
                              ? "1px solid rgba(248,113,113,0.2)"
                              : "1px solid rgba(255,255,255,0.07)",
                          borderRadius: 14,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 20,
                            color: todo.done
                              ? "#4ade80"
                              : "rgba(255,255,255,0.25)",
                            flexShrink: 0,
                          }}
                        >
                          {todo.done ? (
                            <RiCheckboxCircleFill />
                          ) : (
                            <RiRadioButtonLine />
                          )}
                        </span>
                        <span
                          style={{
                            flex: 1,
                            fontSize: 13,
                            color: todo.done
                              ? "rgba(255,255,255,0.3)"
                              : "rgba(255,255,255,0.8)",
                            textDecoration: todo.done ? "line-through" : "none",
                          }}
                        >
                          {todo.text}
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            padding: "2px 7px",
                            borderRadius: 999,
                            background:
                              PRI_BG[todo.priority as keyof typeof PRI_BG],
                            color:
                              PRI_COLOR[
                                todo.priority as keyof typeof PRI_COLOR
                              ],
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {todo.priority}
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 600,
                            padding: "2px 7px",
                            borderRadius: 999,
                            background:
                              todo.due === "Overdue"
                                ? "rgba(248,113,113,0.15)"
                                : "rgba(255,255,255,0.07)",
                            color:
                              todo.due === "Overdue"
                                ? "#f87171"
                                : "rgba(255,255,255,0.4)",
                            border: `1px solid ${
                              todo.due === "Overdue"
                                ? "rgba(248,113,113,0.3)"
                                : "rgba(255,255,255,0.1)"
                            }`,
                          }}
                        >
                          {todo.due}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Lock overlay ── */}
                <div
                  onClick={() => setShowModal(true)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    cursor: "pointer",
                    background:
                      "linear-gradient(to bottom, rgba(7,7,8,0.1) 0%, rgba(7,7,8,0.75) 60%, rgba(7,7,8,0.95) 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    padding: "2rem",
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 10,
                      padding: "1.25rem 2rem",
                      borderRadius: 18,
                      background: "rgba(139,92,246,0.18)",
                      border: "1px solid rgba(139,92,246,0.35)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      boxShadow: "0 0 40px rgba(139,92,246,0.25)",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "rgba(139,92,246,0.25)",
                        border: "1px solid rgba(139,92,246,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <RiLockLine style={{ fontSize: 18, color: "#c4b5fd" }} />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#fff",
                          marginBottom: 3,
                          fontFamily: "'Syne',sans-serif",
                        }}
                      >
                        Sign in to unlock
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.4)",
                          fontWeight: 300,
                        }}
                      >
                        Your tasks are waiting for you
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* ── Login card ── */}
            <div style={{ ...cardStyle, padding: "2rem 2.5rem" }}>
              <motion.div
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: "1.75rem",
                }}
              >
                <FeatureRow
                  icon={<RiMapLine />}
                  text="Visualize your workflow and roadmap"
                />
                <FeatureRow
                  icon={<RiShieldCheckLine />}
                  text="Secure cloud sync across all devices"
                />
                <FeatureRow
                  icon={<HiSparkles />}
                  text="Smart prioritization for peak focus"
                />
              </motion.div>

              <motion.div
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "rgba(255,255,255,0.07)",
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.22)",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  Get Started
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "rgba(255,255,255,0.07)",
                  }}
                />
              </motion.div>

              {/* Google */}
              <motion.div
                custom={4}
                variants={fadeUp}
                initial="hidden"
                animate="show"
              >
                <motion.button
                  onClick={() => handleSignIn("google")}
                  disabled={signingIn}
                  whileHover={{
                    scale: 1.025,
                    boxShadow:
                      "0 8px 40px rgba(167,139,250,0.25),0 2px 16px rgba(0,0,0,0.35)",
                  }}
                  whileTap={{ scale: 0.975 }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    padding: "14px 24px",
                    borderRadius: 14,
                    background: "#ffffff",
                    border: "none",
                    color: "#111827",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: signingIn ? "not-allowed" : "pointer",
                    opacity: signingIn ? 0.65 : 1,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  <FcGoogle style={{ fontSize: 22, flexShrink: 0 }} />
                  {signingIn ? "Connecting…" : "Continue with Google"}
                </motion.button>
              </motion.div>

              {/* Microsoft */}
              <motion.div
                custom={5}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                style={{ marginTop: 10 }}
              >
                <motion.button
                  onClick={() => handleSignIn("azure-ad")}
                  disabled={signingIn}
                  whileHover={{
                    scale: 1.025,
                    boxShadow:
                      "0 8px 40px rgba(37,99,235,0.25),0 2px 16px rgba(0,0,0,0.35)",
                  }}
                  whileTap={{ scale: 0.975 }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    padding: "14px 24px",
                    borderRadius: 14,
                    background: "#2563eb",
                    border: "none",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: signingIn ? "not-allowed" : "pointer",
                    opacity: signingIn ? 0.65 : 1,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                    fontFamily: "'DM Sans',sans-serif",
                  }}
                >
                  <FaMicrosoft style={{ fontSize: 20, flexShrink: 0 }} />
                  {signingIn ? "Connecting…" : "Continue with Microsoft"}
                </motion.button>
              </motion.div>

              <motion.p
                custom={6}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.2)",
                  marginTop: "1rem",
                  lineHeight: 1.8,
                }}
              >
                Join thousands of users organizing their life with{" "}
                <span
                  style={{ color: "rgba(167,139,250,0.7)", cursor: "pointer" }}
                >
                  ToDo DashBoard
                </span>
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          LOGIN MODAL (triggered by clicking preview)
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            />

            {/* Modal overlay — flex center ทำงานได้ทุก WebView รวม LINE LIFF */}
            <div className="auth-modal-overlay">
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 12 }}
                transition={{
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                }}
                className="auth-modal-sheet"
                style={{
                  background: "rgba(12,10,20,0.97)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  borderRadius: 28,
                  padding: "2.5rem 2rem",
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.05), 0 40px 80px rgba(0,0,0,0.7), 0 0 60px rgba(139,92,246,0.15)",
                }}
              >
                {/* Lock icon */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "1.25rem",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: "rgba(139,92,246,0.18)",
                      border: "1px solid rgba(139,92,246,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 0 30px rgba(139,92,246,0.3)",
                    }}
                  >
                    <RiLockLine style={{ fontSize: 22, color: "#c4b5fd" }} />
                  </div>
                </div>

                <h2
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: "1.35rem",
                    color: "#fff",
                    textAlign: "center",
                    letterSpacing: "-0.02em",
                    marginBottom: 8,
                  }}
                >
                  Unlock Your Dashboard
                </h2>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.38)",
                    textAlign: "center",
                    lineHeight: 1.7,
                    marginBottom: "1.75rem",
                    fontWeight: 300,
                  }}
                >
                  Sign in to manage your tasks, track progress, and stay
                  productive across all your devices.
                </p>

                {/* Google */}
                <motion.button
                  onClick={() => handleSignIn("google")}
                  disabled={signingIn}
                  whileHover={{
                    scale: 1.025,
                    boxShadow: "0 8px 30px rgba(167,139,250,0.2)",
                  }}
                  whileTap={{ scale: 0.975 }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    padding: "13px 24px",
                    borderRadius: 14,
                    background: "#ffffff",
                    border: "none",
                    color: "#111827",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: signingIn ? "not-allowed" : "pointer",
                    opacity: signingIn ? 0.65 : 1,
                    marginBottom: 10,
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                  }}
                >
                  <FcGoogle style={{ fontSize: 20 }} />
                  {signingIn ? "Connecting…" : "Continue with Google"}
                </motion.button>

                {/* Microsoft */}
                <motion.button
                  onClick={() => handleSignIn("azure-ad")}
                  disabled={signingIn}
                  whileHover={{
                    scale: 1.025,
                    boxShadow: "0 8px 30px rgba(37,99,235,0.2)",
                  }}
                  whileTap={{ scale: 0.975 }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    padding: "13px 24px",
                    borderRadius: 14,
                    background: "#2563eb",
                    border: "none",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: signingIn ? "not-allowed" : "pointer",
                    opacity: signingIn ? 0.65 : 1,
                    marginBottom: "1.25rem",
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                  }}
                >
                  <FaMicrosoft style={{ fontSize: 18 }} />
                  {signingIn ? "Connecting…" : "Continue with Microsoft"}
                </motion.button>

                {/* Cancel */}
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    color: "rgba(255,255,255,0.25)",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    padding: "6px",
                  }}
                >
                  Maybe later
                </button>
              </motion.div>
            </div>
            {/* end auth-modal-overlay */}
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Sub-components ── */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "11px 16px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "rgba(255,255,255,0.28)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.75)",
          fontWeight: 300,
          maxWidth: "60%",
          textAlign: "right",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}
function FeatureRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          flexShrink: 0,
          width: 34,
          height: 34,
          borderRadius: 10,
          background: "rgba(139,92,246,0.12)",
          border: "1px solid rgba(139,92,246,0.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#a78bfa",
          fontSize: 15,
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.42)",
          fontWeight: 300,
          lineHeight: 1.5,
        }}
      >
        {text}
      </span>
    </div>
  );
}
