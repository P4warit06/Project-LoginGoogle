"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { RiLogoutBoxLine, RiShieldCheckLine, RiMapLine } from "react-icons/ri";
import TodoDashboard from "./TodoDashBoard";
import { HiSparkles } from "react-icons/hi2";
import { useState } from "react";
import { FaMicrosoft } from "react-icons/fa";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.09, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
};

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  borderRadius: "32px", // Slightly larger radius
  padding: "3rem", // More padding
  boxShadow:
    "0 0 0 1px rgba(255,255,255,0.05), 0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
};

export function AuthCard() {
  const { data: session, status } = useSession();
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignIn = async (provider: string) => {
    setSigningIn(true);
    await signIn(provider);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: "/" });
  };

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
            {/* Badge */}
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
                <RiShieldCheckLine />
                Focus Mode Active
              </span>
            </motion.div>

            {/* Avatar */}
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

            {/* Name */}
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

            {/* Info rows */}
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

            {/* Dashboard Component */}
            <TodoDashboard />

            {/* Sign out */}
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
          {/* Header */}
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
              The ultimate workspace to organize your life, track progress, and
              achieve more every single day.
            </p>
          </motion.div>

          {/* Card */}
          <div style={{ ...cardStyle, padding: "2.25rem 2.5rem" }}>
            {/* Features */}
            <motion.div
              custom={1}
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

            {/* Divider */}
            <motion.div
              custom={2}
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

            {/* Google button */}
            <motion.div
              custom={3}
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
                    "0 8px 40px rgba(167,139,250,0.25), 0 2px 16px rgba(0,0,0,0.35)",
                }}
                whileTap={{ scale: 0.975 }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "15px 24px",
                  borderRadius: 14,
                  background: "#ffffff",
                  border: "none",
                  color: "#111827",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: signingIn ? "not-allowed" : "pointer",
                  opacity: signingIn ? 0.65 : 1,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "0.01em",
                }}
              >
                <FcGoogle style={{ fontSize: 22, flexShrink: 0 }} />
                {signingIn ? "Connecting…" : "Continue with Google"}
              </motion.button>
            </motion.div>

            {/* Microsoft Button */}
            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <motion.button
                onClick={() => handleSignIn("azure-ad")}
                disabled={signingIn}
                whileHover={{
                  scale: 1.025,
                  boxShadow:
                    "0 8px 40px rgba(37,99,235,0.25), 0 2px 16px rgba(0,0,0,0.35)",
                }}
                whileTap={{ scale: 0.975 }}
                style={{
                  marginTop: "12px",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "15px 24px",
                  borderRadius: 14,
                  border: "none",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: signingIn ? "not-allowed" : "pointer",
                  opacity: signingIn ? 0.65 : 1,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "0.01em",
                  background: "#2563eb",
                  color: "white",
                }}
              >
                <FaMicrosoft style={{ fontSize: 20, flexShrink: 0 }} />
                {signingIn ? "Connecting…" : "Continue with Microsoft"}
              </motion.button>
            </motion.div>

            {/* Fine print */}
            <motion.p
              custom={4}
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
