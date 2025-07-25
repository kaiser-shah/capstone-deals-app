import React, { useState, useRef, useEffect } from "react";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from "react-router-dom";

const items = [
  { label: "Menu", icon: "bi-list" },
  { label: "Alerts", icon: "bi-bell" },
  { label: "Post", icon: "bi-plus-square" },
  { label: "Log in", icon: "bi-person" },
];

const AVATAR_PLACEHOLDER = "/fallback-avatar.png";

export default function Bottom({ onLoginClick, isLoggedIn, avatarUrl, onPostClick }) {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const navRef = useRef(null);

  // Remove selected state when clicking outside the navbar
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setSelected(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="w-100 position-fixed bottom-0 start-0 d-flex justify-content-around align-items-center"
      style={{
        background: "#fff",
        boxShadow: "0 -1px 4px rgba(0,0,0,0.04)",
        minHeight: 55,
        zIndex: 2000,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        borderRadius: 0,
        pointerEvents: "auto",
        position: "fixed",
        overflow: "visible"
      }}
    >
      {items.map((item, idx) => (
        <div
          key={item.label}
          className="d-flex flex-column align-items-center justify-content-center"
          style={{
            cursor: "pointer",
            minWidth: 60,
            borderRadius: 16,
            background: selected === idx ? "#eee" : "transparent",
            transition: "background 0.2s"
          }}
          onClick={() => {
            setSelected(idx);
            setTimeout(() => setSelected(null), 100); // Remove highlight right after click
            if (item.label === "Log in" && isLoggedIn) {
              navigate("/profile");
            } else if (item.label === "Log in" && onLoginClick) {
              onLoginClick();
            } else if (item.label === "Post") {
              if (isLoggedIn) {
                onPostClick();
              } else if (onLoginClick) {
                onLoginClick();
              }
            }
          }}
        >
          {item.label === "Log in" && isLoggedIn ? (
            <img
              src={avatarUrl || AVATAR_PLACEHOLDER}
              alt="User Avatar"
              style={{ width: 35, height: 35, borderRadius: "50%", objectFit: "cover", verticalAlign: "middle", marginTop: -6 }}
            />
          ) : (
            <>
              <i
                className={`bi ${item.icon}`}
                style={{ fontSize: 28, color: "#111" }}
              ></i>
            </>
          )}
        </div>
      ))}
    </nav>
  );
}
