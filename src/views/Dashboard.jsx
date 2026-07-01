import React, { useState, useEffect } from "react";
import { User, Heart, History, FileText, Landmark, Trash2, Calendar, Star, RefreshCw, Phone, MessageSquare } from "lucide-react";
import { getColleges, getLeads } from "../utils/db";
import CollegeCard from "../components/CollegeCard";

export default function Dashboard({
  user,
  favorites,
  predictionHistory,
  onFavoriteToggle,
  onRequestDetails,
  onRerunPrediction
}) {
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "saved" | "requested" | "history"
  const [colleges, setColleges] = useState([]);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      const freshColleges = await getColleges();
      const freshLeads = await getLeads();
      setColleges(freshColleges);
      setLeads(freshLeads);
    };
    loadDashboardData();
  }, [activeTab]);

  // Filter colleges that are favorited
  const favoriteColleges = colleges.filter(col => favorites.includes(col.id)).map(col => {
    // Evaluate cutoffs based on latest history query parameters
    const latestQuery = predictionHistory[0];
    const rankToUse = latestQuery ? latestQuery.rank : 15000;
    const catToUse = latestQuery ? latestQuery.category : "OC";
    const genToUse = latestQuery ? latestQuery.gender : "Boys";
    const locToUse = latestQuery ? latestQuery.localArea : "AU";

    const eligibleBranches = [];
    for (const cutoff of col.cutoffs) {
      if (
        cutoff.category === catToUse &&
        cutoff.gender === genToUse &&
        cutoff.localArea === locToUse &&
        rankToUse <= cutoff.closingRank * 1.15
      ) {
        let chance = "";
        let chanceScore = 0;
        if (rankToUse <= cutoff.closingRank * 0.9) {
          chance = "Safe";
          chanceScore = 1;
        } else if (rankToUse <= cutoff.closingRank * 1.05) {
          chance = "Possible";
          chanceScore = 2;
        } else {
          chance = "Borderline";
          chanceScore = 3;
        }

        eligibleBranches.push({
          branch: cutoff.branch,
          closingRank: cutoff.closingRank,
          chance,
          chanceScore
        });
      }
    }

    // Default placeholder branches
    if (eligibleBranches.length === 0) {
      col.cutoffs.slice(0, 2).forEach(c => {
        eligibleBranches.push({
          branch: c.branch,
          closingRank: c.closingRank,
          chance: "Possible",
          chanceScore: 2
        });
      });
    } else {
      eligibleBranches.sort((a,b) => a.chanceScore - b.chanceScore);
    }

    return {
      ...col,
      eligibleBranches
    };
  });

  // Filter leads requested by this user's email
  const userLeads = leads.filter(lead => lead.email.toLowerCase() === user.email.toLowerCase());

  return (
    <div className="container dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title font-poppins">Welcome back, {user.name}!</h2>
          <p style={{ color: "var(--secondary-light)", fontSize: "0.95rem" }}>
            Manage your saved colleges, view prediction logs, and track admission guidance requests.
          </p>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`dash-tab-btn font-poppins ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          <User size={16} /> My Profile
        </button>
        <button
          className={`dash-tab-btn font-poppins ${activeTab === "saved" ? "active" : ""}`}
          onClick={() => setActiveTab("saved")}
        >
          <Heart size={16} /> Saved Colleges ({favorites.length})
        </button>
        <button
          className={`dash-tab-btn font-poppins ${activeTab === "requested" ? "active" : ""}`}
          onClick={() => setActiveTab("requested")}
        >
          <FileText size={16} /> Requested Support ({userLeads.length})
        </button>
        <button
          className={`dash-tab-btn font-poppins ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <History size={16} /> Prediction Logs ({predictionHistory.length})
        </button>
      </div>

      <div style={{ marginTop: "24px" }}>
        
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="profile-card">
            <div className="profile-avatar-row">
              <div className="profile-avatar font-poppins">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-poppins" style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--secondary)" }}>
                {user.name}
              </h3>
              <span className="badge-partner font-poppins" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                Student Profile
              </span>
            </div>

            <div className="profile-details-grid">
              <div className="profile-field">
                <span className="profile-field-label">Email Address</span>
                <span className="profile-field-value">{user.email}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Contact Phone</span>
                <span className="profile-field-value">{user.phone || "Not Configured"}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Account Role</span>
                <span className="profile-field-value" style={{ textTransform: "capitalize" }}>{user.role}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Favorites saved</span>
                <span className="profile-field-value">{favorites.length} colleges</span>
              </div>
            </div>
          </div>
        )}

        {/* Saved Colleges Tab */}
        {activeTab === "saved" && (
          <div>
            {favoriteColleges.length === 0 ? (
              <div className="empty-state">
                <Heart size={48} className="empty-icon" />
                <h4 className="empty-title font-poppins">No Saved Colleges</h4>
                <p className="empty-text">
                  You haven't saved any colleges yet. Use the predictor form on the homepage and click the star icon to bookmark colleges.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {favoriteColleges.map(college => (
                  <CollegeCard
                    key={college.id}
                    college={college}
                    isFavorite={true}
                    onFavoriteToggle={onFavoriteToggle}
                    onRequestDetails={onRequestDetails}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requested Support (Leads) Tab */}
        {activeTab === "requested" && (
          <div>
            {userLeads.length === 0 ? (
              <div className="empty-state">
                <FileText size={48} className="empty-icon" />
                <h4 className="empty-title font-poppins">No Active Support Requests</h4>
                <p className="empty-text">
                  You haven't requested counseling help yet. Click "Get Admission Guidance" on matching colleges or featured universities.
                </p>
              </div>
            ) : (
              <div className="dashboard-grid">
                {userLeads.map(lead => (
                  <div className="college-card" key={lead.id} style={{ gap: "12px", borderLeft: "4px solid var(--safe)" }}>
                    <div>
                      <span className="lead-tag-col" style={{ background: "var(--safe-light)", color: "#065f46", fontSize: "0.75rem" }}>
                        {lead.type}
                      </span>
                      <h4 className="font-poppins" style={{ fontSize: "1.05rem", fontWeight: "700", marginTop: "6px", color: "var(--secondary)" }}>
                        {lead.collegeName}
                      </h4>
                    </div>
                    
                    <div style={{ fontSize: "0.85rem", color: "var(--secondary-light)", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div><strong>Preferred Branch:</strong> {lead.branch}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", marginTop: "4px" }}>
                        <Calendar size={12} />
                        Submitted on {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "12px", marginTop: "4px", display: "flex", gap: "8px" }}>
                      <a href="tel:7997166666" className="btn btn-secondary font-poppins" style={{ padding: "6px 12px", fontSize: "0.75rem", flex: 1 }}>
                        📞 Call Helpline
                      </a>
                      <a 
                        href={`https://api.whatsapp.com/send?phone=917997166666&text=Hi,%20I%20have%20an%20active%20counselling%20request%20for%20${encodeURIComponent(lead.collegeName)}.`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-primary font-poppins" 
                        style={{ padding: "6px 12px", fontSize: "0.75rem", background: "var(--safe)", boxShadow: "none", flex: 1 }}
                      >
                        💬 WhatsApp AI
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Prediction Logs Tab */}
        {activeTab === "history" && (
          <div>
            {predictionHistory.length === 0 ? (
              <div className="empty-state">
                <History size={48} className="empty-icon" />
                <h4 className="empty-title font-poppins">No Prediction History</h4>
                <p className="empty-text">
                  Make predictions on the homepage using your EAPCET rank/marks to see your log history populated here.
                </p>
              </div>
            ) : (
              <div className="history-list">
                {predictionHistory.map((hist, idx) => (
                  <div className="history-item" key={idx}>
                    <div className="history-meta-info">
                      <div className="history-rank-display font-poppins">
                        {hist.inputType === "rank" ? `Rank: ${hist.rank.toLocaleString()}` : `Marks: ${hist.inputValue} (Est. Rank: ${hist.rank.toLocaleString()})`}
                      </div>
                      <div className="history-tags">
                        <span className="history-tag">Category: {hist.category}</span>
                        <span className="history-tag">Gender: {hist.gender}</span>
                        <span className="history-tag">Local Area: {hist.localArea}</span>
                        <span className="history-tag" style={{ background: "var(--primary-light)", color: "var(--primary)", fontWeight: "600" }}>
                          Matches: {hist.matchesCount} colleges
                        </span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                        <Calendar size={12} />
                        Run on {new Date(hist.date).toLocaleString()}
                      </div>
                    </div>

                    <div className="history-actions">
                      <button
                        className="btn btn-secondary font-poppins"
                        style={{ display: "inline-flex", gap: "6px", padding: "8px 16px", fontSize: "0.8rem" }}
                        onClick={() => onRerunPrediction(hist)}
                      >
                        <RefreshCw size={12} /> Re-run Prediction
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
