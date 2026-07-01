import { supabase, isSupabaseConfigured } from "./supabase";
import { auth as fbAuth, db as fbDb, isFirebaseConfigured } from "./firebase";
import { 
  collection, addDoc, getDocs, doc, getDoc, setDoc, query, where, orderBy, deleteDoc 
} from "firebase/firestore";

// Default Colleges raw data (16 colleges)
const DEFAULT_COLLEGES_RAW = [
  {
    id: "auce",
    name: "Andhra University College of Engineering (A)",
    code: "AUCE",
    district: "Visakhapatnam",
    type: "Government",
    tuitionFee: 35000,
    website: "https://www.andhrauniversity.edu.in",
    isPartner: false,
    rating: 4.9,
    established: 1946,
    campusSize: "400 Acres",
    placements: "92% (8.8 LPA Avg)",
    localArea: "AU",
    baseCSEOCBoys: 1200
  },
  {
    id: "jntuk",
    name: "JNTU College of Engineering, Kakinada",
    code: "JNTUK",
    district: "East Godavari",
    type: "Government",
    tuitionFee: 10000,
    website: "https://www.jntuk.edu.in",
    isPartner: false,
    rating: 4.8,
    established: 1946,
    campusSize: "110 Acres",
    placements: "88% (7.5 LPA Avg)",
    localArea: "AU",
    baseCSEOCBoys: 1500
  },
  {
    id: "svuce",
    name: "Sri Venkateswara University College of Engineering",
    code: "SVUCE",
    district: "Chittoor",
    type: "Government",
    tuitionFee: 30000,
    website: "https://www.svuniversity.edu.in",
    isPartner: false,
    rating: 4.7,
    established: 1954,
    campusSize: "350 Acres",
    placements: "86% (7.2 LPA Avg)",
    localArea: "SVU",
    baseCSEOCBoys: 2500
  },
  {
    id: "jntua",
    name: "JNTU College of Engineering, Anantapur",
    code: "JNTUA",
    district: "Anantapur",
    type: "Government",
    tuitionFee: 10000,
    website: "https://www.jntua.ac.in",
    isPartner: false,
    rating: 4.5,
    established: 1946,
    campusSize: "155 Acres",
    placements: "82% (6.0 LPA Avg)",
    localArea: "SVU",
    baseCSEOCBoys: 3800
  },
  {
    id: "gvpe",
    name: "Gayatri Vidya Parishad College of Engineering (A)",
    code: "GVPE",
    district: "Visakhapatnam",
    type: "Private",
    tuitionFee: 69000,
    website: "https://www.gvpce.ac.in",
    isPartner: true,
    rating: 4.6,
    established: 1996,
    campusSize: "21 Acres",
    placements: "94% (6.8 LPA Avg)",
    localArea: "AU",
    baseCSEOCBoys: 4200
  },
  {
    id: "vrse",
    name: "VR Siddhartha Engineering College",
    code: "VRSE",
    district: "Krishna",
    type: "Private",
    tuitionFee: 73000,
    website: "https://www.vrsec.ac.in",
    isPartner: true,
    rating: 4.6,
    established: 1977,
    campusSize: "24 Acres",
    placements: "91% (6.5 LPA Avg)",
    localArea: "AU",
    baseCSEOCBoys: 5500
  },
  {
    id: "rvrjc",
    name: "RVR & JC College of Engineering",
    code: "RVRJ",
    district: "Guntur",
    type: "Private",
    tuitionFee: 68000,
    website: "https://rvrjcce.ac.in",
    isPartner: false,
    rating: 4.5,
    established: 1985,
    campusSize: "37 Acres",
    placements: "89% (6.0 LPA Avg)",
    localArea: "AU",
    baseCSEOCBoys: 7500
  },
  {
    id: "anits",
    name: "Anil Neerukonda Institute of Technology & Sciences",
    code: "ANITS",
    district: "Visakhapatnam",
    type: "Private",
    tuitionFee: 61000,
    website: "https://www.anits.edu.in",
    isPartner: false,
    rating: 4.4,
    established: 2001,
    campusSize: "12 Acres",
    placements: "85% (5.5 LPA Avg)",
    localArea: "AU",
    baseCSEOCBoys: 8500
  },
  {
    id: "srkr",
    name: "SRKR Engineering College",
    code: "SRKR",
    district: "West Godavari",
    type: "Private",
    tuitionFee: 70000,
    website: "https://srkr.ac.in",
    isPartner: false,
    rating: 4.5,
    established: 1980,
    campusSize: "30 Acres",
    placements: "88% (5.8 LPA Avg)",
    localArea: "AU",
    baseCSEOCBoys: 9800
  },
  {
    id: "svec",
    name: "Sree Vidyanikethan Engineering College",
    code: "SVEC",
    district: "Chittoor",
    type: "Private",
    tuitionFee: 70000,
    website: "https://svec.education",
    isPartner: false,
    rating: 4.4,
    established: 1996,
    campusSize: "30 Acres",
    placements: "85% (5.6 LPA Avg)",
    localArea: "SVU",
    baseCSEOCBoys: 11000
  },
  {
    id: "pvps",
    name: "Prasad V. Potluri Siddhartha Institute of Technology",
    code: "PVPS",
    district: "Krishna",
    type: "Private",
    tuitionFee: 67000,
    website: "http://www.pvpsiddhartha.ac.in",
    isPartner: false,
    rating: 4.3,
    established: 1998,
    campusSize: "20 Acres",
    placements: "83% (5.2 LPA Avg)",
    localArea: "AU",
    baseCSEOCBoys: 11500
  },
  {
    id: "gmrit",
    name: "GMR Institute of Technology",
    code: "GMRIT",
    district: "Srikakulam",
    type: "Private",
    tuitionFee: 66000,
    website: "http://www.gmrit.org",
    isPartner: true,
    rating: 4.5,
    established: 1997,
    campusSize: "117 Acres",
    placements: "90% (6.2 LPA Avg)",
    localArea: "AU",
    baseCSEOCBoys: 12500
  },
  {
    id: "vvit",
    name: "Vasireddy Venkatadri Institute of Technology",
    code: "VVIT",
    district: "Guntur",
    type: "Private",
    tuitionFee: 62000,
    website: "https://www.vvitguntur.com",
    isPartner: false,
    rating: 4.3,
    established: 2007,
    campusSize: "26 Acres",
    placements: "84% (5.3 LPA Avg)",
    localArea: "AU",
    baseCSEOCBoys: 13000
  },
  {
    id: "lbrce",
    name: "Lakireddy Bali Reddy College of Engineering",
    code: "LBRCE",
    district: "Krishna",
    type: "Private",
    tuitionFee: 65000,
    website: "https://www.lbrce.ac.in",
    isPartner: false,
    rating: 4.2,
    established: 1998,
    campusSize: "60 Acres",
    placements: "80% (5.0 LPA Avg)",
    localArea: "AU",
    baseCSEOCBoys: 14000
  },
  {
    id: "mits",
    name: "Madanapalle Institute of Technology & Science",
    code: "MITS",
    district: "Chittoor",
    type: "Private",
    tuitionFee: 69800,
    website: "https://www.mits.ac.in",
    isPartner: true,
    rating: 4.4,
    established: 1998,
    campusSize: "26 Acres",
    placements: "86% (5.8 LPA Avg)",
    localArea: "SVU",
    baseCSEOCBoys: 16000
  },
  {
    id: "rec",
    name: "Raghu Engineering College",
    code: "REC",
    district: "Visakhapatnam",
    type: "Private",
    tuitionFee: 62000,
    website: "https://raghuenggcolleges.com",
    isPartner: false,
    rating: 4.2,
    established: 2001,
    campusSize: "40 Acres",
    placements: "82% (5.1 LPA Avg)",
    localArea: "AU",
    baseCSEOCBoys: 22000
  }
];

