import React, { useState, useEffect, useRef } from "react";
import { SlidersHorizontal, AlertTriangle, Sparkles, Lock, ArrowRight, Search, Phone, MessageSquare, Check, X } from "lucide-react";
import SkeletonLoader from "../components/SkeletonLoader";
import CollegeCard from "../components/CollegeCard";
import FeaturedUniversityCard from "../components/FeaturedUniversityCard";
import { predictColleges, getRecommendationsForProfile } from "../utils/predictor";
import { getColleges, getRecommendations } from "../utils/db";

const DISTRICT_MAP = {
  'ATP': 'Anantapur',
  'CTR': 'Chittoor',
  'EG': 'East Godavari',
  'GTR': 'Guntur',
  'KDP': 'Kadapa',
  'KNL': 'Kurnool',
  'KRI': 'Krishna',
  'NLR': 'Nellore',
  'PKS': 'Prakasam',
  'SKL': 'Srikakulam',
  'VSP': 'Visakhapatnam',
  'VZM': 'Vizianagaram',
  'WG': 'West Godavari'
};

const AP_DISTRICTS = [
  "Anakapalli",
  "Anantapur",
  "Annamayya",
  "Bapatla",
  "Chittoor",
  "Dr. B.R. Ambedkar Konaseema",
  "East Godavari",
  "Eluru",
  "Guntur",
  "Kakinada",
  "Krishna",
  "Kurnool",
  "Nandyal",
  "NTR",
  "Palnadu",
  "Parvathipuram Manyam",
  "Prakasam",
  "Srikakulam",
  "Sri Potti Sriramulu Nellore",
  "Sri Sathya Sai",
  "Tirupati",
  "Visakhapatnam",
  "Vizianagaram",
  "West Godavari",
  "YSR Kadapa"
];

const FORM_PREFERRED_BRANCHES = [
  "All Branches",
  "Computer Science Engineering (CSE)",
  "CSE (Artificial Intelligence & Machine Learning)",
  "CSE (Data Science)",
  "CSE (Cyber Security)",
  "CSE (Artificial Intelligence)",
  "CSE (IoT)",
  "Information Technology (IT)",
  "Electronics & Communication Engineering (ECE)",
  "Electrical & Electronics Engineering (EEE)",
  "Mechanical Engineering",
  "Civil Engineering",
  "Artificial Intelligence & Machine Learning (AI & ML)",
  "Artificial Intelligence & Data Science",
  "Data Science",
  "Cyber Security",
  "Biotechnology",
  "Chemical Engineering",
  "Agricultural Engineering",
  "Automobile Engineering",
  "Aeronautical Engineering",
  "Aerospace Engineering",
  "Mining Engineering",
  "Metallurgical Engineering",
  "Food Technology",
  "Pharmaceutical Engineering",
  "Textile Engineering",
  "Petroleum Engineering",
  "Environmental Engineering",
  "Electronics & Instrumentation Engineering",
  "Electronics & Computer Engineering",
  "Any Branch"
];

