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
    <div className="container dashboard-container font-poppins" style={{ padding: "40px 16px 80px", maxWidth: "1200px" }}>
      {/* Premium Welcome Banner */}
      <div style={{
        background: "linear-gradient(135deg, #1e40af 0%, #312e81 100%)",
        borderRadius: "24px",
        padding: "32px",
        color: "white",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        marginBottom: "32px"
      }}>
        {/* Decorative background glow circles */}
        <div style={{ position: "absolute", width: "300px", height: "300px", background: "rgba(59, 130, 246, 0.2)", borderRadius: "50%", top: "-100px", right: "-100px", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", width: "200px", height: "200px", background: "rgba(147, 51, 234, 0.2)", borderRadius: "50%", bottom: "-50px", left: "20%", filter: "blur(30px)" }} />

        <div style={{ position: "relative", zIndex: 2, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "24px" }}>
          <div>
            <span style={{ background: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(8px)", padding: "6px 14px", borderRadius: "100px", fontSize: "0.8rem", fontWeight: "600", letterSpacing: "1px", textTransform: "uppercase" }}>
              Dashboard
            </span>
            <h2 className="font-poppins" style={{ fontSize: "2rem", fontWeight: "800", marginTop: "12px", marginBottom: "8px", lineHeight: "1.2" }}>
              Welcome back, {user.name}!
            </h2>
            <p style={{ opacity: 0.9, fontSize: "0.95rem", maxWidth: "600px" }}>
              Check your saved colleges, rerun predictions, and track your admission counselling process. All your EAPCET counseling insights in one dashboard.
            </p>
          </div>
          <div style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            padding: "20px 24px",
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            minWidth: "250px"
          }}>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", opacity: 0.8, letterSpacing: "0.5px" }}>Need Admission Help?</div>
            <div style={{ fontWeight: "700", fontSize: "1.1rem" }}>Talk to our EAPCET Experts</div>
            <a href="tel:7997166666" style={{
              background: "white",
              color: "#1e40af",
              padding: "10px",
              borderRadius: "12px",
              textAlign: "center",
              fontWeight: "700",
              fontSize: "0.85rem",
              textDecoration: "none",
              marginTop: "4px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.2s"
            }}>
              📞 Call Helpline (7997166666)
            </a>
          </div>
        </div>
      </div>

      {/* Stats Summary Widgets Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        <div style={{ background: "white", padding: "24px", borderRadius: "20px", border: "1px solid var(--card-border)", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ background: "var(--primary-light)", color: "var(--primary)", width: "56px", height: "56px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Heart size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--secondary-light)", fontWeight: "500" }}>Saved Colleges</div>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--secondary)", marginTop: "2px" }}>{favorites.length}</div>
          </div>
        </div>
        <div style={{ background: "white", padding: "24px", borderRadius: "20px", border: "1px solid var(--card-border)", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ background: "var(--safe-light)", color: "var(--safe)", width: "56px", height: "56px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--secondary-light)", fontWeight: "500" }}>Support Requests</div>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--secondary)", marginTop: "2px" }}>{userLeads.length}</div>
          </div>
        </div>
        <div style={{ background: "white", padding: "24px", borderRadius: "20px", border: "1px solid var(--card-border)", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ background: "#fef3c7", color: "#d97706", width: "56px", height: "56px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <History size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--secondary-light)", fontWeight: "500" }}>Prediction Queries Run</div>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "var(--secondary)", marginTop: "2px" }}>{predictionHistory.length}</div>
          </div>
        </div>
      </div>

      {/* Counseling Journey Timeline Roadmap */}
      <div style={{
        background: "white",
        padding: "24px",
        borderRadius: "20px",
        border: "1px solid var(--card-border)",
        marginBottom: "32px"
      }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--secondary)", marginBottom: "20px" }}>Your Counselling Roadmap</h3>
        <div style={{ display: "flex", flexWrap: "wrap", justifyItems: "center", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "200px" }}>
            <div style={{ background: "var(--safe)", color: "white", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: "700" }}>✓</div>
            <div>
              <div style={{ fontWeight: "700", fontSize: "0.85rem" }}>Profile Registered</div>
              <div style={{ fontSize: "0.75rem", color: "var(--secondary-light)" }}>Completed successfully</div>
            </div>
          </div>
          <div style={{ height: "2px", background: "var(--safe)", flex: "0 0 30px", minWidth: "10px" }} />
          
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "200px" }}>
            <div style={{ background: predictionHistory.length > 0 ? "var(--safe)" : "var(--primary)", color: "white", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: "700" }}>
              {predictionHistory.length > 0 ? "✓" : "2"}
            </div>
            <div>
              <div style={{ fontWeight: "700", fontSize: "0.85rem" }}>Predictor Run</div>
              <div style={{ fontSize: "0.75rem", color: "var(--secondary-light)" }}>
                {predictionHistory.length > 0 ? "Analyzed colleges matches" : "Analyze your rank"}
              </div>
            </div>
          </div>
          <div style={{ height: "2px", background: predictionHistory.length > 0 ? "var(--safe)" : "#e2e8f0", flex: "0 0 30px", minWidth: "10px" }} />
          
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "200px" }}>
            <div style={{ background: userLeads.length > 0 ? "var(--safe)" : "#e2e8f0", color: userLeads.length > 0 ? "white" : "var(--secondary-light)", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: "700" }}>
              {userLeads.length > 0 ? "✓" : "3"}
            </div>
            <div>
              <div style={{ fontWeight: "700", fontSize: "0.85rem" }}>Admission Support</div>
              <div style={{ fontSize: "0.75rem", color: "var(--secondary-light)" }}>
                {userLeads.length > 0 ? "Request sent to helpline" : "Talk to a counselor"}
              </div>
            </div>
          </div>
          <div style={{ height: "2px", background: userLeads.length > 0 ? "var(--safe)" : "#e2e8f0", flex: "0 0 30px", minWidth: "10px" }} />
          
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "200px" }}>
            <div style={{ background: "#e2e8f0", color: "var(--secondary-light)", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: "700" }}>4</div>
            <div>
              <div style={{ fontWeight: "700", fontSize: "0.85rem" }}>Web Options Guide</div>
              <div style={{ fontSize: "0.75rem", color: "var(--secondary-light)" }}>Final option entry lock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div style={{
        display: "flex",
        background: "#f1f5f9",
        padding: "6px",
        borderRadius: "16px",
        marginBottom: "24px",
        gap: "4px",
        overflowX: "auto"
      }}>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 20px",
            border: "none",
            borderRadius: "12px",
            fontSize: "0.9rem",
            fontWeight: "600",
            cursor: "pointer",
            background: activeTab === "profile" ? "white" : "transparent",
            color: activeTab === "profile" ? "var(--primary)" : "var(--secondary-light)",
            boxShadow: activeTab === "profile" ? "0 4px 6px -1px rgba(0, 0, 0, 0.05)" : "none",
            transition: "all 0.2s"
          }}
          onClick={() => setActiveTab("profile")}
        >
          <User size={16} /> Profile Info
        </button>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 20px",
            border: "none",
            borderRadius: "12px",
            fontSize: "0.9rem",
            fontWeight: "600",
            cursor: "pointer",
            background: activeTab === "saved" ? "white" : "transparent",
            color: activeTab === "saved" ? "var(--primary)" : "var(--secondary-light)",
            boxShadow: activeTab === "saved" ? "0 4px 6px -1px rgba(0, 0, 0, 0.05)" : "none",
            transition: "all 0.2s"
          }}
          onClick={() => setActiveTab("saved")}
        >
          <Heart size={16} /> Saved Colleges ({favorites.length})
        </button>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 20px",
            border: "none",
            borderRadius: "12px",
            fontSize: "0.9rem",
            fontWeight: "600",
            cursor: "pointer",
            background: activeTab === "requested" ? "white" : "transparent",
            color: activeTab === "requested" ? "var(--primary)" : "var(--secondary-light)",
            boxShadow: activeTab === "requested" ? "0 4px 6px -1px rgba(0, 0, 0, 0.05)" : "none",
            transition: "all 0.2s"
          }}
          onClick={() => setActiveTab("requested")}
        >
          <FileText size={16} /> Counselling Requests ({userLeads.length})
        </button>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 20px",
            border: "none",
            borderRadius: "12px",
            fontSize: "0.9rem",
            fontWeight: "600",
            cursor: "pointer",
            background: activeTab === "history" ? "white" : "transparent",
            color: activeTab === "history" ? "var(--primary)" : "var(--secondary-light)",
            boxShadow: activeTab === "history" ? "0 4px 6px -1px rgba(0, 0, 0, 0.05)" : "none",
            transition: "all 0.2s"
          }}
          onClick={() => setActiveTab("history")}
        >
          <History size={16} /> Prediction Logs ({predictionHistory.length})
        </button>
      </div>

      {/* Tabs Content Frame */}
      <div style={{ marginTop: "24px" }}>
        
        {/* Profile Details Tab */}
        {activeTab === "profile" && (
          <div style={{
            background: "white",
            border: "1px solid var(--card-border)",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "24px", marginBottom: "32px" }}>
              <div style={{
                background: "linear-gradient(135deg, var(--primary) 0%, #312e81 100%)",
                color: "white",
                width: "80px",
                height: "80px",
                borderRadius: "24px",
                fontSize: "2rem",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.3)"
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--secondary)", margin: 0 }}>{user.name}</h3>
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <span style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "4px 10px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: "600" }}>
                    Verified Student
                  </span>
                  <span style={{ background: "var(--safe-light)", color: "var(--safe)", padding: "4px 10px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: "600" }}>
                    EAPCET-2024
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", borderTop: "1px solid #f1f5f9", paddingTop: "32px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--secondary-light)", fontWeight: "600", letterSpacing: "0.5px" }}>Email ID</span>
                <span style={{ fontSize: "0.95rem", color: "var(--secondary)", fontWeight: "600" }}>{user.email}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--secondary-light)", fontWeight: "600", letterSpacing: "0.5px" }}>Mobile Number</span>
                <span style={{ fontSize: "0.95rem", color: "var(--secondary)", fontWeight: "600" }}>{user.phoneNumber || user.phone || "Not Linked"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--secondary-light)", fontWeight: "600", letterSpacing: "0.5px" }}>Counselling Status</span>
                <span style={{ fontSize: "0.95rem", color: userLeads.length > 0 ? "var(--safe)" : "var(--primary)", fontWeight: "700" }}>
                  {userLeads.length > 0 ? "Active - Counseling Underway" : "Ready to Start"}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--secondary-light)", fontWeight: "600", letterSpacing: "0.5px" }}>User Level</span>
                <span style={{ fontSize: "0.95rem", color: "var(--secondary)", fontWeight: "600", textTransform: "capitalize" }}>{user.role}</span>
              </div>
            </div>
          </div>
        )}

        {/* Saved Colleges Tab */}
        {activeTab === "saved" && (
          <div>
            {favoriteColleges.length === 0 ? (
              <div className="empty-state" style={{ background: "white", padding: "48px 24px", borderRadius: "24px", border: "1px solid var(--card-border)" }}>
                <Heart size={48} className="empty-icon" style={{ color: "#cbd5e1", marginBottom: "16px" }} />
                <h4 className="empty-title font-poppins" style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--secondary)" }}>No Saved Colleges</h4>
                <p className="empty-text" style={{ color: "var(--secondary-light)", fontSize: "0.85rem", maxWidth: "400px", margin: "8px auto 0" }}>
                  You haven't saved any colleges yet. Use the EAPCET predictor form and click the star icon to bookmark colleges.
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
              <div className="empty-state" style={{ background: "white", padding: "48px 24px", borderRadius: "24px", border: "1px solid var(--card-border)" }}>
                <FileText size={48} className="empty-icon" style={{ color: "#cbd5e1", marginBottom: "16px" }} />
                <h4 className="empty-title font-poppins" style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--secondary)" }}>No Active Support Requests</h4>
                <p className="empty-text" style={{ color: "var(--secondary-light)", fontSize: "0.85rem", maxWidth: "400px", margin: "8px auto 0" }}>
                  You haven't requested counseling help yet. Click "Get Admission Guidance" on any matching college card.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
                {userLeads.map(lead => (
                  <div className="college-card" key={lead.id} style={{
                    background: "white",
                    padding: "24px",
                    borderRadius: "20px",
                    border: "1px solid var(--card-border)",
                    borderLeft: "5px solid var(--safe)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "16px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                  }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="lead-tag-col" style={{ background: "var(--safe-light)", color: "#065f46", fontSize: "0.7rem", fontWeight: "700", padding: "4px 8px", borderRadius: "6px" }}>
                          {lead.type}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "var(--safe)", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                          ● Under Review
                        </span>
                      </div>
                      <h4 className="font-poppins" style={{ fontSize: "1.05rem", fontWeight: "800", marginTop: "12px", color: "var(--secondary)", lineHeight: "1.3" }}>
                        {lead.collegeName}
                      </h4>
                    </div>
                    
                    <div style={{ fontSize: "0.85rem", color: "var(--secondary-light)", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div><strong>Preferred Branch:</strong> {lead.branch || "All Eligible Branches"}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>
                        <Calendar size={12} />
                        Submitted on {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px", display: "flex", gap: "10px" }}>
                      <a href="tel:7997166666" className="btn btn-secondary font-poppins" style={{ padding: "8px 12px", fontSize: "0.75rem", flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                        📞 Call Helpline
                      </a>
                      <a 
                        href={`https://api.whatsapp.com/send?phone=917997166666&text=Hi,%20I%20have%20an%20active%20counselling%20request%20for%20${encodeURIComponent(lead.collegeName)}.`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-primary font-poppins" 
                        style={{ padding: "8px 12px", fontSize: "0.75rem", background: "var(--safe)", boxShadow: "none", flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
                      >
                        💬 WhatsApp
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
              <div className="empty-state" style={{ background: "white", padding: "48px 24px", borderRadius: "24px", border: "1px solid var(--card-border)" }}>
                <History size={48} className="empty-icon" style={{ color: "#cbd5e1", marginBottom: "16px" }} />
                <h4 className="empty-title font-poppins" style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--secondary)" }}>No Prediction History</h4>
                <p className="empty-text" style={{ color: "var(--secondary-light)", fontSize: "0.85rem", maxWidth: "400px", margin: "8px auto 0" }}>
                  Run predictions using your EAPCET rank/marks to see your log history populated here.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {predictionHistory.map((hist, idx) => (
                  <div key={idx} style={{
                    background: "white",
                    padding: "20px 24px",
                    borderRadius: "20px",
                    border: "1px solid var(--card-border)",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "16px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                  }}>
                    <div>
                      <div className="font-poppins" style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--primary)" }}>
                        {hist.inputType === "rank" ? `Rank: ${hist.rank.toLocaleString()}` : `Marks: ${hist.inputValue} (Est. Rank: ${hist.rank.toLocaleString()})`}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                        <span style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", color: "var(--secondary-light)", fontWeight: "500" }}>Category: {hist.category}</span>
                        <span style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", color: "var(--secondary-light)", fontWeight: "500" }}>Gender: {hist.gender}</span>
                        <span style={{ background: "#f1f5f9", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", color: "var(--secondary-light)", fontWeight: "500" }}>Local Area: {hist.localArea}</span>
                        <span style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "600" }}>
                          Matches: {hist.matchesCount} colleges
                        </span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px", marginTop: "8px" }}>
                        <Calendar size={12} />
                        Run on {new Date(hist.date).toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <button
                        className="btn btn-secondary font-poppins"
                        style={{ display: "inline-flex", gap: "6px", padding: "10px 20px", fontSize: "0.8rem", width: "100%", justifyContent: "center" }}
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

