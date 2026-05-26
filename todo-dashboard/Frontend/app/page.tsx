import { AuthCard } from "@/components/AuthCard";

export default function Page() {
  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        height: "100vh", // lock ความสูง desktop ไว้ที่ viewport
        width: "100%",
        backgroundColor: "#070708",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden", // desktop ไม่ scroll
        padding: "2rem",
        boxSizing: "border-box",
      }}
    >
      {/* override มือถือ scroll ได้ */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (max-width: 768px) {
          main {
            height: auto !important;
            min-height: 100vh !important;
            overflow: visible !important;
            overflow-y: auto !important;
            align-items: flex-start !important;
            -webkit-overflow-scrolling: touch;
          }
        }
      `,
        }}
      />

     
      <div
        style={{
          position: "fixed",
          top: "-200px",
          left: "-200px",
          width: 800,
          height: 800,
          borderRadius: "50%",
          pointerEvents: "none",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 65%)",
          filter: "blur(100px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "-150px",
          right: "-150px",
          width: 700,
          height: 700,
          borderRadius: "50%",
          pointerEvents: "none",
          background:
            "radial-gradient(circle, rgba(79,70,229,0.45) 0%, transparent 65%)",
          filter: "blur(110px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
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
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          maxHeight: "calc(100vh - 4rem)",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media (min-width: 769px) {
            div:has(> .auth-inner-wrap) {
              scrollbar-width: thin;
              scrollbar-color: rgba(167,139,250,0.3) transparent;
            }
            div:has(> .auth-inner-wrap)::-webkit-scrollbar { width: 4px; }
            div:has(> .auth-inner-wrap)::-webkit-scrollbar-track { background: transparent; }
            div:has(> .auth-inner-wrap)::-webkit-scrollbar-thumb {
              background: rgba(167,139,250,0.3);
              border-radius: 2px;
            }
          }
          @media (max-width: 768px) {
            div:has(> .auth-inner-wrap) {
              max-height: none !important;
              overflow: visible !important;
            }
          }
        `,
          }}
        />
        <div className="auth-inner-wrap">
          <AuthCard />
        </div>
      </div>
    </main>
  );
}