const BRANCH_MULTIPLIERS = {
  CSE: 1.0,
  CSM: 1.15,
  CSD: 1.25,
  IT: 1.35,
  ECE: 1.6,
  EEE: 2.5,
  MECH: 4.0,
  CIVIL: 5.0
};

const CATEGORY_MULTIPLIERS = {
  OC: 1.0,
  BC_A: 1.6,
  BC_B: 1.5,
  BC_C: 1.45,
  BC_D: 1.7,
  BC_E: 2.0,
  SC: 4.5,
  ST: 6.0
};

const GENDER_MULTIPLIERS = {
  Boys: 1.0,
  Girls: 1.2
};

const BRANCHES = ["CSE", "CSM", "CSD", "IT", "ECE", "EEE", "MECH", "CIVIL"];
const CATEGORIES = ["OC", "BC_A", "BC_B", "BC_C", "BC_D", "BC_E", "SC", "ST"];
const GENDERS = ["Boys", "Girls"];
const LOCAL_AREAS = ["AU", "SVU", "OU"];

function generateCutoffs(college) {
  const cutoffs = [];
  for (const branch of BRANCHES) {
    const branchMult = BRANCH_MULTIPLIERS[branch];
    for (const category of CATEGORIES) {
      const catMult = CATEGORY_MULTIPLIERS[category];
      for (const gender of GENDERS) {
        const genderMult = GENDER_MULTIPLIERS[gender];
        for (const localArea of LOCAL_AREAS) {
          let localAreaFactor = 1.0;
          if (localArea === college.localArea) {
            localAreaFactor = 1.0;
          } else if (localArea === "OU") {
            localAreaFactor = 0.5;
          } else {
            localAreaFactor = 0.4;
          }
          
          let closingRank = Math.round(
            college.baseCSEOCBoys * 
            branchMult * 
            catMult * 
            genderMult * 
            (1 / localAreaFactor)
          );
          
          const variation = 0.95 + Math.random() * 0.1;
          closingRank = Math.round(closingRank * variation);
          
          if (closingRank < 100) closingRank = 100;
          if (closingRank > 150000) closingRank = 150000;

          cutoffs.push({
            branch,
            category,
            gender,
            localArea,
            closingRank
          });
        }
      }
    }
  }
  return cutoffs;
}

export const getDefaultColleges = () => {
  return DEFAULT_COLLEGES_RAW.map(col => {
    const cutoffs = generateCutoffs(col);
    const { baseCSEOCBoys, ...cleanCollege } = col;
    return {
      ...cleanCollege,
      cutoffs
    };
  });
};

