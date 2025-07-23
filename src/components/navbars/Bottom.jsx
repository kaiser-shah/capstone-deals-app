import React, { useState } from "react";
import 'bootstrap-icons/font/bootstrap-icons.css';

const items = [
  { label: "Menu", icon: "bi-list" },
  { label: "Alerts", icon: "bi-alarm" },
  { label: "Post", icon: "bi-plus-square" },
  { label: "Log in", icon: "bi-person" },
];

export default function Bottom() {
  const [selected, setSelected] = useState(null);
  return (
    <nav
      className="w-100 position-fixed bottom-0 start-0 d-flex justify-content-around align-items-center"
      style={{
        background: "#fff",
        boxShadow: "0 -1px 4px rgba(0,0,0,0.04)",
        minHeight: 70,
        zIndex: 1030,
        left: 0,
        right: 0,
        borderRadius: 0
      }}
    >
      {items.map((item, idx) => (
        <div
          key={item.label}
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ cursor: "pointer", minWidth: 60 }}
          onClick={() => setSelected(idx)}
        >
          <i
            className={`bi ${item.icon}`}
            style={{ fontSize: 28, color: "#111" }}
          ></i>
          <span style={{ fontSize: 15, color: "#111", marginTop: 2 }}>{item.label}</span>
        </div>
      ))}
    </nav>
  );
}
