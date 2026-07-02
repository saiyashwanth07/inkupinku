import React, { useState, useEffect, memo } from "react";
import { Star, MapPin, Award, Check, ChevronDown, ChevronUp } from "lucide-react";
import { getBranchDisplayName } from "../utils/branchNames";
import { saveLead } from "../utils/db";

const CollegeCard = memo(function CollegeCard({
  college,
  isFavorite,
  onFavoriteToggle,
  onRequestDetails,
  user
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

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        <div className="branches-header-title font-poppins">
          <span>Eligible Branches & Cutoffs ({eligibleBranches?.length || 0})</span>
        </div>
        
        <div className="branches-grid-layout">
          {eligibleBranches && (isExpanded ? eligibleBranches : eligibleBranches.slice(0, isMobile ? 0 : 2)).map((eb) => (
            <div className="branch-tag-modern" key={eb.branch}>
              <div className="branch-info-col">
                <span className="branch-code-text font-poppins">{getBranchDisplayName(eb.branch)}</span>
                <span className="branch-cutoff-text">Cutoff Rank: <strong>{eb.closingRank.toLocaleString()}</strong></span>
              </div>
              <span className={`branch-chance-indicator-modern ${getChanceBadgeClass(eb.chance)}`}>
                {eb.chance}
              </span>
            </div>
          ))}
        </div>

        {eligibleBranches && (isMobile ? eligibleBranches.length > 0 : eligibleBranches.length > 2) && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="font-poppins"
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary)', 
              fontWeight: '600', 
              fontSize: '0.8rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              cursor: 'pointer',
              padding: '8px 0 0 0',
              marginTop: '4px'
            }}
          >
            {isMobile 
              ? (isExpanded ? 'Hide Eligible Branches' : 'See Eligible Branches') 
              : (isExpanded ? 'See Less' : `See all branches (+${eligibleBranches.length - 2} more)`)}
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
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
              href={`https://api.whatsapp.com/send?phone=917997166666&text=Hi!%20I%20am%20interested%20in%20admissions%20at%20${encodeURIComponent(name)}.`}
              target="_blank"
              rel="noreferrer"
              className="btn-talk-expert font-poppins"
              onClick={() => saveLead({
                userId: user?.uid || user?.id || "guest",
                name: user?.name || "Guest User",
                mobile: user?.phoneNumber || user?.phone || "",
                university: name,
                action: "Talk to Expert"
              })}
            >
              Talk to an Expert
            </a>
          )}
        </div>
      </div>
    </div>
  );
});

export default CollegeCard;