// 24 Featured Universities in India
export const DEFAULT_RECOMMENDED_UNIVERSITIES = [
  {
    id: "aditya",
    name: "Aditya University",
    location: "Surampalem, Andhra Pradesh",
    popularCourses: ["CSE", "ECE", "AI & ML", "Cyber Security"],
    feeStartingFrom: "75,000",
    scholarshipsAvailable: "Up to 50% merit-based scholarship on EAPCET Ranks < 20,000",
    placementAssistance: "Avg 4.5 LPA, Max 31 LPA (150+ Recruiters)",
    admissionsOpen: true,
    logoText: "AU",
    logoColor: "#2563eb",
    website: "https://aditya.ac.in"
  },
  {
    id: "mohanbabu",
    name: "Mohan Babu University",
    location: "Tirupati, Andhra Pradesh",
    popularCourses: ["CSE", "ECE", "AI & DS", "Mechanical"],
    feeStartingFrom: "1,20,000",
    scholarshipsAvailable: "MBUSAT Rank-based merit scholarships up to 100% waiver",
    placementAssistance: "Highest package 60 LPA, 100+ recruiters, Avg 5.5 LPA",
    admissionsOpen: true,
    logoText: "MBU",
    logoColor: "#ea580c",
    website: "https://mbu.asia"
  },
  {
    id: "niat",
    name: "NIAT",
    location: "Nellore, Andhra Pradesh",
    popularCourses: ["Aerospace Engineering", "Aircraft Maintenance Engineering"],
    feeStartingFrom: "1,50,000",
    scholarshipsAvailable: "20% waiver for residents of Coastal Andhra",
    placementAssistance: "Direct tie-ups with domestic airline maintenance companies",
    admissionsOpen: true,
    logoText: "NIAT",
    logoColor: "#0d9488",
    website: "https://niat.edu.in"
  },
  {
    id: "vishwavishwanibs",
    name: "Vishwa Vishwani BS Program",
    location: "Hyderabad, Telangana",
    popularCourses: ["B.Tech CSE (Business Analytics)", "B.Tech CSE (AI & DS)"],
    feeStartingFrom: "1,50,000",
    scholarshipsAvailable: "Special Southern States merit scholarships of 25% waiver",
    placementAssistance: "150+ placement partners, Avg 5.0 LPA, Max 18 LPA",
    admissionsOpen: true,
    logoText: "VVBS",
    logoColor: "#7c3aed",
    website: "https://vishwavishwani.ac.in"
  },
  {
    id: "amity",
    name: "Amity University",
    location: "Mumbai/Noida",
    popularCourses: ["CSE", "ECE", "Biotechnology", "Aerospace"],
    feeStartingFrom: "3,10,000",
    scholarshipsAvailable: "100% scholarship for > 95% in CBSE/State Boards",
    placementAssistance: "Dedicated placement cell, 500+ MNC visits annually",
    admissionsOpen: true,
    logoText: "AMITY",
    logoColor: "#eab308",
    website: "https://amity.edu"
  },
  {
    id: "kaveri",
    name: "Kaveri University",
    location: "Anantapur, Andhra Pradesh",
    popularCourses: ["Agri-Tech B.Tech", "CSE", "ECE"],
    feeStartingFrom: "90,000",
    scholarshipsAvailable: "Hostel waiver scholarships for rural background students",
    placementAssistance: "Agri-Industry linked placements, Avg 4.0 LPA",
    admissionsOpen: true,
    logoText: "KU",
    logoColor: "#15803d",
    website: "https://kaveri.edu.in"
  },
  {
    id: "manavrachna",
    name: "Manav Rachna University",
    location: "Faridabad, Delhi NCR",
    popularCourses: ["CSE (Cyber Security)", "Mechanical Engg", "ECE"],
    feeStartingFrom: "1,80,000",
    scholarshipsAvailable: "Merit scholarships on EAPCET Ranks < 15,000 up to 100%",
    placementAssistance: "Strong corporate tieups, 100% placement assistance, Avg 5.0 LPA",
    admissionsOpen: true,
    logoText: "MRU",
    logoColor: "#dc2626",
    website: "https://manavrachna.edu.in"
  },
  {
    id: "ganpat",
    name: "Ganpat University",
    location: "Mehsana, Gujarat",
    popularCourses: ["CSE (Cloud Computing)", "Marine Engineering", "ICT"],
    feeStartingFrom: "1,10,000",
    scholarshipsAvailable: "AP & TS regional student special waiver on hostel",
    placementAssistance: "Industry linked curriculum, 90%+ placement record, Avg 4.2 LPA",
    admissionsOpen: true,
    logoText: "GNU",
    logoColor: "#06b6d4",
    website: "https://ganpatuniversity.ac.in"
  },
  {
    id: "svyasa",
    name: "S-VYASA University",
    location: "Bengaluru, Karnataka",
    popularCourses: ["B.Tech CSE (Sports Informatics)", "B.Sc Yoga & Tech"],
    feeStartingFrom: "1,20,000",
    scholarshipsAvailable: "Merit scholarship based on sports and boards performance",
    placementAssistance: "Wellness industry partnerships, Avg 4.5 LPA",
    admissionsOpen: true,
    logoText: "SVY",
    logoColor: "#b45309",
    website: "https://svyasa.edu.in"
  },
  {
    id: "veltech",
    name: "Vel Tech University",
    location: "Chennai, Tamil Nadu",
    popularCourses: ["CSE", "Aeronautical Engineering", "ECE"],
    feeStartingFrom: "1,60,000",
    scholarshipsAvailable: "Vel Tech Mahatma Gandhi Merit Scholarship up to 100% waiver",
    placementAssistance: "1000+ offers annualy, Highest 44 LPA, Avg 5.2 LPA",
    admissionsOpen: true,
    logoText: "VTU",
    logoColor: "#1d4ed8",
    website: "https://veltech.edu.in"
  },
  {
    id: "bharath",
    name: "Bharath University",
    location: "Chennai, Tamil Nadu",
    popularCourses: ["CSE", "Biomedical Engineering", "ECE"],
    feeStartingFrom: "1,50,000",
    scholarshipsAvailable: "Special Southern States merit scholarship of 25% waiver",
    placementAssistance: "500+ MNC visits per year, Avg 4.8 LPA",
    admissionsOpen: true,
    logoText: "BIHER",
    logoColor: "#0369a1",
    website: "https://bharathuniv.ac.in"
  },
  {
    id: "saveetha",
    name: "Saveetha University",
    location: "Chennai, Tamil Nadu",
    popularCourses: ["CSE", "ECE", "Biomedical", "Civil"],
    feeStartingFrom: "2,50,000",
    scholarshipsAvailable: "Saveetha Entrance Test (SECET) scholarships up to 50%",
    placementAssistance: "98% placement rate with top recruiters like TCS, Cognizant",
    admissionsOpen: true,
    logoText: "SIMATS",
    logoColor: "#be185d",
    website: "https://saveetha.com"
  },
  {
    id: "sai",
    name: "Sai University",
    location: "Chennai, Tamil Nadu",
    popularCourses: ["Computing & Data Science B.Tech", "Liberal Arts"],
    feeStartingFrom: "3,50,000",
    scholarshipsAvailable: "Need-blind admissions with merit scholarships up to 75%",
    placementAssistance: "High profile research and tech industry placements",
    admissionsOpen: true,
    logoText: "SAIU",
    logoColor: "#581c87",
    website: "https://saiuniversity.edu.in"
  },
  {
    id: "takshashila",
    name: "Takshashila University",
    location: "Tindivanam, Tamil Nadu",
    popularCourses: ["CSE", "ECE", "Agricultural Sciences"],
    feeStartingFrom: "1,20,000",
    scholarshipsAvailable: "Merit scholarships for scores > 85% in +2 exam",
    placementAssistance: "Committed placement cells, 100% assistance, Avg 4.2 LPA",
    admissionsOpen: true,
    logoText: "TUX",
    logoColor: "#0284c7",
    website: "https://takshashilauniversity.edu.in"
  },
  {
    id: "mgr",
    name: "MGR University",
    location: "Chennai, Tamil Nadu",
    popularCourses: ["CSE", "Information Technology", "Biotech"],
    feeStartingFrom: "1,40,000",
    scholarshipsAvailable: "EAPCET rank-based fee concessions of 20%",
    placementAssistance: "Dedicated placement cell, Avg 4.5 LPA",
    admissionsOpen: true,
    logoText: "MGR",
    logoColor: "#db2777",
    website: "https://drmgrdu.ac.in"
  },
  {
    id: "kalasalingam",
    name: "Kalasalingam University",
    location: "Srivilliputhur, Tamil Nadu",
    popularCourses: ["CSE (AI & ML)", "ECE", "Biotechnology"],
    feeStartingFrom: "1,30,000",
    scholarshipsAvailable: "Kalasalingam Entrance Exam (KEE) waivers up to 100%",
    placementAssistance: "Record placements with 900+ offers, Avg 5.0 LPA",
    admissionsOpen: true,
    logoText: "KLU-TN",
    logoColor: "#4f46e5",
    website: "https://kalasalingam.ac.in"
  },
  {
    id: "dhanalakshmi",
    name: "Dhanalakshmi Srinivasan University",
    location: "Trichy, Tamil Nadu",
    popularCourses: ["CSE", "IT", "Mechanical", "ECE"],
    feeStartingFrom: "1,20,000",
    scholarshipsAvailable: "Merit scholarship based on Board marks of 25% waiver",
    placementAssistance: "Excellent placement records in Southern Indian IT hubs",
    admissionsOpen: true,
    logoText: "DSU",
    logoColor: "#15803d",
    website: "https://dsu.edu.in"
  },
  {
    id: "stjosephs",
    name: "St. Joseph's University",
    location: "Bengaluru, Karnataka",
    popularCourses: ["B.Tech Artificial Intelligence", "B.Tech Data Science"],
    feeStartingFrom: "1,80,000",
    scholarshipsAvailable: "Need-based financial aid and scholarships for minority students",
    placementAssistance: "Bangalore tech corridor network placements, Avg 6.2 LPA",
    admissionsOpen: true,
    logoText: "SJU",
    logoColor: "#1e3a8a",
    website: "https://sju.edu.in"
  },
  {
    id: "joy",
    name: "Joy University",
    location: "Kanyakumari, Tamil Nadu",
    popularCourses: ["B.Tech AI & Data Science", "B.Tech CSE"],
    feeStartingFrom: "1,40,000",
    scholarshipsAvailable: "Early bird registration and local district waivers of 30%",
    placementAssistance: "Tech park linked training and internships, Avg 4.5 LPA",
    admissionsOpen: true,
    logoText: "JOY",
    logoColor: "#4338ca",
    website: "https://joyuniversity.edu.in"
  },
  {
    id: "alliance",
    name: "Alliance University",
    location: "Bengaluru, Karnataka",
    popularCourses: ["CSE", "ECE", "Aerospace Engineering"],
    feeStartingFrom: "2,80,000",
    scholarshipsAvailable: "EAPCET rankers < 10,000 get 50% tuition fee waiver",
    placementAssistance: "High profile corporate network, Avg 7.5 LPA, Max 38 LPA",
    admissionsOpen: true,
    logoText: "ALLI",
    logoColor: "#0284c7",
    website: "https://alliance.edu.in"
  },
  {
    id: "annamacharya",
    name: "Annamacharya University",
    location: "Rajampet, Kadapa",
    popularCourses: ["CSE", "ECE", "AI & ML", "Electrical"],
    feeStartingFrom: "70,000",
    scholarshipsAvailable: "Waiver for students with EAPCET ranks < 30,000",
    placementAssistance: "Reputed regional placements, Avg 4.2 LPA",
    admissionsOpen: true,
    logoText: "AITS",
    logoColor: "#4f46e5",
    website: "https://aitsrajampet.ac.in"
  },
  {
    id: "chandigarh",
    name: "Chandigarh University",
    location: "Mohali, Punjab",
    popularCourses: ["B.Tech CSE (Data Science)", "Automobile Engg", "Mech"],
    feeStartingFrom: "2,20,000",
    scholarshipsAvailable: "CUCET entrance based scholarship up to 100% waiver",
    placementAssistance: "LIMCA record for placements, 800+ recruiters, Avg 6.8 LPA",
    admissionsOpen: true,
    logoText: "CU",
    logoColor: "#b45309",
    website: "https://cuchd.in"
  },
  {
    id: "quantum",
    name: "Quantum University",
    location: "Roorkee, Uttarakhand",
    popularCourses: ["CSE (Mechatronics)", "CSE (Robotics)", "ECE"],
    feeStartingFrom: "1,20,000",
    scholarshipsAvailable: "Q-care exam based merit scholarship of up to 50%",
    placementAssistance: "Interdisciplinary training, 150+ companies, Avg 4.8 LPA",
    admissionsOpen: true,
    logoText: "QUN",
    logoColor: "#0f766e",
    website: "https://quantumuniversity.edu.in"
  },
  {
    id: "saptagiri",
    name: "Saptagiri College of Engineering",
    location: "Hindupur, Anantapur",
    popularCourses: ["CSE", "ECE", "Civil", "Mechanical"],
    feeStartingFrom: "65,000",
    scholarshipsAvailable: "Fee reimbursement scheme for eligible categories",
    placementAssistance: "Regional software and manufacturing recruitment support",
    admissionsOpen: true,
    logoText: "SCE",
    logoColor: "#15803d",
    website: "https://saptagiri.edu.in"
  }
];

