/**
 * Branch name mapping from short codes (as stored in colleges.json)
 * to full display names for UI rendering.
 */

const BRANCH_MAP = {
  // Computer Science variants
  CSE:  "Computer Science & Engineering (CSE)",
  CS:   "Computer Science & Engineering (CSE)",
  CSM:  "Computer Science & Engineering (AI & ML)",
  CSD:  "Computer Science & Engineering (Data Science)",
  CSS:  "Computer Science & Engineering (Cyber Security)",
  CSO:  "Computer Science & Engineering (IoT)",
  CSB:  "Computer Science & Engineering (Blockchain)",
  CSBS: "Computer Science & Business Systems",
  CSC:  "Computer Science & Engineering (Cloud Computing)",
  CSN:  "Computer Science & Engineering (Networks)",
  CST:  "Computer Science & Engineering (AI & Robotics)",
  CSW:  "Computer Science & Engineering (AI & Data Science)",
  CSER: "Computer Science & Engineering (AR & VR)",
  CSG:  "Computer Science & Engineering (Gaming Technology)",
  CAI:  "Computer Science & Engineering (AI)",
  CIA:  "Computer Science & Engineering (Intelligent Automation)",
  CIC:  "Computer Science & Engineering (Intelligent Computing)",
  CIT:  "Computer Science & Engineering (IT)",
  CBA:  "Computer Science & Engineering (Big Data Analytics)",
  CCC:  "Computer Science & Engineering (Cloud & Computing)",
  COS:  "Computer Science & Engineering (Optimization Systems)",
  CAD:  "Computer Science & Engineering (Advanced Data)",

  // AI / ML / DS
  AIM:  "Artificial Intelligence & Machine Learning",
  AI:   "Artificial Intelligence",
  AID:  "Artificial Intelligence & Data Science",
  DS:   "Data Science",

  // Electronics
  ECE:  "Electronics & Communication Engineering (ECE)",
  ECA:  "Electronics & Communication Engineering (AI)",
  ECM:  "Electronics & Communication Engineering (Microelectronics)",
  ECT:  "Electronics & Communication Engineering (IoT)",
  EEE:  "Electrical & Electronics Engineering (EEE)",
  EIE:  "Electronics & Instrumentation Engineering (EIE)",
  EII:  "Electronics & Instrumentation Engineering",
  EBM:  "Electronics (Biomedical)",
  EVT:  "Electric Vehicle Technology",
  PEE:  "Power Electronics & Electrical Drives",

  // Mechanical / Civil / Auto
  MEC:  "Mechanical Engineering",
  CIV:  "Civil Engineering",
  AUT:  "Automobile Engineering",
  MET:  "Metallurgical Engineering",
  MIN:  "Mining Engineering",
  ASE:  "Aeronautical & Space Engineering",
  MMM:  "Manufacturing & Mechanical Engineering",
  MRB:  "Mechanical (Robotics)",
  RBT:  "Robotics Engineering",
  NAM:  "Naval Architecture & Marine Engineering",

  // IT / Networks / Security
  INF:  "Information Technology (IT)",
  IOT:  "Internet of Things (IoT)",
  IST:  "Information Science & Technology",
  CN:   "Computer Networks",
  SWE:  "Software Engineering",
  GIN:  "Geo-Informatics",

  // Chemical / Bio / Pharm
  CHE:  "Chemical Engineering",
  BIO:  "Biotechnology",
  BDT:  "Biotechnology & Bioinformatics",
  PHD:  "Pharmaceutical Engineering",
  PHE:  "Pharmaceutical Engineering",
  PHM:  "Pharmacy (M.Pharm)",
  AGR:  "Agricultural Engineering",

  // Other Specializations
  GDT:  "Geo-Spatial & Data Technology",
  FDE:  "Food & Dairy Engineering",
  FDT:  "Food Technology",
  PET:  "Petroleum Engineering",
  CSB:  "Computer Science & Engineering (Blockchain)",
  ECA:  "Electronics & Communication (AI)",
};

/**
 * Returns the full display name for a branch code.
 * Falls back to the original string if no mapping found.
 * @param {string} code
 * @returns {string}
 */
export function getBranchDisplayName(code) {
  if (!code) return code;
  return BRANCH_MAP[code.trim()] || code;
}

export default BRANCH_MAP;
