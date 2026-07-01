import React, { useState, useEffect } from "react";
import { 
  BarChart3, Landmark, FileSpreadsheet, UserCheck, ShieldAlert, 
  Trash2, Plus, Edit3, Search, Download, Trash, Award, Briefcase, MapPin, Database, Sparkles, RefreshCw
} from "lucide-react";
import { 
  getColleges, saveColleges, 
  getRecommendations, saveRecommendations, 
  getLeads, saveLeads, 
  getUsers, saveUsers,
  seedSupabaseDB
} from "../utils/db";
import { isSupabaseConfigured } from "../utils/supabase";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("leads"); // "leads" | "colleges" | "recommendations" | "users"
  
  // Data states
  const [leads, setLeads] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [users, setUsers] = useState([]);

  // Search states
  const [leadSearch, setLeadSearch] = useState("");
  const [collegeSearch, setCollegeSearch] = useState("");

  // CRUD Editing states
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  
  const [showRecModal, setShowRecModal] = useState(false);
  const [editingRec, setEditingRec] = useState(null);

  // Seeding states
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingMessage, setSeedingMessage] = useState("");

  // Form states for adding/editing college
  const [collegeForm, setCollegeForm] = useState({
    name: "",
    code: "",
    district: "Visakhapatnam",
    type: "Private",
    tuitionFee: 65000,
    website: "",
    isPartner: false,
    rating: 4.0,
    established: 2000,
    campusSize: "20 Acres",
    placements: ""
  });

  // Form states for recommended university
  const [recForm, setRecForm] = useState({
    name: "",
    location: "",
    popularCourses: "",
    feeStartingFrom: "",
    scholarshipsAvailable: "",
    placementAssistance: "",
    admissionsOpen: true,
    logoText: "",
    logoColor: "#2563eb",
    website: ""
  });

  // Load datasets on mount/active tab
  const reloadData = async () => {
    const fetchedLeads = await getLeads();
    const fetchedColleges = await getColleges();
    const fetchedRecommendations = await getRecommendations();
    const fetchedUsers = await getUsers();

    setLeads(fetchedLeads);
    setColleges(fetchedColleges);
    setRecommendations(fetchedRecommendations);
    setUsers(fetchedUsers);
  };

  useEffect(() => {
    reloadData();
  }, [activeTab, showCollegeModal, showRecModal]);

  // Seeding trigger
  const handleSeedDatabase = async () => {
    if (!window.confirm("Seed default dataset (16 colleges, ~6,000 cutoffs, 24 universities) to Supabase? This overwrites existing rows.")) {
      return;
    }
    
    setIsSeeding(true);
    setSeedingMessage("Initializing tables and seeding metadata...");
    
    try {
      const res = await seedSupabaseDB();
      if (res.success) {
        alert(`Successfully seeded Supabase! Seeded ${res.count} colleges and ${res.cutoffsCount} cutoff permutations chunk-by-chunk.`);
        await reloadData();
      }
    } catch (err) {
      alert(`Seeding failed. Make sure your VITE_SUPABASE_ANON_KEY is set in .env and tables are created. Error: ${err.message}`);
    } finally {
      setIsSeeding(false);
      setSeedingMessage("");
    }
  };

  // Export leads as CSV
  const exportLeadsCSV = () => {
    if (leads.length === 0) return;
    
    const headers = ["Lead ID", "Student Name", "Email Address", "Mobile Number", "Entity ID/College", "Preferred Branch", "Type", "Submission Date"];
    const rows = leads.map(l => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      l.email,
      l.mobile,
      `"${l.collegeName.replace(/"/g, '""')}"`,
      l.branch,
      l.type,
      new Date(l.createdAt).toLocaleString()
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `EAPCET_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete Handlers
  const handleDeleteLead = async (id) => {
    if (window.confirm("Delete this lead request?")) {
      const updated = leads.filter(l => l.id !== id);
      setLeads(updated);
      await saveLeads(updated);
    }
  };

  const handleDeleteCollege = async (id) => {
    if (window.confirm("Delete this college from database?")) {
      const updated = colleges.filter(c => c.id !== id);
      setColleges(updated);
      await saveColleges(updated);
    }
  };

  const handleDeleteRec = async (id) => {
    if (window.confirm("Delete this featured partner?")) {
      const updated = recommendations.filter(r => r.id !== id);
      setRecommendations(updated);
      await saveRecommendations(updated);
    }
  };

  const handleDeleteUser = async (email) => {
    if (email === "admin@eapcet.com") {
      alert("Cannot delete primary administrator account.");
      return;
    }
    if (window.confirm("Delete this user account?")) {
      const updated = users.filter(u => u.email !== email);
      setUsers(updated);
      await saveUsers(updated);
    }
  };

  // CRUD handlers: Colleges
  const openCollegeModal = (college = null) => {
    if (college) {
      setEditingCollege(college);
      setCollegeForm({ ...college });
    } else {
      setEditingCollege(null);
      setCollegeForm({
        name: "",
        code: "",
        district: "Visakhapatnam",
        type: "Private",
        tuitionFee: 65000,
        website: "",
        isPartner: false,
        rating: 4.0,
        established: 2000,
        campusSize: "20 Acres",
        placements: ""
      });
    }
    setShowCollegeModal(true);
  };

  const handleSaveCollege = async (e) => {
    e.preventDefault();
    if (!collegeForm.name || !collegeForm.code) {
      alert("Please fill in College Name and Code");
      return;
    }

    let updatedColleges = [...colleges];
    if (editingCollege) {
      updatedColleges = updatedColleges.map(c => 
        c.id === editingCollege.id ? { ...c, ...collegeForm } : c
      );
    } else {
      const newId = collegeForm.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const sourceCutoffs = colleges[0] ? colleges[0].cutoffs.map(c => ({...c})) : [];
      const newCol = {
        ...collegeForm,
        id: newId,
        cutoffs: sourceCutoffs
      };
      updatedColleges.push(newCol);
    }

    await saveColleges(updatedColleges);
    setShowCollegeModal(false);
    setEditingCollege(null);
  };

  // CRUD handlers: Recommendations
  const openRecModal = (rec = null) => {
    if (rec) {
      setEditingRec(rec);
      setRecForm({
        ...rec,
        popularCourses: rec.popularCourses.join(", ")
      });
    } else {
      setEditingRec(null);
      setRecForm({
        name: "",
        location: "",
        popularCourses: "CSE, ECE",
        feeStartingFrom: "1,20,000",
        scholarshipsAvailable: "Merit-based scholarships available",
        placementAssistance: "100% placement support",
        admissionsOpen: true,
        logoText: "NEW",
        logoColor: "#2563eb",
        website: ""
      });
    }
    setShowRecModal(true);
  };

  const handleSaveRec = async (e) => {
    e.preventDefault();
    if (!recForm.name || !recForm.location) {
      alert("Name and Location are required");
      return;
    }

    let updatedRecs = [...recommendations];
    const coursesArray = recForm.popularCourses.split(",").map(c => c.trim()).filter(Boolean);
    const newRec = {
      ...recForm,
      popularCourses: coursesArray
    };

    if (editingRec) {
      updatedRecs = updatedRecs.map(r => r.id === editingRec.id ? { ...r, ...newRec } : r);
    } else {
      newRec.id = recForm.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      updatedRecs.push(newRec);
    }

    await saveRecommendations(updatedRecs);
    setShowRecModal(false);
    setEditingRec(null);
  };

  // Metrics Computations
  const totalStudents = users.filter(u => u.role === "student").length;
  
  // Total Leads (Direct admission / details requested)
  const totalLeadsCount = leads.length;

  // Total Featured University Enquiries (Leads where target is one of the 24 universities)
  const featuredEnquiries = leads.filter(l => 
    recommendations.some(r => r.name.toLowerCase() === l.collegeName.toLowerCase() || r.id === l.collegeId)
  ).length;

  // Total Counselling Calls Requested (Helpline or direct counseling requests)
  const counselingCalls = leads.filter(l => l.type === "Counseling Call").length;

  // Most Searched College (based on EAPCET code matches in leads)
  const collegeLeadCounts = leads.reduce((acc, l) => {
    if (l.collegeCode && l.collegeCode !== "UNI") {
      acc[l.collegeCode] = (acc[l.collegeCode] || 0) + 1;
    }
    return acc;
  }, {});
  const mostSearchedCode = Object.entries(collegeLeadCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || "AUCE";

  // Most Requested University (based on featured entries in leads)
  const uniLeadCounts = leads.reduce((acc, l) => {
    const matchedUni = recommendations.find(r => r.name.toLowerCase() === l.collegeName.toLowerCase() || r.id === l.collegeId);
    if (matchedUni) {
      acc[matchedUni.name] = (acc[matchedUni.name] || 0) + 1;
    }
    return acc;
  }, {});
  const mostRequestedUni = Object.entries(uniLeadCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || "Aditya University";

  // Chart: Leads by District (Top 5)
  const leadDistrictsGroup = leads.reduce((acc, l) => {
    const matchedCol = colleges.find(c => c.name.toLowerCase() === l.collegeName.toLowerCase() || c.code === l.collegeCode);
    const dist = matchedCol ? matchedCol.district : "National Partners";
    acc[dist] = (acc[dist] || 0) + 1;
    return acc;
  }, {});
  const districtChartData = Object.entries(leadDistrictsGroup).sort((a,b) => b[1] - a[1]).slice(0, 5);
  const maxDistrictLeads = districtChartData.length > 0 ? Math.max(...districtChartData.map(d => d[1])) : 1;

  // Chart: Leads by Branch
  const branchInterests = leads.reduce((acc, l) => {
    if (l.branch) {
      acc[l.branch] = (acc[l.branch] || 0) + 1;
    }
    return acc;
  }, {});
  const branchChartData = Object.entries(branchInterests).sort((a,b) => b[1] - a[1]).slice(0, 5);
  const maxBranchLeads = branchChartData.length > 0 ? Math.max(...branchChartData.map(b => b[1])) : 1;

  // Filter lists for view table
  const filteredLeads = leads.filter(lead => {
    const term = leadSearch.toLowerCase();
    return (
      lead.name.toLowerCase().includes(term) ||
      lead.email.toLowerCase().includes(term) ||
      lead.collegeName.toLowerCase().includes(term) ||
      lead.branch.toLowerCase().includes(term)
    );
  });

  const filteredColleges = colleges.filter(col => {
    const term = collegeSearch.toLowerCase();
    return col.name.toLowerCase().includes(term) || col.code.toLowerCase().includes(term) || col.district.toLowerCase().includes(term);
  });

  return (
    <div className="container admin-container">
      <div className="admin-header-row">
        <div>
          <h2 className="admin-title font-poppins">Admin Console & Analytics</h2>
          <p style={{ color: "var(--secondary-light)", fontSize: "0.95rem" }}>
            Track admission leads, sync databases with Supabase, configure recommended universities, and review analytics.
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {isSupabaseConfigured() ? (
            <button 
              className="btn btn-secondary font-poppins" 
              style={{ background: "#eff6ff", color: "var(--primary)", borderColor: "rgba(37, 99, 235, 0.2)", display: "flex", alignItems: "center", gap: "6px" }}
              onClick={handleSeedDatabase}
              disabled={isSeeding}
            >
              {isSeeding ? <RefreshCw size={16} className="rotate-180" /> : <Database size={16} />}
              <span>{isSeeding ? "Seeding..." : "Seed Database to Supabase"}</span>
            </button>
          ) : (
            <div style={{ fontSize: "0.75rem", background: "var(--borderline-light)", color: "var(--borderline)", padding: "8px 12px", borderRadius: "8px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldAlert size={14} />
              <span>Supabase offline (using localStorage fallback)</span>
            </div>
          )}
          
          {activeTab === "leads" && leads.length > 0 && (
            <button className="btn btn-secondary font-poppins" onClick={exportLeadsCSV}>
              <Download size={16} /> Export CSV
            </button>
          )}
          {activeTab === "colleges" && (
            <button className="btn btn-primary font-poppins" onClick={() => openCollegeModal()}>
              <Plus size={16} /> Add College
            </button>
          )}
          {activeTab === "recommendations" && (
            <button className="btn btn-primary font-poppins" onClick={() => openRecModal()}>
              <Plus size={16} /> Add Partner
            </button>
          )}
        </div>
      </div>

      {isSeeding && (
        <div style={{ background: "var(--primary-light)", border: "1px dashed var(--primary)", padding: "16px", borderRadius: "12px", marginBottom: "24px", color: "var(--primary)", fontWeight: "600", fontSize: "0.9rem" }}>
          ⏳ {seedingMessage}
        </div>
      )}

      {/* Admin stats widgets */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><UserCheck size={22} /></div>
          <div className="stat-info">
            <span className="stat-value">{totalStudents}</span>
            <span className="stat-label">Total Students</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "var(--safe-light)", color: "var(--safe)" }}><FileSpreadsheet size={22} /></div>
          <div className="stat-info">
            <span className="stat-value">{totalLeadsCount}</span>
            <span className="stat-label">Total Leads</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}><Award size={22} /></div>
          <div className="stat-info">
            <span className="stat-value">{featuredEnquiries}</span>
            <span className="stat-label">Partner Enquiries</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#f5f3ff", color: "#7c3aed" }}><Phone size={22} /></div>
          <div className="stat-info">
            <span className="stat-value">{counselingCalls}</span>
            <span className="stat-label">Counselling Calls</span>
          </div>
        </div>
      </div>

      {/* Custom dynamic searches display */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
        <div className="stat-card" style={{ background: "white", padding: "16px 24px" }}>
          <div className="stat-info">
            <span className="stat-label" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>🔥 Most Searched College Code</span>
            <span className="stat-value" style={{ fontSize: "1.25rem", color: "var(--primary)", marginTop: "4px" }}>{mostSearchedCode}</span>
          </div>
        </div>
        <div className="stat-card" style={{ background: "white", padding: "16px 24px" }}>
          <div className="stat-info">
            <span className="stat-label" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>⭐ Most Requested University</span>
            <span className="stat-value" style={{ fontSize: "1.25rem", color: "var(--safe)", marginTop: "4px" }}>{mostRequestedUni}</span>
          </div>
        </div>
      </div>

      {/* Analytics Visualization Panel */}
      {leads.length > 0 && (
        <div className="admin-charts-grid">
          {/* Bar Chart leads by District */}
          <div className="chart-card">
            <h3 className="chart-title font-poppins">Student Interest by District (Top 5)</h3>
            <div className="bar-chart-container">
              {districtChartData.length > 0 ? districtChartData.map(([dist, count]) => {
                const percentage = (count / maxDistrictLeads) * 100;
                return (
                  <div className="chart-bar-row" key={dist}>
                    <span className="chart-bar-label">{dist}</span>
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar-fill" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="chart-bar-value">{count} leads</span>
                  </div>
                );
              }) : <p style={{ fontSize: "0.85rem", color: "var(--secondary-light)" }}>No leads district data available.</p>}
            </div>
          </div>

          {/* Bar chart leads by branch */}
          <div className="chart-card">
            <h3 className="chart-title font-poppins">Popular Requested Branches</h3>
            <div className="bar-chart-container">
              {branchChartData.length > 0 ? branchChartData.map(([branch, count]) => {
                const percentage = (count / maxBranchLeads) * 100;
                return (
                  <div className="chart-bar-row" key={branch}>
                    <span className="chart-bar-label" style={{ fontWeight: "700" }}>{branch}</span>
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar-fill" style={{ width: `${percentage}%`, background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }} />
                    </div>
                    <span className="chart-bar-value">{count} requests</span>
                  </div>
                );
              }) : <p style={{ fontSize: "0.85rem", color: "var(--secondary-light)" }}>No branch requests available.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="dashboard-tabs">
        <button
          className={`dash-tab-btn font-poppins ${activeTab === "leads" ? "active" : ""}`}
          onClick={() => setActiveTab("leads")}
        >
          <BarChart3 size={16} /> Lead Analytics & Requests ({leads.length})
        </button>
        <button
          className={`dash-tab-btn font-poppins ${activeTab === "colleges" ? "active" : ""}`}
          onClick={() => setActiveTab("colleges")}
        >
          <Landmark size={16} /> Colleges Catalog ({colleges.length})
        </button>
        <button
          className={`dash-tab-btn font-poppins ${activeTab === "recommendations" ? "active" : ""}`}
          onClick={() => setActiveTab("recommendations")}
        >
          <Award size={16} /> Featured Partners ({recommendations.length})
        </button>
        <button
          className={`dash-tab-btn font-poppins ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <UserCheck size={16} /> User Accounts ({users.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div style={{ marginTop: "24px" }}>
        
        {/* LEADS LIST PANEL */}
        {activeTab === "leads" && (
          <div className="table-card">
            <div className="table-header">
              <h4 className="table-title font-poppins">Counselor Leads Feed</h4>
              <input
                type="text"
                placeholder="Search by student, college, branch..."
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                className="input-style table-search-input"
              />
            </div>

            <div className="table-container">
              {filteredLeads.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--secondary-light)" }}>
                  No lead requests match search criteria.
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Student details</th>
                      <th>Target Institution</th>
                      <th>Preferred Branch</th>
                      <th>Lead Type</th>
                      <th>Submission date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(lead => (
                      <tr key={lead.id}>
                        <td>
                          <div className="lead-name-col">{lead.name}</div>
                          <div className="lead-contact-info">
                            <span>📞 {lead.mobile}</span>
                            <span>✉ {lead.email}</span>
                          </div>
                        </td>
                        <td>
                          <div>{lead.collegeName}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--secondary-light)" }}>Code: {lead.collegeCode}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: "700" }}>{lead.branch}</span>
                        </td>
                        <td>
                          <span className="lead-tag-col" style={{
                            background: lead.type === "Application" ? "var(--primary-light)" : "var(--safe-light)",
                            color: lead.type === "Application" ? "var(--primary)" : "#065f46"
                          }}>
                            {lead.type}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.8rem", color: "var(--secondary-light)" }}>
                          {new Date(lead.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <button className="btn-icon delete" onClick={() => handleDeleteLead(lead.id)} title="Delete Lead">
                            <Trash size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* COLLEGES DATABASE PANEL */}
        {activeTab === "colleges" && (
          <div className="table-card">
            <div className="table-header">
              <h4 className="table-title font-poppins">Colleges Catalog</h4>
              <input
                type="text"
                placeholder="Search college name, code, district..."
                value={collegeSearch}
                onChange={(e) => setCollegeSearch(e.target.value)}
                className="input-style table-search-input"
              />
            </div>

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>College Name</th>
                    <th>District</th>
                    <th>Type</th>
                    <th>Fee (Annual)</th>
                    <th>Details</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredColleges.map(col => (
                    <tr key={col.id}>
                      <td style={{ maxWidth: "300px" }}>
                        <div style={{ fontWeight: "700" }}>{col.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--secondary-light)" }}>
                          Code: {col.code} | Website: <a href={col.website} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "underline" }}>Visit</a>
                        </div>
                      </td>
                      <td>{col.district}</td>
                      <td>
                        <span className={col.type === "Government" ? "badge-govt" : "badge-partner"} style={{ background: col.type === "Government" ? "#f1f5f9" : "none", border: col.type !== "Government" ? "1px solid var(--card-border)" : "none", color: col.type !== "Government" ? "var(--secondary)" : "" }}>
                          {col.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: "700" }}>
                        ₹{col.tuitionFee?.toLocaleString()}
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "var(--secondary-light)" }}>
                        <div>Rating: {col.rating} ★</div>
                        <div>Est: {col.established}</div>
                        <div>Placements: {col.placements || "N/A"}</div>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button className="btn-icon" onClick={() => openCollegeModal(col)} title="Edit College Details">
                            <Edit3 size={14} />
                          </button>
                          <button className="btn-icon delete" onClick={() => handleDeleteCollege(col.id)} title="Delete College">
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RECOMMENDED UNIVERSITIES PANEL */}
        {activeTab === "recommendations" && (
          <div className="dashboard-grid">
            {recommendations.map(rec => (
              <div className="college-card" key={rec.id} style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: `4px solid ${rec.logoColor || "var(--primary)"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{ background: rec.logoColor, color: "white", width: "40px", height: "40px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                      {rec.logoText}
                    </div>
                    <div>
                      <h4 className="font-poppins" style={{ fontSize: "1rem", fontWeight: "700", color: "var(--secondary)" }}>
                        {rec.name}
                      </h4>
                      <div style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "0.75rem", color: "var(--secondary-light)" }}>
                        <MapPin size={12} /> {rec.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="admin-actions">
                    <button className="btn-icon" onClick={() => openRecModal(rec)} title="Edit">
                      <Edit3 size={12} />
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDeleteRec(rec.id)} title="Delete">
                      <Trash size={12} />
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div><Briefcase size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} /> <strong>Placements:</strong> {rec.placementAssistance}</div>
                  <div><Award size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} /> <strong>Scholarship:</strong> {rec.scholarshipsAvailable}</div>
                  <div><strong>Courses:</strong> {rec.popularCourses.join(", ")}</div>
                  <div><strong>Start Fees:</strong> ₹{rec.feeStartingFrom}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* USER LIST PANEL */}
        {activeTab === "users" && (
          <div className="table-card">
            <div className="table-header">
              <h4 className="table-title font-poppins">System User Accounts</h4>
            </div>

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Account Role</th>
                    <th>Verification</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.email}>
                      <td style={{ fontWeight: "700" }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="lead-tag-col" style={{
                          background: u.role === "admin" ? "#fee2e2" : "var(--primary-light)",
                          color: u.role === "admin" ? "var(--borderline)" : "var(--primary)"
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: "var(--safe)", fontWeight: "600" }}>✓ Activated</span>
                      </td>
                      <td>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDeleteUser(u.email)}
                          title="Delete User"
                          disabled={u.email === "admin@eapcet.com"}
                          style={{ opacity: u.email === "admin@eapcet.com" ? 0.3 : 1 }}
                        >
                          <Trash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* CRUD MODAL: Add/Edit College */}
      {showCollegeModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3 className="modal-title font-poppins">{editingCollege ? "Edit College Record" : "Add New College Record"}</h3>
              <button className="modal-close-btn" onClick={() => setShowCollegeModal(false)}><Plus size={16} style={{ transform: "rotate(45deg)" }} /></button>
            </div>
            <form onSubmit={handleSaveCollege}>
              <div className="modal-body admin-form">
                
                <div className="form-group form-full-width">
                  <label className="form-label">College Name</label>
                  <input
                    type="text"
                    value={collegeForm.name}
                    onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })}
                    placeholder="Gayatri Vidya Parishad College of Engineering (A)"
                    className="input-style"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">College Code</label>
                  <input
                    type="text"
                    value={collegeForm.code}
                    onChange={(e) => setCollegeForm({ ...collegeForm, code: e.target.value.toUpperCase() })}
                    placeholder="GVPE"
                    className="input-style"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">District Location</label>
                  <select
                    value={collegeForm.district}
                    onChange={(e) => setCollegeForm({ ...collegeForm, district: e.target.value })}
                    className="input-style"
                  >
                    <option value="Visakhapatnam">Visakhapatnam</option>
                    <option value="East Godavari">East Godavari</option>
                    <option value="West Godavari">West Godavari</option>
                    <option value="Guntur">Guntur</option>
                    <option value="Krishna">Krishna</option>
                    <option value="Chittoor">Chittoor</option>
                    <option value="Anantapur">Anantapur</option>
                    <option value="Srikakulam">Srikakulam</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Management Type</label>
                  <select
                    value={collegeForm.type}
                    onChange={(e) => setCollegeForm({ ...collegeForm, type: e.target.value })}
                    className="input-style"
                  >
                    <option value="Private">Private Autonomous</option>
                    <option value="Government">Government University College</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Annual Tuition Fee (INR)</label>
                  <input
                    type="number"
                    value={collegeForm.tuitionFee}
                    onChange={(e) => setCollegeForm({ ...collegeForm, tuitionFee: Number(e.target.value) })}
                    placeholder="69000"
                    className="input-style"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Official Website URL</label>
                  <input
                    type="text"
                    value={collegeForm.website}
                    onChange={(e) => setCollegeForm({ ...collegeForm, website: e.target.value })}
                    placeholder="https://gvpce.ac.in"
                    className="input-style"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Quality Star Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="5.0"
                    value={collegeForm.rating}
                    onChange={(e) => setCollegeForm({ ...collegeForm, rating: Number(e.target.value) })}
                    placeholder="4.6"
                    className="input-style"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Placement Stats Summary</label>
                  <input
                    type="text"
                    value={collegeForm.placements}
                    onChange={(e) => setCollegeForm({ ...collegeForm, placements: e.target.value })}
                    placeholder="94% (6.8 LPA Avg)"
                    className="input-style"
                  />
                </div>

                <div className="form-group" style={{ flexDirection: "row", alignItems: "center", gap: "10px", marginTop: "24px" }}>
                  <input
                    type="checkbox"
                    id="isPartnerCheck"
                    checked={collegeForm.isPartner}
                    onChange={(e) => setCollegeForm({ ...collegeForm, isPartner: e.target.checked })}
                    style={{ width: "20px", height: "20px" }}
                  />
                  <label htmlFor="isPartnerCheck" style={{ fontWeight: "600", color: "var(--secondary)", cursor: "pointer" }}>Is counseling partner?</label>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCollegeModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRUD MODAL: Recommended University */}
      {showRecModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "560px" }}>
            <div className="modal-header">
              <h3 className="modal-title font-poppins">{editingRec ? "Edit Partner" : "Add Partner"}</h3>
              <button className="modal-close-btn" onClick={() => setShowRecModal(false)}><Plus size={16} style={{ transform: "rotate(45deg)" }} /></button>
            </div>
            <form onSubmit={handleSaveRec}>
              <div className="modal-body admin-form">
                
                <div className="form-group form-full-width">
                  <label className="form-label">University Name</label>
                  <input
                    type="text"
                    value={recForm.name}
                    onChange={(e) => setRecForm({ ...recForm, name: e.target.value })}
                    placeholder="Mohan Babu University"
                    className="input-style"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location (City, State)</label>
                  <input
                    type="text"
                    value={recForm.location}
                    onChange={(e) => setRecForm({ ...recForm, location: e.target.value })}
                    placeholder="Tirupati, Andhra Pradesh"
                    className="input-style"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Popular Courses</label>
                  <input
                    type="text"
                    value={recForm.popularCourses}
                    onChange={(e) => setRecForm({ ...recForm, popularCourses: e.target.value })}
                    placeholder="CSE, ECE, AI & DS"
                    className="input-style"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Starting Fee (INR Text)</label>
                  <input
                    type="text"
                    value={recForm.feeStartingFrom}
                    onChange={(e) => setRecForm({ ...recForm, feeStartingFrom: e.target.value })}
                    placeholder="1,20,000"
                    className="input-style"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Scholarship Description</label>
                  <input
                    type="text"
                    value={recForm.scholarshipsAvailable}
                    onChange={(e) => setRecForm({ ...recForm, scholarshipsAvailable: e.target.value })}
                    placeholder="MBUSAT scholarships up to 100% waiver"
                    className="input-style"
                  />
                </div>

                <div className="form-group form-full-width">
                  <label className="form-label">Placements Stats</label>
                  <input
                    type="text"
                    value={recForm.placementAssistance}
                    onChange={(e) => setRecForm({ ...recForm, placementAssistance: e.target.value })}
                    placeholder="Highest package 60 LPA, Avg 5.5 LPA"
                    className="input-style"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">University Website URL</label>
                  <input
                    type="text"
                    value={recForm.website}
                    onChange={(e) => setRecForm({ ...recForm, website: e.target.value })}
                    placeholder="https://mbu.asia"
                    className="input-style"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Emblem Text (2-4 chars)</label>
                  <input
                    type="text"
                    value={recForm.logoText}
                    onChange={(e) => setRecForm({ ...recForm, logoText: e.target.value.toUpperCase() })}
                    placeholder="MBU"
                    className="input-style"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Badge Color</label>
                  <input
                    type="color"
                    value={recForm.logoColor}
                    onChange={(e) => setRecForm({ ...recForm, logoColor: e.target.value })}
                    className="input-style"
                    style={{ height: "48px", padding: "2px" }}
                  />
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRecModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Partner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