export const DEFAULT_USERS = [
  {
    id: "admin-uuid-1111",
    name: "System Administrator",
    email: "admin@eapcet.com",
    password: "admin123",
    role: "admin",
    phoneNumber: "+919999999999"
  },
  {
    id: "student-uuid-2222",
    name: "Sai Yashwanth",
    email: "student@eapcet.com",
    password: "student123",
    role: "student",
    phoneNumber: "+917997166666"
  }
];

// Helper to get active user ID from Firebase or local context
const getActiveUserId = () => {
  if (fbAuth && fbAuth.currentUser) {
    return fbAuth.currentUser.uid;
  }
  const savedUser = localStorage.getItem("eapcet_current_user");
  return savedUser ? JSON.parse(savedUser).id || JSON.parse(savedUser).uid : null;
};

// Seed default dataset into Supabase
export const seedSupabaseDB = async () => {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured yet. Set VITE_SUPABASE_ANON_KEY in .env");
  }

  try {
    console.log("Seeding Database...");

    // Seed Colleges
    const collegesToInsert = getDefaultColleges().map(c => {
      const { cutoffs, ...col } = c;
      return {
        id: col.id,
        name: col.name,
        code: col.code,
        district: col.district,
        type: col.type,
        tuition_fee: col.tuitionFee,
        website: col.website,
        is_partner: col.isPartner,
        rating: col.rating,
        established: col.established,
        campus_size: col.campusSize,
        placements: col.placements
      };
    });

    const { error: cErr } = await supabase.from("colleges").upsert(collegesToInsert);
    if (cErr) throw cErr;

    // Seed Cutoffs (Chunked insertion because there are ~6000 items)
    const cutoffsToInsert = [];
    getDefaultColleges().forEach(col => {
      col.cutoffs.forEach(cut => {
        cutoffsToInsert.push({
          college_id: col.id,
          branch: cut.branch,
          category: cut.category,
          gender: cut.gender,
          local_area: cut.localArea,
          closing_rank: cut.closingRank
        });
      });
    });

    await supabase.from("cutoffs").delete().neq("id", 0);

    const chunkSize = 500;
    for (let i = 0; i < cutoffsToInsert.length; i += chunkSize) {
      const chunk = cutoffsToInsert.slice(i, i + chunkSize);
      const { error: cutErr } = await supabase.from("cutoffs").insert(chunk);
      if (cutErr) throw cutErr;
    }

    // Seed Featured Universities
    const recsToInsert = DEFAULT_RECOMMENDED_UNIVERSITIES.map(r => ({
      id: r.id,
      name: r.name,
      location: r.location,
      popular_courses: r.popularCourses,
      fee_starting_from: r.feeStartingFrom,
      scholarships_available: r.scholarshipsAvailable,
      placement_assistance: r.placementAssistance,
      admissions_open: r.admissionsOpen,
      logo_text: r.logoText,
      logo_color: r.logoColor,
      is_active: true,
      website: r.website
    }));

    const { error: rErr } = await supabase.from("featured_universities").upsert(recsToInsert);
    if (rErr) throw rErr;

    // Seed Users
    const { error: uErr } = await supabase.from("users").upsert(
      DEFAULT_USERS.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role,
        phone: u.phoneNumber
      }))
    );
    if (uErr) throw uErr;

    return { success: true, count: collegesToInsert.length, cutoffsCount: cutoffsToInsert.length };
  } catch (err) {
    console.error("Seeding failed: ", err);
    throw err;
  }
};

