import React, { useState } from "react";
import { MapPin, Phone, MessageSquare, X } from "lucide-react";

// Hardcoded featured universities — shown as natural continuation of results
const FEATURED_UNIVERSITIES = [
  { id: "fu-1",  name: "Aditya University",                        city: "Surampalem",  state: "Andhra Pradesh", initials: "AU",  color: "#6366f1" },
  { id: "fu-2",  name: "MGR Educational & Research Institute",      city: "Chennai",     state: "Tamil Nadu",     initials: "MGR", color: "#8b5cf6" },
  { id: "fu-3",  name: "Quantum University",                        city: "Roorkee",     state: "Uttarakhand",    initials: "QU",  color: "#0ea5e9" },
  { id: "fu-4",  name: "Alliance University",                       city: "Bengaluru",   state: "Karnataka",      initials: "AU",  color: "#10b981" },
  { id: "fu-5",  name: "NPS University",                            city: "Bengaluru",   state: "Karnataka",      initials: "NPS", color: "#f59e0b" },
  { id: "fu-6",  name: "Saptagiri College of Engineering",          city: "Hyderabad",   state: "Telangana",      initials: "SCE", color: "#ef4444" },
  { id: "fu-7",  name: "Chandigarh University",                     city: "Mohali",      state: "Punjab",         initials: "CU",  color: "#6366f1" },
  { id: "fu-8",  name: "Amity University Hyderabad",                city: "Hyderabad",   state: "Telangana",      initials: "AMH", color: "#8b5cf6" },
  { id: "fu-9",  name: "Kaveri University",                         city: "Hyderabad",   state: "Telangana",      initials: "KU",  color: "#0ea5e9" },
  { id: "fu-10", name: "Bharath University",                        city: "Chennai",     state: "Tamil Nadu",     initials: "BU",  color: "#10b981" },
  { id: "fu-11", name: "Manav Rachna University",                   city: "Faridabad",   state: "Haryana",        initials: "MRU", color: "#f59e0b" },
  { id: "fu-12", name: "Ganpat University",                         city: "Mehsana",     state: "Gujarat",        initials: "GNU", color: "#ef4444" },
  { id: "fu-13", name: "Vishwa Vishwani Institute",                 city: "Hyderabad",   state: "Telangana",      initials: "VVI", color: "#6366f1" },
];

const WHATSAPP_LINK = "https://api.whatsapp.com/send?phone=917997166666&text=Hi,%20I%20need%20information%20about%20university%20admissions%20and%20guidance.";

function ExpertModal({ university, onClose }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content" style={{ maxWidth: "460px" }}>
        {/* Modal top glow strip */}
        <div className="modal-header">
          <div className="modal-title font-poppins">
            <span style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: `linear-gradient(135deg, ${university.color}33, ${university.color}66)`,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.75rem", fontWeight: "800", color: university.color, flexShrink: 0
            }}>
              {university.initials.slice(0, 2)}
            </span>
            <span>Need information about {university.name}?</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: "1.6" }}>
            Our admission experts can help you with:
          </p>

          {/* What we help with */}
          <div style={{
            background: "var(--bg-alt)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            padding: "14px 16px",
            marginBottom: "20px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px"
          }}>
            {[
              "Admission Process",
              "Eligibility",
              "Courses Offered",
              "Fee Structure",
              "Hostel Information",
              "Scholarship Guidance",
              "Campus Details",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                <span style={{ color: "var(--safe)", fontWeight: "700", fontSize: "0.9rem" }}>✓</span>
                {item}
              </div>
            ))}
          </div>

          {/* Helpline info */}
          <div style={{
            background: "var(--primary-light)",
            border: "1px solid var(--primary-mid)",
            borderRadius: "var(--r-md)",
            padding: "12px 16px",
            marginBottom: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.88rem", color: "var(--text-primary)" }}>
              <Phone size={15} style={{ color: "var(--primary)", flexShrink: 0 }} />
              <span><strong>Call:</strong>{" "}
                <a href="tel:7997166666" style={{ color: "var(--primary)", fontWeight: "700" }}>7997166666</a>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.88rem", color: "var(--text-primary)" }}>
              <MessageSquare size={15} style={{ color: "#25d366", flexShrink: 0 }} />
              <span><strong>WhatsApp:</strong>{" "}
                <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" style={{ color: "#25d366", fontWeight: "700" }}>7997166666</a>
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <a
              href="tel:7997166666"
              className="btn btn-primary font-poppins"
              style={{ width: "100%", justifyContent: "center", gap: "8px", textDecoration: "none" }}
            >
              <Phone size={16} /> Call Now
            </a>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="btn font-poppins"
              style={{
                width: "100%", justifyContent: "center", gap: "8px", textDecoration: "none",
                background: "#25d366", color: "white",
                boxShadow: "0 4px 14px rgba(37,211,102,0.3)"
              }}
            >
              <MessageSquare size={16} /> Chat on WhatsApp
            </a>
            <button
              className="btn font-poppins"
              onClick={onClose}
              style={{
                width: "100%", justifyContent: "center",
                background: "var(--bg-surface)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-subtle)"
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedUniversities() {
  const [selectedUni, setSelectedUni] = useState(null);

  return (
    <>
      {/* Section Header */}
      <div style={{
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: "36px",
        marginTop: "40px",
        marginBottom: "24px"
      }}>
        <h2
          className="font-poppins"
          style={{ fontSize: "1.35rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "8px" }}
        >
          Featured Universities
        </h2>
        <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: "1.6", maxWidth: "640px" }}>
          Looking for more admission opportunities? Explore these universities and connect with our admission experts for personalized guidance.
        </p>
      </div>

      {/* University Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {FEATURED_UNIVERSITIES.map((uni) => (
          <div key={uni.id} className="rec-university-card">

            {/* Logo */}
            <div
              className="rec-logo-container font-poppins"
              style={{
                background: `linear-gradient(135deg, ${uni.color}, ${uni.color}cc)`,
                boxShadow: `0 4px 10px ${uni.color}33`,
                letterSpacing: "-0.5px"
              }}
            >
              {uni.initials.slice(0, 3)}
            </div>

            {/* Name & Location */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="font-poppins"
                style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "3px" }}
              >
                {uni.name}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <MapPin size={12} />
                <span>{uni.city}, {uni.state}</span>
              </div>
            </div>

            {/* CTA */}
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
              <button
                className="btn btn-primary font-poppins"
                onClick={() => setSelectedUni(uni)}
                style={{ whiteSpace: "nowrap", padding: "8px 16px", fontSize: "0.82rem" }}
              >
                Talk to an Expert
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
                <Phone size={10} />
                <span>Admission Helpline:</span>
                <a href="tel:7997166666" style={{ fontWeight: "700", color: "var(--primary)", fontSize: "0.72rem" }}>
                  7997166666
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expert Modal */}
      {selectedUni && (
        <ExpertModal university={selectedUni} onClose={() => setSelectedUni(null)} />
      )}
    </>
  );
}
