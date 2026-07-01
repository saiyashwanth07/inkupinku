/**
 * Estimate AP EAPCET Rank based on Marks (out of 160)
 * Uses a realistic interpolation formula reflecting historical trends.
 */
export const estimateRankFromMarks = (marks) => {
  const m = Math.min(160, Math.max(0, Number(marks)));
  if (m >= 150) return Math.round(1 + (160 - m) * 9.9); // 160 -> 1, 150 -> 100
  if (m >= 140) return Math.round(100 + (150 - m) * 40); // 140 -> 500
  if (m >= 120) return Math.round(500 + (140 - m) * 75); // 120 -> 2000
  if (m >= 100) return Math.round(2000 + (120 - m) * 150); // 100 -> 5000
  if (m >= 80) return Math.round(5000 + (100 - m) * 500); // 80 -> 15000
  if (m >= 60) return Math.round(15000 + (80 - m) * 1500); // 60 -> 45000
  if (m >= 40) return Math.round(45000 + (60 - m) * 2250); // 40 -> 90000
  return Math.round(90000 + (40 - m) * 1500); // 0 -> 150000
};

/**
 * Map user's preferred branch dropdown string to DB cutoff code
 */
export const mapDropdownBranchToDbCode = (dropdownBranch) => {
  const b = (dropdownBranch || "").toUpperCase();
  if (b.includes("ALL BRANCHES") || b.includes("ANY BRANCH") || b === "") return "ALL";
  
  if (b.includes("COMPUTER SCIENCE ENGINEERING") || b === "CSE" || b === "CSE (IOT)") return "CSE";
  if (
    b.includes("ARTIFICIAL INTELLIGENCE & MACHINE LEARNING") ||
    b.includes("AI & ML") ||
    b.includes("CSE (ARTIFICIAL INTELLIGENCE") ||
    b === "CSM"
  ) {
    return "CSM";
  }
  if (
    b.includes("DATA SCIENCE") ||
    b.includes("AI & DATA SCIENCE") ||
    b === "CSD"
  ) {
    return "CSD";
  }
  if (b.includes("INFORMATION TECHNOLOGY") || b === "IT") return "IT";
  if (b.includes("ELECTRONICS & COMMUNICATION") || b === "ECE") return "ECE";
  if (b.includes("ELECTRICAL & ELECTRONICS") || b === "EEE") return "EEE";
  if (b.includes("MECHANICAL") || b === "MECH") return "MECH";
  if (b.includes("CIVIL") || b === "CIVIL") return "CIVIL";
  if (b.includes("BIOTECHNOLOGY")) return "BIOTECHNOLOGY";
  if (b.includes("CHEMICAL")) return "CHEMICAL";
  
  return b;
};

/**
 * Fuzzy matches university courses with user preferred branch
 */
export const courseMatchesBranch = (course, preferredBranch) => {
  const dbCode = mapDropdownBranchToDbCode(preferredBranch);
  if (dbCode === "ALL") return true;

  const c = course.toUpperCase();
  const mappedCourse = mapDropdownBranchToDbCode(course);
  
  if (mappedCourse === dbCode) return true;
  if (c.includes(dbCode) || dbCode.includes(c)) return true;

  if (dbCode === "CSM") {
    return c.includes("AI") || c.includes("ML") || c.includes("MACHINE LEARNING") || c.includes("ARTIFICIAL");
  }
  if (dbCode === "CSD") {
    return c.includes("DATA") || c.includes("DS") || c.includes("SCIENCE");
  }

  return false;
};

/**
 * Predicts colleges based on EAPCET rank, category, gender, local area, and preferred branch.
 * Returns an array of college objects with matching branches and chances.
 */
export const predictColleges = ({ rank, category, gender, localArea, preferredBranch, colleges }) => {
  const userRank = Number(rank);
  const results = [];
  const preferredDbCode = mapDropdownBranchToDbCode(preferredBranch || "All Branches");

  for (const college of colleges) {
    const eligibleBranches = [];
    
    for (const cutoff of college.cutoffs) {
      // Check branch preference AND constraint
      const branchMatches = (preferredDbCode === "ALL" || cutoff.branch === preferredDbCode);

      // Filter by user selection
      if (
        cutoff.category === category &&
        cutoff.gender === gender &&
        cutoff.localArea === localArea &&
        branchMatches
      ) {
        const closingRank = cutoff.closingRank;
        let chance = "";
        let chanceScore = 0; // Lower is better

        if (userRank <= closingRank * 0.9) {
          chance = "Safe";
          chanceScore = 1;
        } else if (userRank <= closingRank * 1.05) {
          chance = "Possible";
          chanceScore = 2;
        } else if (userRank <= closingRank * 1.15) {
          chance = "Borderline";
          chanceScore = 3;
        }

        if (chance) {
          eligibleBranches.push({
            branch: cutoff.branch,
            closingRank,
            chance,
            chanceScore
          });
        }
      }
    }

    if (eligibleBranches.length > 0) {
      // Sort branches: Safe -> Possible -> Borderline, then by closing rank
      eligibleBranches.sort((a, b) => {
        if (a.chanceScore !== b.chanceScore) {
          return a.chanceScore - b.chanceScore;
        }
        return a.closingRank - b.closingRank;
      });

      // Best overall chance is the first branch (since sorted by best chance)
      const bestChance = eligibleBranches[0].chance;
      const bestChanceScore = eligibleBranches[0].chanceScore;

      results.push({
        ...college,
        eligibleBranches,
        overallChance: bestChance,
        overallChanceScore: bestChanceScore
      });
    }
  }

  // Sort colleges by overall chance (Safe first), then by college rating descending
  results.sort((a, b) => {
    if (a.overallChanceScore !== b.overallChanceScore) {
      return a.overallChanceScore - b.overallChanceScore;
    }
    return b.rating - a.rating;
  });

  return results;
};

/**
 * Intelligent Recommendation Engine: Filters and scores recommended universities
 * based on user rank, options, and preferred branch.
 */
export const getRecommendationsForProfile = ({ rank, category, gender, localArea, preferredBranch, recommendations }) => {
  const userRank = Number(rank);
  
  return [...recommendations].sort((a, b) => {
    // 1. Branch match priority
    const hasBranchMatchA = a.popularCourses ? a.popularCourses.some(course => courseMatchesBranch(course, preferredBranch)) : false;
    const hasBranchMatchB = b.popularCourses ? b.popularCourses.some(course => courseMatchesBranch(course, preferredBranch)) : false;
    
    if (hasBranchMatchA && !hasBranchMatchB) return -1;
    if (!hasBranchMatchA && hasBranchMatchB) return 1;

    // 2. Rank heuristics
    const isTopTierRec = ["srmap", "gitam", "klu"].includes(a.id);
    const isTopTierRecB = ["srmap", "gitam", "klu"].includes(b.id);
    
    if (userRank < 30000) {
      if (isTopTierRec && !isTopTierRecB) return -1;
      if (!isTopTierRec && isTopTierRecB) return 1;
    } else {
      const isMidTierA = ["aditya", "lpu", "vishwavishwani"].includes(a.id);
      const isMidTierB = ["aditya", "lpu", "vishwavishwani"].includes(b.id);
      if (isMidTierA && !isMidTierB) return -1;
      if (!isMidTierA && isMidTierB) return 1;
    }
    return 0;
  });
};