// Initialize local storage databases
export const initializeDB = () => {
  if (!localStorage.getItem("eapcet_colleges")) {
    const defaultColleges = getDefaultColleges();
    localStorage.setItem("eapcet_colleges", JSON.stringify(defaultColleges));
  }
  if (!localStorage.getItem("eapcet_recommendations")) {
    localStorage.setItem("eapcet_recommendations", JSON.stringify(DEFAULT_RECOMMENDED_UNIVERSITIES));
  }
  if (!localStorage.getItem("eapcet_users")) {
    localStorage.setItem("eapcet_users", JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem("eapcet_leads")) {
    localStorage.setItem("eapcet_leads", JSON.stringify([]));
  }
  if (!localStorage.getItem("eapcet_predictions")) {
    localStorage.setItem("eapcet_predictions", JSON.stringify([]));
  }
};

// ==========================================
// RESILIENT ACCESSORS (Firebase + Supabase + localStorage Fallback)
// ==========================================

export const getColleges = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data: cols, error: cErr } = await supabase.from("colleges").select("*");
      if (cErr) throw cErr;
      
      const { data: cutoffs, error: cutErr } = await supabase.from("cutoffs").select("*");
      if (cutErr) throw cutErr;

      return cols.map(col => {
        const colCutoffs = cutoffs
          .filter(cut => cut.college_id === col.id)
          .map(cut => ({
            branch: cut.branch,
            category: cut.category,
            gender: cut.gender,
            localArea: cut.local_area,
            closingRank: cut.closing_rank
          }));
        
        return {
          id: col.id,
          name: col.name,
          code: col.code,
          district: col.district,
          type: col.type,
          tuitionFee: col.tuition_fee,
          website: col.website,
          isPartner: col.is_partner,
          rating: Number(col.rating) || 4.0,
          established: col.established,
          campusSize: col.campus_size,
          placements: col.placements,
          cutoffs: colCutoffs
        };
      });
    } catch (err) {
      console.warn("Supabase fetch colleges failed, local fallback", err);
    }
  }

  initializeDB();
  return JSON.parse(localStorage.getItem("eapcet_colleges"));
};

