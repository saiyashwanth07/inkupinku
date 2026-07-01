import React from "react";
import { MapPin, BookOpen, GraduationCap, Award, ExternalLink, HelpCircle } from "lucide-react";

export default function Recommendation({ universities, onGetGuidance }) {
  if (!universities || universities.length === 0) return null;

  return (
    <div style={{ marginTop: "48px" }}>
      <div className="recommendations-title-area">
        <h2 className="recommendations-title font-poppins">Recommended Universities for Your Profile</h2>
        <p className="recommendations-subtitle">
          Based on your rank and preferences, these universities may offer excellent admission opportunities with strong academics, placements, and scholarships.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {universities.map((uni) => (
          <div className="rec-university-card" key={uni.id}>
            <div className="card-header-area">
              <div className="college-info-group">
                <div
                  className="rec-logo-container font-poppins"
                  style={{ backgroundColor: uni.logoColor || "var(--primary)" }}
                >
                  {uni.logoText}
                </div>
                <div className="college-name-details">
                  <div className="college-name-row">
                    <h3 className="college-name-title font-poppins">{uni.name}</h3>
                    <span className="badge-rec-open font-poppins">Admissions Open</span>
                  </div>
                  
                  <div className="college-meta">
                    <div className="meta-item">
                      <MapPin size={14} />
                      <span>{uni.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rec-details-grid">
              <div className="rec-detail-item">
                <div className="rec-detail-label font-poppins">
                  <BookOpen size={13} style={{ verticalAlign: "middle", marginRight: "4px" }} />
                  Popular Courses
                </div>
                <div className="rec-detail-value">
                  {uni.popularCourses.join(", ")}
                </div>
              </div>

              <div className="rec-detail-item">
                <div className="rec-detail-label font-poppins">
                  <Award size={13} style={{ verticalAlign: "middle", marginRight: "4px" }} />
                  Placements & Industry Partners
                </div>
                <div className="rec-detail-value">
                  {uni.placementAssistance}
                </div>
              </div>

              <div className="rec-detail-item" style={{ gridColumn: "span 2" }}>
                <div className="rec-detail-label font-poppins">
                  <GraduationCap size={13} style={{ verticalAlign: "middle", marginRight: "4px" }} />
                  Scholarships Offered
                </div>
                <div className="rec-detail-value" style={{ color: "var(--primary)", fontWeight: "600" }}>
                  {uni.scholarshipsAvailable}
                </div>
              </div>
            </div>

            <div className="card-footer">
              <div className="fee-info-group">
                <span className="fee-label">Fees Starting From</span>
                <span className="fee-value">
                  <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>₹</span>
                  {uni.feeStartingFrom}
                  {uni.feeStartingFrom.includes("sem") ? "" : <span style={{ fontSize: "0.75rem", color: "var(--secondary-light)", fontWeight: "500" }}> / year</span>}
                </span>
              </div>

              <div className="card-actions-group">
                <button
                  className="btn btn-secondary"
                  onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(uni.name)}`, "_blank")}
                  style={{ display: "inline-flex", gap: "6px" }}
                >
                  Explore University <ExternalLink size={14} />
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => onGetGuidance(uni)}
                  style={{ background: "var(--accent-gradient)", display: "inline-flex", gap: "6px" }}
                >
                  Get Admission Guidance <HelpCircle size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
