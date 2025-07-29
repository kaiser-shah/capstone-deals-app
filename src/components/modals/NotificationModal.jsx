import React from "react";

export default function NotificationModal({ show, onClose }) {
  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.2)",
        zIndex: 4000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "32px 28px 24px 28px",
          minWidth: 280,
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          position: "relative"
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16, textAlign: "center" }}>
          Notifications
        </div>
        <div style={{ fontSize: 16, color: "#444", textAlign: "center", marginBottom: 24 }}>
          You have no new notifications
        </div>
        <button
          onClick={onClose}
          style={{
            display: "block",
            margin: "0 auto",
            background: "#e53935",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 24px",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer"
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