export const saveColleges = async (colleges) => {
  if (isSupabaseConfigured()) {
    try {
      const collegesToUpsert = colleges.map(c => ({
        id: c.id,
        name: c.name,
        code: c.code,
        district: c.district,
        type: c.type,
        tuition_fee: c.tuitionFee,
        website: c.website,
        is_partner: c.isPartner,
        rating: c.rating,
        established: c.established,
        campus_size: c.campusSize,
        placements: c.placements
      }));
      const { error } = await supabase.from("colleges").upsert(collegesToUpsert);
      if (!error) return;
    } catch (err) {
      console.warn("Supabase save failed", err);
    }
  }

  localStorage.setItem("eapcet_colleges", JSON.stringify(colleges));
};

export const getRecommendations = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("featured_universities")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      
      return data.map(r => ({
        id: r.id,
        name: r.name,
        location: r.location,
        popularCourses: r.popular_courses,
        feeStartingFrom: r.fee_starting_from,
        scholarshipsAvailable: r.scholarships_available,
        placementAssistance: r.placement_assistance,
        admissionsOpen: r.admissions_open,
        logoText: r.logo_text,
        logoColor: r.logo_color,
        website: r.website
      }));
    } catch (err) {
      console.warn("Supabase fetch recommendations failed, local fallback", err);
    }
  }
  
  initializeDB();
  return JSON.parse(localStorage.getItem("eapcet_recommendations"));
};

export const saveRecommendations = async (recs) => {
  if (isSupabaseConfigured()) {
    try {
      const toUpsert = recs.map(r => ({
        id: r.id,
        name: r.name,
        location: r.location,
        popular_courses: r.popularCourses,
        fee_starting_from: r.feeStartingFrom,
        scholarships_available: r.scholarshipsAvailable,
        placement_assistance: r.placementAssistance,
        admissions_open: r.admissionsOpen,
        logo_text: r.logoText,
        logo_color: r.logoColor,
        website: r.website,
        is_active: true
      }));
      const { error } = await supabase.from("featured_universities").upsert(toUpsert);
      if (!error) return;
    } catch (err) {
      console.warn("Supabase save recommendations failed", err);
    }
  }
  localStorage.setItem("eapcet_recommendations", JSON.stringify(recs));
};

