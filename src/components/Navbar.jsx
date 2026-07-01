import React from "react";
import { GraduationCap } from "lucide-react";

export default function Navbar({ currentView, onViewChange, user, onLoginClick, onLogout }) {
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
          
          {user ? (
            <>
              <button
                className={`nav-link btn-text ${currentView === "dashboard" ? "active" : ""}`}
                onClick={() => handleNavClick("dashboard")}
              >
                Dashboard
              </button>
              {user.role === "admin" && (
                <button
                  className={`nav-link btn-text ${currentView === "admin" ? "active" : ""}`}
                  onClick={() => handleNavClick("admin")}
                >
                  Admin Panel
                </button>
              )}
              <button className="nav-link btn-secondary" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <button className="nav-link btn-primary font-poppins" onClick={onLoginClick}>
              Login / Sign Up
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
