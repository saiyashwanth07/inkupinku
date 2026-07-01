import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, MapPin, Phone, MessageSquare, X, ShieldAlert, Star } from "lucide-react";

const FEATURED_UNIVERSITIES = [
  { id: "aditya", name: "Aditya University", city: "Surampalem", state: "AP", logoText: "AU", color: "#2563EB" },
  { id: "mbu", name: "Mohan Babu University", city: "Tirupati", state: "AP", logoText: "MBU", color: "#8B5CF6" },
  { id: "vishwavishwani", name: "Vishwa Vishwani", city: "Hyderabad", state: "Telangana", logoText: "VV", color: "#EC4899" },
  { id: "ganpat", name: "Ganpat University", city: "Mehsana", state: "Gujarat", logoText: "GNU", color: "#10B981" },
  { id: "bharath", name: "Bharath University Chennai", city: "Chennai", state: "Tamil Nadu", logoText: "BU", color: "#F59E0B" },
  { id: "manavrachna", name: "Manav Rachna University", city: "Faridabad", state: "Haryana", logoText: "MRU", color: "#EF4444" },
  { id: "amity", name: "Amity University Hyderabad", city: "Hyderabad", state: "Telangana", logoText: "AMITY", color: "#6366F1" },
  { id: "chandigarh", name: "Chandigarh University", city: "Mohali", state: "Punjab", logoText: "CU", color: "#14B8A6" },
  { id: "alliance", name: "Alliance University", city: "Bengaluru", state: "Karnataka", logoText: "ALU", color: "#8B5CF6" },
  { id: "quantum", name: "Quantum University", city: "Roorkee", state: "Uttarakhand", logoText: "QU", color: "#06B6D4" },
  { id: "kaveri", name: "Kaveri University", city: "Hyderabad", state: "Telangana", logoText: "KU", color: "#2563EB" },
  { id: "mgr", name: "MGR Educational & Research Institute", city: "Chennai", state: "Tamil Nadu", logoText: "MGR", color: "#F59E0B" },
  { id: "saptagiri", name: "Saptagiri College", city: "Hyderabad", state: "Telangana", logoText: "SC", color: "#EF4444" },
  { id: "nps", name: "NPS University", city: "Bengaluru", state: "Karnataka", logoText: "NPS", color: "#10B981" }
];

const WA_LINK = "https://api.whatsapp.com/send?phone=917997166666&text=Hi,%20I%20need%20help%20with%20admissions%20at%20";

const BADGES = [
  "Recommended based on your profile",
  "You may be eligible for admission",
  "Explore additional admission opportunities"
];

export default function FeaturedUniversityCard({ rank, startIndex = 0 }) {
  // Get recommended list based on rank
  const getRecommendedList = () => {
    const r = Number(rank) || 0;
    if (r === 0) return FEATURED_UNIVERSITIES;
    if (r <= 10000) {
      return FEATURED_UNIVERSITIES.filter(u => ["aditya", "vishwavishwani", "ganpat"].includes(u.id));
    } else if (r <= 25000) {
      return FEATURED_UNIVERSITIES.filter(u => ["aditya", "bharath", "manavrachna"].includes(u.id));
    } else if (r <= 50000) {
      return FEATURED_UNIVERSITIES.filter(u => ["bharath", "ganpat", "amity"].includes(u.id));
    } else if (r <= 100000) {
      return FEATURED_UNIVERSITIES.filter(u => ["quantum", "alliance", "chandigarh", "mgr"].includes(u.id));
    } else {
      return FEATURED_UNIVERSITIES;
    }
  };

  const list = getRecommendedList();
  const [currentIndex, setCurrentIndex] = useState(startIndex % list.length);
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const timerRef = useRef(null);

  const activeUni = list[currentIndex] || list[0];

  useEffect(() => {
    if (isHovered || list.length <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % list.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, list.length]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + list.length) % list.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % list.length);
  };

  const handleTalkToExpert = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleKnowMore = (e) => {
    e.preventDefault();
    window.open(`https://www.google.com/search?q=${encodeURIComponent(activeUni.name)}`, "_blank");
  };

  // Get dynamic badge text based on index
  const badgeText = BADGES[currentIndex % BADGES.length];

  if (!activeUni) return null;

  return (
    <>
      <div 
        className="recommended-university-card" 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Recommended Tag */}
        <div className="rec-tag font-poppins">
          <Star size={14} fill="var(--primary)" /> Recommended for You
        </div>

        {/* Top Info */}
        <div className="rec-card-body">
          <div className="rec-avatar font-poppins" style={{ backgroundColor: activeUni.color }}>
            {activeUni.logoText}
          </div>
          
          <div className="rec-text-details">
            <h4 className="rec-name font-poppins">{activeUni.name}</h4>
            <div className="rec-location font-poppins">
              <MapPin size={13} />
              <span>{activeUni.city}, {activeUni.state === "AP" ? "Andhra Pradesh" : activeUni.state}</span>
            </div>
            <p className="rec-description font-poppins">
              Based on your AP EAPCET profile, you may also explore this university.
            </p>
          </div>
        </div>

        {/* Actions Row */}
        <div className="rec-actions-row">
          <button 
            className="btn-talk-expert font-poppins" 
            onClick={handleTalkToExpert}
          >
            Talk to an Expert
          </button>
          
          <a 
            href="tel:7997166666" 
            className="btn-helpline font-poppins"
          >
            📞 7997166666
          </a>
        </div>
      </div>


      {/* Premium Talk to an Expert Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: "450px" }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title font-poppins">
                <ShieldAlert size={18} style={{ color: "var(--primary)" }} />
                <span>Need help choosing this university?</span>
              </div>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "20px" }}>
                Our admission experts can explain eligibility, admissions, fees, scholarships, and available programs at <strong>{activeUni.name}</strong>.
              </p>

              <div style={{
                background: "var(--primary-light)",
                border: "1px solid var(--primary-mid)",
                borderRadius: "var(--r-md)",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "20px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem", color: "var(--text-primary)" }}>
                  <Phone size={16} style={{ color: "var(--primary)" }} />
                  <span><strong>Call Helpline:</strong> <a href="tel:7997166666" style={{ fontWeight: "700", color: "var(--primary)" }}>7997166666</a></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.9rem", color: "var(--text-primary)" }}>
                  <MessageSquare size={16} style={{ color: "#22C55E" }} />
                  <span><strong>WhatsApp Bot:</strong> <a href={`${WA_LINK}${encodeURIComponent(activeUni.name)}`} target="_blank" rel="noreferrer" style={{ fontWeight: "700", color: "#22C55E" }}>7997166666</a></span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <a href="tel:7997166666" className="btn btn-primary font-poppins" style={{ textDecoration: "none", width: "100%", justifyContent: "center" }}>
                  Call Now
                </a>
                <a href={`${WA_LINK}${encodeURIComponent(activeUni.name)}`} target="_blank" rel="noreferrer" className="btn font-poppins" style={{ textDecoration: "none", width: "100%", justifyContent: "center", background: "#22C55E", color: "white" }}>
                  Chat on WhatsApp
                </a>
                <button className="btn btn-secondary font-poppins" onClick={() => setShowModal(false)} style={{ width: "100%" }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