export const getLeads = async () => {
  // 1. Check Cloud Firestore
  if (isFirebaseConfigured()) {
    try {
      const snapshot = await getDocs(collection(fbDb, "requests"));
      return snapshot.docs.map(docSnapshot => {
        const d = docSnapshot.data();
        return {
          id: docSnapshot.id,
          name: d.studentName,
          email: d.email,
          mobile: d.phone,
          collegeId: d.entityId,
          collegeName: d.collegeName,
          branch: d.branch || "General",
          type: d.type,
          createdAt: d.createdAt
        };
      });
    } catch (err) {
      console.warn("Firestore fetch requests failed", err);
    }
  }

  // 2. Check Supabase
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("requests").select("*");
      if (!error && data) {
        return data.map(l => ({
          id: l.id,
          name: l.student_name,
          email: l.email,
          mobile: l.phone,
          collegeId: l.entity_id,
          collegeName: l.college_name,
          branch: l.branch || "Multiple",
          type: l.type,
          createdAt: l.created_at
        }));
      }
    } catch (err) {
      console.warn("Supabase fetch leads failed", err);
    }
  }

  // 3. Fallback
  initializeDB();
  return JSON.parse(localStorage.getItem("eapcet_leads"));
};

export const saveLeads = async (leads) => {
  const latest = leads[leads.length - 1];
  if (!latest) return;

  const currentUserId = getActiveUserId();

  // 1. Cloud Firestore Write
  if (isFirebaseConfigured()) {
    try {
      await addDoc(collection(fbDb, "requests"), {
        userId: currentUserId || "guest-id",
        entityId: latest.collegeId,
        collegeName: latest.collegeName,
        branch: latest.branch || "General",
        phone: latest.mobile,
        email: latest.email,
        studentName: latest.name,
        type: latest.type || "Counseling Call",
        createdAt: latest.createdAt || new Date().toISOString()
      });
      return;
    } catch (err) {
      console.warn("Firestore insert request failed, trying fallbacks", err);
    }
  }

  // 2. Supabase Write
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("requests").insert([{
        student_name: latest.name,
        email: latest.email,
        phone: latest.mobile,
        entity_id: latest.collegeId,
        college_name: latest.collegeName,
        branch: latest.branch,
        type: latest.type,
        user_id: currentUserId
      }]);
      if (!error) return;
    } catch (err) {
      console.warn("Supabase insert request failed", err);
    }
  }

  // 3. Local fallback
  localStorage.setItem("eapcet_leads", JSON.stringify(leads));
};

export const getUsers = async () => {
  // 1. Firestore fetch
  if (isFirebaseConfigured()) {
    try {
      const snapshot = await getDocs(collection(fbDb, "users"));
      return snapshot.docs.map(docSnapshot => {
        const d = docSnapshot.data();
        return {
          uid: docSnapshot.id,
          id: docSnapshot.id,
          name: d.fullName,
          email: d.email || "",
          phoneNumber: d.phoneNumber,
          role: d.role || "student"
        };
      });
    } catch (err) {
      console.warn("Firestore fetch users failed", err);
    }
  }

  // 2. Supabase fetch
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (!error && data) return data;
    } catch (err) {
      console.warn("Supabase fetch users failed", err);
    }
  }

  // 3. Local Fallback
  initializeDB();
  return JSON.parse(localStorage.getItem("eapcet_users"));
};

export const saveUsers = async (users) => {
  const latest = users[users.length - 1];
  if (!latest) return;

  // 1. Cloud Firestore write
  if (isFirebaseConfigured()) {
    try {
      const uid = latest.uid || latest.id || Date.now().toString();
      await setDoc(doc(fbDb, "users", uid), {
        fullName: latest.name,
        phoneNumber: latest.phoneNumber || latest.phone || "",
        email: latest.email || "",
        role: latest.role || "student",
        createdAt: new Date().toISOString()
      });
      return;
    } catch (err) {
      console.warn("Firestore insert user profile failed", err);
    }
  }

  // 2. Supabase write
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("users").upsert([{
        id: latest.id || Date.now().toString(),
        name: latest.name,
        email: latest.email || "",
        phone: latest.phoneNumber || latest.phone || "",
        password: latest.password || "firebase-auth",
        role: latest.role
      }]);
      if (!error) return;
    } catch (err) {
      console.warn("Supabase save user failed", err);
    }
  }

  // 3. Local fallback
  localStorage.setItem("eapcet_users", JSON.stringify(users));
};

