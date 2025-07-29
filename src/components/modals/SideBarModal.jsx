import React from "react";
import { useNavigate } from "react-router-dom";

export default function SideBarModal({ show, onClose }) {
  const navigate = useNavigate();

  return (
    <div
      className={`sidebar-modal-overlay ${show ? "show" : ""}`}
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "100vw",
        background: show ? "rgba(0,0,0,0.2)" : "transparent",
        zIndex: 3000,
        transition: "background 0.3s",
        pointerEvents: show ? "auto" : "none"
      }}
    >
      <div
        className={`sidebar-modal-panel ${show ? "slide-in" : ""}`}
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: 320,
          maxWidth: "90vw",
          background: "#fff",
          boxShadow: "2px 0 16px rgba(0,0,0,0.08)",
          zIndex: 3100,
          transform: show ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(.4,0,.2,1)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 20px 10px 20px", borderBottom: "1px solid #eee" }}>
          <span style={{ fontWeight: 700, fontSize: 22 }}>Menu</span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 28,
              cursor: "pointer",
              color: "#888"
            }}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div style={{ padding: "20px 0" }}>
          <SideBarItem icon="bi-house-door" label="Home" onClick={() => { onClose(); navigate("/"); }} />
          <SideBarItem icon="bi-info-circle" label="About Us" onClick={() => { onClose(); navigate("/about"); }} />
          <SideBarItem icon="bi-lightbulb" label="How it works" inactive />
          <SideBarItem icon="bi-mortarboard" label="Dojo" inactive />
          <SideBarItem icon="bi-chat-left-text" label="Discussions" inactive />
          <SideBarItem icon="bi-gear" label="Settings" inactive />
        </div>
      </div>
      <style>{`
        .sidebar-modal-overlay {
          transition: background 0.3s;
        }
        .sidebar-modal-panel {
          transition: transform 0.3s cubic-bezier(.4,0,.2,1);
        }
        .sidebar-modal-panel.slide-in {
          transform: translateX(0);
        }
      `}</style>
    </div>
  );
}

function SideBarItem({ icon, label, onClick, inactive }) {
  return (
    <div
      onClick={inactive ? undefined : onClick}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "16px 28px",
        fontSize: 18,
        color: inactive ? "#bbb" : "#222",
        cursor: inactive ? "not-allowed" : "pointer",
        opacity: inactive ? 0.6 : 1,
        transition: "background 0.2s",
        gap: 18
      }}
      tabIndex={inactive ? -1 : 0}
    >
      <i className={`bi ${icon}`} style={{ fontSize: 22, marginRight: 12, color: inactive ? "#bbb" : "#e53935" }} />
      <span>{label}</span>
    </div>
  );
}
