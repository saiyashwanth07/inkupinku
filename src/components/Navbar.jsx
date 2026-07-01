import React from "react";
import { GraduationCap } from "lucide-react";

export default function Navbar({ currentView, onViewChange }) {
  const handleNavClick = (view) => {
    onViewChange(view);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <a href="#" className="logo-link font-poppins" onClick={() => handleNavClick("home")} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/logo.png" alt="College Mentor Logo" style={{ height: "42px", objectFit: "contain" }} />
        </a>

        <div className="nav-links">
          <button
            className={`nav-link btn-text ${currentView === "home" ? "active" : ""}`}
            onClick={() => handleNavClick("home")}
          >
            Predictor
          </button>
        </div>
      </div>
    </nav>
  );
}