export const getPredictionHistorySync = async (email) => {
  const emailKey = email.toLowerCase().replace(/[^a-z0-9]/g, "");
  const currentUserId = getActiveUserId();

  // 1. Firestore Read
  if (isFirebaseConfigured() && currentUserId) {
    try {
      const q = query(
        collection(fbDb, "predictions"), 
        where("userId", "==", currentUserId)
      );
      const snapshot = await getDocs(q);
      
      const results = snapshot.docs.map(docSnapshot => {
        const d = docSnapshot.data();
        return {
          date: d.createdAt,
          inputType: d.marks ? "marks" : "rank",
          inputValue: d.marks || d.rank,
          rank: d.rank,
          category: d.category,
          gender: d.gender,
          localArea: d.localArea,
          matchesCount: d.matchesCount
        };
      });

      // Sort by date descending
      results.sort((a,b) => new Date(b.date) - new Date(a.date));
      return results;
    } catch (err) {
      console.warn("Firestore fetch history failed", err);
    }
  }

  // 2. Supabase Read
  if (isSupabaseConfigured() && currentUserId) {
    try {
      const { data, error } = await supabase
        .from("predictions")
        .select("*")
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false });
        
      if (!error && data) {
        return data.map(p => ({
          date: p.created_at,
          inputType: p.marks ? "marks" : "rank",
          inputValue: p.marks || p.rank,
          rank: p.rank,
          category: p.category,
          gender: p.gender,
          localArea: p.local_area,
          matchesCount: p.matches_count
        }));
      }
    } catch (err) {
      console.warn("Supabase fetch history failed", err);
    }
  }
  
  // 3. Local Read
  const savedHistory = localStorage.getItem(`eapcet_history_${emailKey}`);
  return savedHistory ? JSON.parse(savedHistory) : [];
};

export const savePredictionToHistorySync = async (email, queryItem) => {
  const emailKey = email.toLowerCase().replace(/[^a-z0-9]/g, "");
  const currentUserId = getActiveUserId();

  // Local write
  const savedHistory = localStorage.getItem(`eapcet_history_${emailKey}`);
  const historyList = savedHistory ? JSON.parse(savedHistory) : [];
  const updatedHistory = [queryItem, ...historyList].slice(0, 20);
  localStorage.setItem(`eapcet_history_${emailKey}`, JSON.stringify(updatedHistory));

  // 1. Cloud Firestore write
  if (isFirebaseConfigured() && currentUserId) {
    try {
      await addDoc(collection(fbDb, "predictions"), {
        userId: currentUserId,
        rank: queryItem.rank,
        marks: queryItem.inputType === "marks" ? queryItem.inputValue : null,
        category: queryItem.category,
        gender: queryItem.gender,
        localArea: queryItem.localArea,
        matchesCount: queryItem.matchesCount,
        createdAt: queryItem.date || new Date().toISOString()
      });
      return;
    } catch (err) {
      console.warn("Firestore write predictions log failed", err);
    }
  }

  // 2. Supabase write
  if (isSupabaseConfigured() && currentUserId) {
    try {
      await supabase.from("predictions").insert([{
        user_id: currentUserId,
        rank: queryItem.rank,
        marks: queryItem.inputType === "marks" ? queryItem.inputValue : null,
        category: queryItem.category,
        gender: queryItem.gender,
        local_area: queryItem.localArea,
        matches_count: queryItem.matchesCount
      }]);
    } catch (err) {
      console.warn("Supabase insert history failed", err);
    }
  }
};

export const getFavoritesSync = async (email) => {
  const emailKey = email.toLowerCase().replace(/[^a-z0-9]/g, "");
  const currentUserId = getActiveUserId();

  // 1. Cloud Firestore Read (Optimized single doc lookup)
  if (isFirebaseConfigured() && currentUserId) {
    try {
      const docSnap = await getDoc(doc(fbDb, "favourites", currentUserId));
      if (docSnap.exists()) {
        return docSnap.data().collegeIds || [];
      }
      return [];
    } catch (err) {
      console.warn("Firestore read favorites doc failed", err);
    }
  }

  // 2. Supabase Read
  if (isSupabaseConfigured() && currentUserId) {
    try {
      const { data, error } = await supabase
        .from("favourites")
        .select("college_id")
        .eq("user_id", currentUserId);
      if (!error && data) {
        return data.map(f => f.college_id);
      }
    } catch (err) {
      console.warn("Supabase fetch favorites failed", err);
    }
  }

  // 3. Local Read
  const savedFavs = localStorage.getItem(`eapcet_favs_${emailKey}`);
  return savedFavs ? JSON.parse(savedFavs) : [];
};

export const saveFavoritesSync = async (email, favList) => {
  const emailKey = email.toLowerCase().replace(/[^a-z0-9]/g, "");
  localStorage.setItem(`eapcet_favs_${emailKey}`, JSON.stringify(favList));

  const currentUserId = getActiveUserId();

  // 1. Cloud Firestore Write (Save whole array inside user doc)
  if (isFirebaseConfigured() && currentUserId) {
    try {
      await setDoc(doc(fbDb, "favourites", currentUserId), {
        collegeIds: favList
      });
      return;
    } catch (err) {
      console.warn("Firestore save favorites doc failed", err);
    }
  }

  // 2. Supabase Write
  if (isSupabaseConfigured() && currentUserId) {
    try {
      await supabase.from("favourites").delete().eq("user_id", currentUserId);
      if (favList.length > 0) {
        const insertRows = favList.map(cid => ({
          user_id: currentUserId,
          college_id: cid
        }));
        await supabase.from("favourites").insert(insertRows);
      }
    } catch (err) {
      console.warn("Supabase save favorites failed", err);
    }
  }
};
