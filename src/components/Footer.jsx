import React from "react";
import { GraduationCap, Mail, Phone, MessageSquare, Shield } from "lucide-react";

const WA_LINK = "https://api.whatsapp.com/send?phone=917997166666&text=Hi,%20I%20need%20help%20with%20AP%20EAPCET%20counselling.";

export default function Footer({ onViewChange }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">

          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo font-poppins" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img src="/logo.png" alt="College Mentor Logo" style={{ height: "36px", objectFit: "contain" }} />
            </div>
            <p className="footer-desc">
              An intelligent college prediction platform helping AP EAPCET students find the best engineering admission opportunities across Andhra Pradesh.
            </p>
            <div style={{ marginTop: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "#64748B", marginBottom: "6px" }}>
                <Phone size={13} style={{ color: "#60A5FA" }} />
                <a href="tel:7997166666" style={{ color: "#93C5FD", fontWeight: "700" }}>7997166666</a>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "#64748B", marginBottom: "6px" }}>
                <MessageSquare size={13} style={{ color: "#4ADE80" }} />
                <a href={WA_LINK} target="_blank" rel="noreferrer" style={{ color: "#4ADE80", fontWeight: "700" }}>WhatsApp: 7997166666</a>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "#64748B" }}>
                <Mail size={13} style={{ color: "#60A5FA" }} />
                <a href="mailto:support@admissionindia.in" style={{ color: "#93C5FD" }}>support@admissionindia.in</a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-title font-poppins">Quick Links</h4>
            <div className="footer-links">
              <button className="footer-link" onClick={() => onViewChange("home")}>Predict Colleges</button>
              <button className="footer-link" onClick={() => onViewChange("home")}>Rank Estimator</button>
              <button className="footer-link" onClick={() => onViewChange("dashboard")}>Student Dashboard</button>
            </div>
          </div>

          {/* EAPCET Resources */}
          <div className="footer-col">
            <h4 className="footer-title font-poppins">EAPCET Resources</h4>
            <div className="footer-links">
              <a href="https://cets.apsche.ap.gov.in" target="_blank" rel="noreferrer" className="footer-link">Official APSCHE Website</a>
              <a href="#" className="footer-link">Previous Year Cutoff PDF</a>
              <a href="#" className="footer-link">Counseling Instructions</a>
              <a href="#" className="footer-link">Seat Matrix Details</a>
            </div>
          </div>

          {/* Support */}
          <div className="footer-col">
            <h4 className="footer-title font-poppins">Admission Support Team</h4>
            <div className="footer-links">
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>📞 Free Counselling Helpline</div>
                  <a href="tel:7997166666" style={{ fontSize: "0.92rem", fontWeight: "700", color: "#93C5FD" }}>7997166666</a>
                </div>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>💬 WhatsApp AI Assistant</div>
                  <a href={WA_LINK} target="_blank" rel="noreferrer" style={{ fontSize: "0.92rem", fontWeight: "700", color: "#4ADE80" }}>7997166666</a>
                </div>
                <div>
                  <div style={{ fontSize: "0.7rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>✉️ Email Support</div>
                  <a href="mailto:support@admissionindia.in" style={{ fontSize: "0.82rem", color: "#93C5FD" }}>support@admissionindia.in</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            &copy; {new Date().getFullYear()} AP EAPCET College Predictor. Built for educational guidance.
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: "600" }}>Powered by</span>
            <img src="/logo.png" alt="College Mentor" style={{ height: "24px", objectFit: "contain" }} />
          </div>

          <div className="footer-bottom-links">
            <a href="#" className="footer-link" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Shield size={11} /> Privacy Policy
            </a>
            <span style={{ color: "#1E293B" }}>|</span>
            <a href="#" className="footer-link">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