function SearchableSelect({ label, options, value, onChange, placeholder = "Select..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="form-group" style={{ position: "relative", marginBottom: "14px" }} ref={dropdownRef}>
      <label className="form-label">{label}</label>
      <div
        className="input-style"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          background: "var(--card)"
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || placeholder}</span>
        <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>▼</span>
      </div>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-md)",
          boxShadow: "var(--shadow-lg)",
          zIndex: 50,
          marginTop: "4px",
          maxHeight: "220px",
          overflowY: "auto"
        }}>
          <div style={{ padding: "8px", borderBottom: "1px solid var(--border)" }}>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-style"
              style={{ padding: "6px 10px", fontSize: "0.82rem", height: "32px" }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div style={{ padding: "4px 0" }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: "8px 12px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                No results found
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  style={{
                    padding: "8px 12px",
                    fontSize: "0.84rem",
                    color: opt === value ? "var(--primary)" : "var(--text-secondary)",
                    background: opt === value ? "var(--primary-light)" : "transparent",
                    cursor: "pointer",
                    fontWeight: opt === value ? "600" : "500"
                  }}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className="dropdown-option-hover"
                >
                  {opt}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home({
  user,
  favorites,
  onFavoriteToggle,
  onAuthClick,
  onRequestDetails,
  savePredictionToHistory,
  rerunQuery,
  onClearRerun
}) {
  // Database datasets
  const [colleges, setColleges] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Dynamic filter lists from DB
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableBranches, setAvailableBranches] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);

  // Form Fields
  const [inputType, setInputType] = useState("rank"); // "rank" | "marks"
  const [inputValue, setInputValue] = useState("");
  const [category, setCategory] = useState("OC");
  const [gender, setGender] = useState("Boys");
  const [localArea, setLocalArea] = useState("AU");
  const [preferredBranch, setPreferredBranch] = useState("All Branches");

  // Form states
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasPredicted, setHasPredicted] = useState(false);

  // Mobile Bottom Sheet state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Raw prediction outcomes
  const [rawResults, setRawResults] = useState([]);
  const [profileRecs, setProfileRecs] = useState([]);

  // Search & Sidebar Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedChance, setSelectedChance] = useState("All");
  const [sortBy, setSortBy] = useState("lowest_rank");

  // Load database datasets on mount
  useEffect(() => {
    const loadData = async () => {
      const fetchedColleges = await getColleges();
      const fetchedRecs = await getRecommendations();
      setColleges(fetchedColleges);
      setRecommendations(fetchedRecs);

      // Dynamically extract distinct options from college list
      if (fetchedColleges && fetchedColleges.length > 0) {
        const dists = Array.from(new Set(fetchedColleges.map(c => c.district))).filter(Boolean).sort();
        const brs = Array.from(new Set(fetchedColleges.flatMap(c => c.cutoffs.map(cut => cut.branch)))).filter(Boolean).sort();
        const typs = Array.from(new Set(fetchedColleges.map(c => c.type))).filter(Boolean).sort();

        setAvailableDistricts(dists);
        setAvailableBranches(brs);
        setAvailableTypes(typs);
      }
    };
    loadData();
  }, [hasPredicted]);


  // Handle rerun query pre-population from Dashboard logs
  useEffect(() => {
    const handleRerun = async () => {
      if (rerunQuery) {
        setInputType(rerunQuery.inputType);
        setInputValue(rerunQuery.inputValue);
        setCategory(rerunQuery.category);
        setGender(rerunQuery.gender);
        setLocalArea(rerunQuery.localArea);
        setPreferredBranch(rerunQuery.preferredBranch || "All Branches");

        setIsLoading(true);

        // Wait briefly for smooth transition
        setTimeout(async () => {
          let rank = Number(rerunQuery.rank);
          const freshColleges = await getColleges();
          const freshRecs = await getRecommendations();

          const predicted = predictColleges({
            rank,
            category: rerunQuery.category,
            gender: rerunQuery.gender,
            localArea: rerunQuery.localArea,
            preferredBranch: rerunQuery.preferredBranch || "All Branches",
            colleges: freshColleges
          });

          const recs = getRecommendationsForProfile({
            rank,
            category: rerunQuery.category,
            gender: rerunQuery.gender,
            localArea: rerunQuery.localArea,
            preferredBranch: rerunQuery.preferredBranch || "All Branches",
            recommendations: freshRecs
          });

          setRawResults(predicted);
          setProfileRecs(recs);
          setIsLoading(false);
          setHasPredicted(true);
          onClearRerun();

          // Scroll to results listing
          setTimeout(() => {
            document.getElementById("prediction-results")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }, 500);
      }
    };
    handleRerun();
  }, [rerunQuery]);

  // Form validation
  const validateForm = () => {
    const errs = {};
    if (!inputValue) {
      errs.value = `${inputType === "rank" ? "Rank" : "Marks"} is required`;
    } else {
      const num = Number(inputValue);
      if (isNaN(num) || num < 0) {
        errs.value = "Must be a positive number";
      } else if (inputType === "marks" && num > 160) {
        errs.value = "Marks must be between 0 and 160";
      }
    }
    return errs;
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    setIsLoading(true);

    // Simulate EAPCET DB search latency
    setTimeout(async () => {
      let rank = Number(inputValue);
      if (inputType === "marks") {
        rank = estimateRankFromMarks(rank);
      }

      const freshColleges = await getColleges();
      const freshRecs = await getRecommendations();

      const predicted = predictColleges({
        rank,
        category,
        gender,
        localArea,
        preferredBranch,
        colleges: freshColleges
      });

      const recs = getRecommendationsForProfile({
        rank,
        category,
        gender,
        localArea,
        preferredBranch,
        recommendations: freshRecs
      });

      setRawResults(predicted);
      setProfileRecs(recs);
      setIsLoading(false);
      setHasPredicted(true);

      // Save prediction to logs
      if (user) {
        await savePredictionToHistory({
          date: new Date().toISOString(),
          inputType,
          inputValue: Number(inputValue),
          rank,
          category,
          gender,
          localArea,
          preferredBranch,
          matchesCount: predicted.length
        });
      }

      // Scroll to results
      setTimeout(() => {
        document.getElementById("prediction-results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, 800);
  };

  const estimateRankFromMarks = (m) => {
    if (m >= 150) return Math.round(1 + (160 - m) * 9.9);
    if (m >= 140) return Math.round(100 + (150 - m) * 40);
    if (m >= 120) return Math.round(500 + (140 - m) * 75);
    if (m >= 100) return Math.round(2000 + (120 - m) * 150);
    if (m >= 80) return Math.round(5000 + (100 - m) * 500);
    if (m >= 60) return Math.round(15000 + (80 - m) * 1500);
    if (m >= 40) return Math.round(45000 + (60 - m) * 2250);
    return Math.round(90000 + (40 - m) * 1500);
  };

  const handleReset = () => {
    setInputValue("");
    setHasPredicted(false);
    setRawResults([]);
    setProfileRecs([]);
    setSearchTerm("");
    setSelectedDistrict("All Districts");
    setSelectedBranch("All Branches");
    setSelectedType("All");
    setSelectedChance("All");
    setSortBy("lowest_rank");
  };

  const userRank = inputType === "rank" ? (Number(inputValue) || 0) : estimateRankFromMarks(Number(inputValue) || 0);

  // STRICTLY CHAINED FILTER EXECUTION PIPELINE
  const getFilteredColleges = () => {
    let results = [...rawResults];

    // 1. Text Search Filter (Search by name, district, or branch)
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      results = results.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term) ||
        c.district.toLowerCase().includes(term) ||
        c.eligibleBranches.some(eb => eb.branch.toLowerCase().includes(term))
      );
    }

    // 2. District Filter
    if (selectedDistrict && selectedDistrict !== "All" && selectedDistrict !== "All Districts") {
      results = results.filter(c => {
        const fullDistrict = DISTRICT_MAP[c.district] || c.district;
        return fullDistrict.toLowerCase() === selectedDistrict.toLowerCase();
      });
    }

    // 3. College Management Type Filter
    if (selectedType && selectedType !== "All" && selectedType !== "All Types") {
      results = results.filter(c => c.type.toLowerCase() === selectedType.toLowerCase());
    }

    // 4. Branch Filter
    if (selectedBranch && selectedBranch !== "All" && selectedBranch !== "All Branches") {
      results = results.map(college => {
        let branches = college.eligibleBranches.filter(b => b.branch.toLowerCase() === selectedBranch.toLowerCase());
        return { ...college, eligibleBranches: branches };
      }).filter(college => college.eligibleBranches.length > 0);
    }

    // 5. Admission Chance Filter
    if (selectedChance && selectedChance !== "All" && selectedChance !== "All Chances") {
      results = results.map(college => {
        let branches = college.eligibleBranches.filter(b => b.chance.toLowerCase() === selectedChance.toLowerCase());
        return { ...college, eligibleBranches: branches };
      }).filter(college => college.eligibleBranches.length > 0);
    }

    // 6. Sorting
    if (sortBy === "best_match") {
      // already sorted by overallChanceScore, then rating descending
    } else if (sortBy === "lowest_rank") {
      results.sort((a, b) => {
        const minA = Math.min(...a.eligibleBranches.map(eb => eb.closingRank));
        const minB = Math.min(...b.eligibleBranches.map(eb => eb.closingRank));
        return minA - minB;
      });
    } else if (sortBy === "highest_rating") {
      results.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "alphabetical") {
      results.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "newest") {
      results.sort((a, b) => b.established - a.established);
    }

    return results;
  };

  const filteredResults = getFilteredColleges();

  // STRICT GUEST LIMITING RULE: Lock after only 2 colleges displayed!
  const displayLimit = user ? filteredResults.length : Math.min(2, filteredResults.length);
  const visibleColleges = filteredResults.slice(0, displayLimit);
  const hiddenCount = filteredResults.length - displayLimit;

  const promoWhatsappLink = "https://api.whatsapp.com/send?phone=917997166666&text=Hi,%20I%20need%20help%20with%20my%20AP%20EAPCET%20counselling%20and%20web%20options.";


  return (
    <div>
      {/* ---- Hero Section ---- */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-tag font-poppins">✦ AP EAPCET College Predictor 2026</div>
          <h1 className="hero-title font-poppins">
            Find Your Suitable College
            <br />
            <span className="hero-title-accent">in Seconds</span>
          </h1>
          <p className="hero-subtitle">
            Enter your Rank to instantly discover government &amp; private engineering colleges where you have the highest admission chances.
          </p>
          <div className="hero-actions">
            <a href="#predictor-form" className="btn hero-btn-primary font-poppins">
              🔮 Predict My Colleges
            </a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value font-poppins">500+</div>
              <div className="hero-stat-label">Colleges Listed</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value font-poppins">2025</div>
              <div className="hero-stat-label">Cutoff Data</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value font-poppins">8</div>
              <div className="hero-stat-label">Categories</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value font-poppins">Free</div>
              <div className="hero-stat-label">Always</div>
            </div>
          </div>
        </div>
      </section>

      {/* Prediction Form Section */}
      <section className="container prediction-section" id="predictor-form">
        <div className="form-card">
          <h3 className="font-poppins" style={{ fontSize: "1.3rem", fontWeight: "800", marginBottom: "24px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "var(--primary)" }}>⚡</span> College Admission Predictor
          </h3>

          <form onSubmit={handlePredict}>
            <div className="form-grid">

              {/* Input Value */}
              <div className="form-group">
                <label className="form-label">
                  Enter AP EAPCET Rank
                </label>
                <input
                  type="text"
                  placeholder="e.g., 25000"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="input-style"
                />
                {formErrors.value && <span className="error-msg">{formErrors.value}</span>}
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Admission Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-style"
                >
                  <option value="OC">OC</option>
                  <option value="BC_A">BC-A</option>
                  <option value="BC_B">BC-B</option>
                  <option value="BC_C">BC-C</option>
                  <option value="BC_D">BC-D</option>
                  <option value="BC_E">BC-E</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>

              {/* Gender */}
              <div className="form-group">
                <label className="form-label">Gender Quota</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="input-style"
                >
                  <option value="Boys">Boys (Co-Education/General)</option>
                  <option value="Girls">Girls (Girls Reservation Quota)</option>
                </select>
              </div>

              {/* Local Area */}
              <div className="form-group form-grid-full">
                <label className="form-label">Local Region (AP Local Status Area)</label>
                <select
                  value={localArea}
                  onChange={(e) => setLocalArea(e.target.value)}
                  className="input-style"
                >
                  <option value="AU">Andhra University Region (AU - Coastal Districts)</option>
                  <option value="SVU">Sri Venkateswara University Region (SVU - Rayalaseema/Nellore)</option>
                  <option value="OU">Osmania University Region (OU - Non-Local / Migrant)</option>
                </select>
              </div>

              {/* Preferred Branch */}
              <div className="form-group form-grid-full">
                <SearchableSelect
                  label="Preferred Branch"
                  options={FORM_PREFERRED_BRANCHES}
                  value={preferredBranch}
                  onChange={setPreferredBranch}
                  placeholder="Select Your Preferred Branch"
                />
              </div>
            </div>

            <div className="form-actions">
              {hasPredicted && (
                <button type="button" className="btn btn-secondary font-poppins" onClick={handleReset} style={{ marginRight: "12px" }}>
                  Reset Form
                </button>
              )}
              <button type="submit" className="btn btn-primary font-poppins" disabled={isLoading}>
                {isLoading ? "Analyzing Cutoffs..." : "Find Eligible Colleges"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Prediction Output Results */}
      <section className="container" id="prediction-results" style={{ minHeight: hasPredicted ? "500px" : "auto", paddingBottom: "80px" }}>
        {isLoading && <SkeletonLoader count={3} />}

        {hasPredicted && !isLoading && (
          <>
            {/* Helper filters renderer */}
            {(() => {
              // We define the filters renderer as a helper to output inside both desktop sidebar and mobile sheet
              const renderFiltersContent = () => (
                <>
                  {/* District Filter */}
                  <div className="filter-section-modern">
                    <SearchableSelect
                      label="District"
                      options={["All Districts", ...availableDistricts.map(code => DISTRICT_MAP[code] || code).sort()]}
                      value={selectedDistrict}
                      onChange={setSelectedDistrict}
                      placeholder="Select District"
                    />
                  </div>

                  {/* Branch Filter */}
                  <div className="filter-section-modern">
                    <SearchableSelect
                      label="Branch"
                      options={["All Branches", ...availableBranches]}
                      value={selectedBranch}
                      onChange={setSelectedBranch}
                      placeholder="Select Branch"
                    />
                  </div>
                </>
              );

              // Calculate guest limiting variables (removed local redeclarations to prevent ReferenceError)

              return (
                <div className="results-layout">
                  {/* Sidebar Filters (Desktop only) */}
                  <aside className="filters-sidebar-modern">
                    <div className="sidebar-header-modern">
                      <div className="sidebar-title-modern font-poppins">
                        <SlidersHorizontal size={16} /> Filters
                      </div>
                      {(selectedDistrict !== "All Districts" || selectedBranch !== "All Branches" || searchTerm || sortBy !== "lowest_rank") && (
                        <button className="clear-btn font-poppins" onClick={handleReset}>Reset</button>
                      )}
                    </div>
                    <div className="sidebar-content-modern">
                      {renderFiltersContent()}
                    </div>
                  </aside>

                  {/* Results Grid Container */}
                  <div className="results-list-container">

                    {/* Search Box ABOVE the results */}
                    <div className="instant-search-container font-poppins">
                      <label className="search-box-label">🔍 Search College</label>
                      <div className="search-input-wrapper">
                        <Search size={18} className="search-icon-inside" />
                        <input
                          type="text"
                          placeholder="Search by college name, district, or branch..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="search-input-modern"
                        />
                      </div>
                    </div>

                    {/* Results Header (Count & Sort By) */}
                    <div className="results-header-modern">
                      <div className="header-left-info font-poppins">
                        <h2>Showing <strong>{visibleColleges.length}</strong> of <strong>{filteredResults.length}</strong> Matching Colleges</h2>
                        <p>Results are based on previous year's AP EAPCET cutoff data.</p>
                      </div>

                      <div className="header-right-sort font-poppins">
                        <span className="sort-label">Sort By</span>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="sort-select-modern"
                        >
                          <option value="best_match">Best Match</option>
                          <option value="highest_rating">Highest Rating</option>
                          <option value="lowest_rank">Lowest Closing Rank</option>
                          <option value="alphabetical">Alphabetical (A–Z)</option>
                          <option value="newest">Newest</option>
                        </select>
                      </div>
                    </div>

                    {/* Empty Matches State */}
                    {filteredResults.length === 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <div className="empty-state" style={{ padding: "32px 20px" }}>
                          <AlertTriangle size={48} className="empty-icon" style={{ color: "var(--possible)", marginBottom: "12px" }} />
                          <h3 className="empty-title font-poppins">No Exact Matches Found</h3>
                          <p className="empty-text" style={{ marginBottom: "16px" }}>
                            No colleges match your rank criteria under the active filters. We have loaded our recommended university opportunities below.
                          </p>
                          <button className="btn btn-outline font-poppins" onClick={handleReset}>Clear Filters</button>
                        </div>

                        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
                          <FeaturedUniversityCard rank={userRank} startIndex={0} />
                        </div>
                      </div>
                    )}

                    {/* Render College Cards & Interleave Featured Universities */}
                    {(() => {
                      const elements = [];
                      visibleColleges.forEach((college, index) => {
                        elements.push(
                          <CollegeCard
                            key={college.id}
                            college={college}
                            isFavorite={favorites.includes(college.id)}
                            onFavoriteToggle={onFavoriteToggle}
                            onRequestDetails={onRequestDetails}
                          />
                        );

                        // Insert Featured University after every 2 colleges
                        if ((index + 1) % 2 === 0) {
                          const recIndex = Math.floor((index + 1) / 2) - 1;
                          elements.push(
                            <FeaturedUniversityCard
                              key={`featured-${index}`}
                              rank={userRank}
                              startIndex={recIndex}
                            />
                          );
                        }
                      });

                      // Fallback recommendation logic at end if list is short
                      const shouldAppendAtEnd = visibleColleges.length > 0 && visibleColleges.length < 5;

                      if (shouldAppendAtEnd) {
                        if (visibleColleges.length % 2 !== 0) {
                          const carouselIndex = Math.floor(visibleColleges.length / 2);
                          elements.push(
                            <FeaturedUniversityCard
                              key="featured-end"
                              rank={userRank}
                              startIndex={carouselIndex}
                            />
                          );
                        }
                      }

                      const shouldLock = !user && filteredResults.length > 2;
                      if (shouldLock) {
                        elements.push(
                          <div key="locked-card" className="locked-results-card font-poppins" style={{
                            background: "linear-gradient(135deg, rgba(235, 248, 255, 0.9), rgba(224, 231, 255, 0.9))",
                            backdropFilter: "blur(10px)",
                            borderRadius: "16px",
                            padding: "40px 20px",
                            textAlign: "center",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
                            marginTop: "20px"
                          }}>
                            <Lock size={48} style={{ color: "var(--primary)", margin: "0 auto 16px" }} />
                            <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "12px" }}>
                              Unlock {filteredResults.length - 2} More Colleges!
                            </h3>
                            <p style={{ color: "var(--text-secondary)", marginBottom: "24px", maxWidth: "400px", margin: "0 auto 24px" }}>
                              Create a free account to view all matching colleges, detailed cutoffs, and expert predictions tailored to your rank.
                            </p>
                            <button
                              className="btn btn-primary"
                              onClick={onAuthClick}
                            >
                              Sign Up to Unlock
                            </button>
                          </div>
                        );
                      }

                      return elements;
                    })()}
                  </div>

                  {/* Mobile Filters Bottom Sheet */}
                  {isMobileFiltersOpen && (
                    <div className="mobile-sheet-backdrop" onClick={() => setIsMobileFiltersOpen(false)}>
                      <div className="mobile-sheet-content" onClick={(e) => e.stopPropagation()}>
                        <div className="mobile-sheet-header font-poppins">
                          <h3>Filter Colleges</h3>
                          <button className="mobile-sheet-close" onClick={() => setIsMobileFiltersOpen(false)}>✕</button>
                        </div>
                        <div className="mobile-sheet-body">
                          {renderFiltersContent()}
                        </div>
                        <div className="mobile-sheet-footer font-poppins">
                          <button
                            className="mobile-sheet-apply-btn"
                            onClick={() => setIsMobileFiltersOpen(false)}
                          >
                            Show {filteredResults.length} Colleges
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mobile Floating Trigger button */}
                  <button
                    className="mobile-filters-trigger-btn font-poppins"
                    onClick={() => setIsMobileFiltersOpen(true)}
                  >
                    <SlidersHorizontal size={16} /> Filters
                  </button>
                </div>
              );
            })()}
          </>
        )}
      </section>
    </div>
  );
}

