import { AuthCard } from "@/components/AuthCard";

export default function Page() {
  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#070708",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "auto", // Changed from hidden to auto for better scrolling
        padding: "2rem",
      }}
    >
      {/* Orb top-left - slightly larger */}
      <div
        style={{
          position: "absolute",
          top: "-200px",
          left: "-200px",
          width: 800,
          height: 800,
          borderRadius: "50%",
          pointerEvents: "none",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 65%)",
          filter: "blur(100px)",
        }}
      />
      {/* Orb bottom-right - slightly larger */}
      <div
        style={{
          position: "absolute",
          bottom: "-150px",
          right: "-150px",
          width: 700,
          height: 700,
          borderRadius: "50%",
          pointerEvents: "none",
          background:
            "radial-gradient(circle, rgba(79,70,229,0.45) 0%, transparent 65%)",
          filter: "blur(110px)",
        }}
      />
      {/* Center glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 1200,
          height: 1200,
          borderRadius: "50%",
          pointerEvents: "none",
          background:
            "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 55%)",
          filter: "blur(50px)",
        }}
      />

      {/* Grid with larger spacing */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "96px 96px", // Larger grid cells
        }}
      />

      {/* Removed maxWidth constraint - now takes full width */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "1200px", // Much wider container
          margin: "0 auto",
        }}
      >
        <AuthCard />
      </div>
    </main>
  );
}
