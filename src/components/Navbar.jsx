import React, { useState } from "react";
import { GraduationCap, Menu, X } from "lucide-react";

export default function Navbar({ currentView, onViewChange, user, onLoginClick, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (view) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  const handleMobileToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar" style={{ position: "relative", zIndex: 1000 }}>
      <div className="container navbar-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="#" className="logo-link font-poppins" onClick={() => handleNavClick("home")} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/logo.png" alt="College Mentor Logo" style={{ height: "42px", objectFit: "contain" }} />
        </a>

        {/* Desktop Menu links */}
        <div className="nav-links desktop-only-nav">
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
              <button className="nav-link btn-secondary" onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}>
                Logout
              </button>
            </>
          ) : (
            <button className="nav-link btn-primary font-poppins" onClick={onLoginClick}>
              Login / Sign Up
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button 
          className="mobile-hamburger-btn" 
          onClick={handleMobileToggle}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "none", // Will be toggled visible in App.css media query
            color: "var(--secondary)",
            padding: "8px"
          }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer/Dropdown Panel */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-nav-panel font-poppins"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid var(--card-border)",
            padding: "16px 24px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
            zIndex: 999
          }}
        >
          <button
            className={`nav-link-mobile ${currentView === "home" ? "active" : ""}`}
            style={mobileNavLinkStyle(currentView === "home")}
            onClick={() => handleNavClick("home")}
          >
            Predictor
          </button>

          {user ? (
            <>
              <button
                className={`nav-link-mobile ${currentView === "dashboard" ? "active" : ""}`}
                style={mobileNavLinkStyle(currentView === "dashboard")}
                onClick={() => handleNavClick("dashboard")}
              >
                Dashboard
              </button>
              {user.role === "admin" && (
                <button
                  className={`nav-link-mobile ${currentView === "admin" ? "active" : ""}`}
                  style={mobileNavLinkStyle(currentView === "admin")}
                  onClick={() => handleNavClick("admin")}
                >
                  Admin Panel
                </button>
              )}
              <button 
                className="btn btn-secondary" 
                style={{ width: "100%", padding: "10px", marginTop: "8px", justifyContent: "center" }}
                onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
              >
                Logout
              </button>
            </>
          ) : (
            <button 
              className="btn btn-primary" 
              style={{ width: "100%", padding: "12px", marginTop: "8px", justifyContent: "center" }}
              onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }}
            >
              Login / Sign Up
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

// Styling helper for mobile nav links
const mobileNavLinkStyle = (isActive) => ({
  display: "block",
  width: "100%",
  padding: "12px 16px",
  textAlign: "left",
  fontSize: "0.95rem",
  fontWeight: "600",
  borderRadius: "10px",
  border: "none",
  background: isActive ? "var(--primary-light)" : "transparent",
  color: isActive ? "var(--primary)" : "var(--secondary-light)",
  cursor: "pointer",
  transition: "all 0.2s"
});

