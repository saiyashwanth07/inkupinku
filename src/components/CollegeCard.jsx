import React from "react";
import { Star, MapPin, Award, Check } from "lucide-react";

export default function CollegeCard({
  college,
  isFavorite,
  onFavoriteToggle,
  onRequestDetails
}) {
  const {
    id,
    name,
    code,
    district,
    type,
    isPartner,
    overallChance,
    eligibleBranches
  } = college;

  const getChanceBadgeClass = (chance) => {
    switch (chance?.toLowerCase()) {
      case "safe":
        return "badge-safe";
      case "possible":
        return "badge-possible";
      case "borderline":
        return "badge-borderline";
      default:
        return "badge-neutral";
    }
  };

  const getChanceDotColor = (chance) => {
    switch (chance?.toLowerCase()) {
      case "safe":
        return "#22c55e";
      case "possible":
        return "#f59e0b";
      case "borderline":
        return "#ef4444";
      default:
        return "#94a3b8";
    }
  };

  return (
    <div className={`college-card-modern ${isPartner ? "partner-active" : ""}`}>
      {/* Top Section */}
      <div className="card-top-row">
        <div className="card-logo-info">
          <div className="college-title-meta">
            <div className="college-name-row">
              <h3 className="college-name-title font-poppins">{name}</h3>
              {isPartner && <span className="tag-partner font-poppins">★ Partner</span>}
              <span className="tag-type font-poppins">{type}</span>
            </div>
            <div className="college-district-meta font-poppins">
              <span className="college-code-tag" style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "2px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "700" }}>{code}</span>
              <MapPin size={13} style={{ marginLeft: "4px" }} />
              <span>{district}</span>
            </div>
          </div>
        </div>

        {/* Overall Chance Badge at Top Right */}
        <div className="card-top-right-actions">
          <span className={`overall-chance-badge font-poppins ${getChanceBadgeClass(overallChance)}`}>
            <span className="badge-dot" style={{ backgroundColor: getChanceDotColor(overallChance) }} />
            {overallChance}
          </span>
          <button
            className={`fav-btn-modern ${isFavorite ? "active" : ""}`}
            onClick={() => onFavoriteToggle(id)}
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            <Star size={16} fill={isFavorite ? "var(--borderline)" : "none"} />
          </button>
        </div>
      </div>

      {/* Eligible Branches & Ranks Section */}
      <div className="card-branches-section">
        <div className="branches-header-title font-poppins">Eligible Branches & Cutoffs</div>
        <div className="branches-grid-layout">
          {eligibleBranches && eligibleBranches.map((eb) => (
            <div className="branch-tag-modern" key={eb.branch}>
              <div className="branch-info-col">
                <span className="branch-code-text font-poppins">{eb.branch}</span>
                <span className="branch-cutoff-text">Cutoff Rank: <strong>{eb.closingRank.toLocaleString()}</strong></span>
              </div>
              <span className={`branch-chance-indicator-modern ${getChanceBadgeClass(eb.chance)}`}>
                {eb.chance}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="card-actions-row">
        <div className="actions-left-grp">
          <button
            className="btn-request-details font-poppins"
            onClick={() => onRequestDetails(college, eligibleBranches?.[0]?.branch)}
          >
            Request Details
          </button>
          
          {isPartner && (
            <a
              href={`https://api.whatsapp.com/send?phone=917997166666&text=Hi!%20I%20am%20interested%20in%20learning%20more%20about%20admissions%20at%20${encodeURIComponent(name)}.`}
              target="_blank"
              rel="noreferrer"
              className="btn-talk-expert font-poppins"
            >
              Talk to an Expert
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

