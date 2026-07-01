import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./views/Home";
import Dashboard from "./views/Dashboard";
import AdminPanel from "./views/AdminPanel";
import RequestModal from "./components/RequestModal";
import MentorshipWidget from "./components/MentorshipWidget";
import HelpWidget from "./components/HelpWidget";
import LoadingScreen from "./components/LoadingScreen";
import { 
  initializeDB, 
  getFavoritesSync, 
  saveFavoritesSync, 
  getPredictionHistorySync, 
  savePredictionToHistorySync,
  getUsers,
  saveUsers
} from "./utils/db";
import { auth as fbAuth, isFirebaseConfigured } from "./utils/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState("home"); // "home" | "dashboard" | "admin"
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  // Modals state
  const [showAuth, setShowAuth] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [requestCollege, setRequestCollege] = useState(null);
  const [requestBranch, setRequestBranch] = useState("");

  // Favorites state
  const [favorites, setFavorites] = useState([]);
  
  // Prediction history logs
  const [predictionHistory, setPredictionHistory] = useState([]);

  // Rerun hook query data
  const [rerunQuery, setRerunQuery] = useState(null);

  // Initialize DB and bind Auth observer
  useEffect(() => {
    initializeDB();
    
    // Check if Firebase Auth is active
    if (isFirebaseConfigured() && fbAuth) {
      const unsubscribe = onAuthStateChanged(fbAuth, async (fbUser) => {
        if (fbUser) {
          // Look up Firestore profile
          const usersList = await getUsers();
          let activeUser = usersList.find(u => u.uid === fbUser.uid || u.id === fbUser.uid);
          
          if (!activeUser) {
            const formattedMobile = fbUser.phoneNumber;
            const isFirstAdmin = formattedMobile === "+919999999999" || formattedMobile === "+917997166666";
            activeUser = {
              uid: fbUser.uid,
              id: fbUser.uid,
              name: "EAPCET Candidate",
              phoneNumber: fbUser.phoneNumber,
              email: isFirstAdmin ? "admin@eapcet.com" : `student_${fbUser.phoneNumber.replace(/\D/g, "").slice(-10)}@admissionindia.in`,
              role: isFirstAdmin ? "admin" : "student"
            };
            usersList.push(activeUser);
            await saveUsers(usersList);
          }
          
          setUser(activeUser);
          localStorage.setItem("eapcet_current_user", JSON.stringify(activeUser));
          await loadUserData(activeUser.email);
        } else {
          // User is signed out in Firebase Auth
          setUser(null);
          localStorage.removeItem("eapcet_current_user");
          await loadUserData("guest");
        }
      });
      return () => unsubscribe();
    } else {
      // Local Auth Fallback
      const savedUser = localStorage.getItem("eapcet_current_user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        loadUserData(parsedUser.email);
      } else {
        loadUserData("guest");
      }
    }

    // Minimum delay to show the cute loading animation
    setTimeout(() => {
      setIsAppLoading(false);
    }, 2000);
  }, []);

  // Load user specific data asynchronously
  const loadUserData = async (email) => {
    const favs = await getFavoritesSync(email);
    setFavorites(favs);
    const hist = await getPredictionHistorySync(email);
    setPredictionHistory(hist);
  };

  // Auth actions
  const handleLoginSuccess = async (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem("eapcet_current_user", JSON.stringify(loggedInUser));
    await loadUserData(loggedInUser.email);
    
    // Redirect role views
    if (loggedInUser.role === "admin") {
      setCurrentView("admin");
    } else {
      setCurrentView("dashboard");
    }
  };

  const handleLogout = async () => {
    if (isFirebaseConfigured() && fbAuth) {
      try {
        await signOut(fbAuth);
      } catch (err) {
        console.error("Firebase SignOut failed: ", err);
      }
    } else {
      setUser(null);
      localStorage.removeItem("eapcet_current_user");
      await loadUserData("guest");
      setCurrentView("home");
    }
  };

  // Favorites Toggle Action
  const handleFavoriteToggle = async (collegeId) => {
    const email = user ? user.email : "guest";
    let updatedFavs = [];

    if (favorites.includes(collegeId)) {
      updatedFavs = favorites.filter(id => id !== collegeId);
    } else {
      updatedFavs = [...favorites, collegeId];
    }

    setFavorites(updatedFavs);
    await saveFavoritesSync(email, updatedFavs);
  };

  // Save prediction query to logs
  const savePredictionToHistory = async (queryItem) => {
    const email = user ? user.email : "guest";
    const updatedHistory = [queryItem, ...predictionHistory].slice(0, 20); // Keep top 20
    
    setPredictionHistory(updatedHistory);
    await savePredictionToHistorySync(email, queryItem);
  };

  // Details request modal triggers (Talk to an Expert / Get Admission Guidance)
  const handleRequestDetails = (college, branchName = "") => {
    setRequestCollege(college);
    setRequestBranch(branchName);
    setShowRequest(true);
  };

  // Rerun prediction trigger from Dashboard logs
  const handleRerunPrediction = (histItem) => {
    setRerunQuery(histItem);
    setCurrentView("home");
    
    // Scroll to form inputs
    setTimeout(() => {
      document.getElementById("predictor-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <>
      {isAppLoading && <LoadingScreen />}
      
      <div className={`app-container ${isAppLoading ? "hidden" : ""}`}>
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Main screens routing */}
      <main className="main-content">
        {currentView === "home" && (
          <Home
            favorites={favorites}
            onFavoriteToggle={handleFavoriteToggle}
            onRequestDetails={handleRequestDetails}
            savePredictionToHistory={savePredictionToHistory}
            // For query rerun prepopulation
            rerunQuery={rerunQuery}
            onClearRerun={() => setRerunQuery(null)}
          />
        )}

        {currentView === "dashboard" && user && (
          <Dashboard
            user={user}
            favorites={favorites}
            predictionHistory={predictionHistory}
            onFavoriteToggle={handleFavoriteToggle}
            onRequestDetails={handleRequestDetails}
            onRerunPrediction={handleRerunPrediction}
          />
        )}

        {currentView === "admin" && user && user.role === "admin" && (
          <AdminPanel />
        )}
      </main>

      {/* Footer information */}
      <Footer onViewChange={setCurrentView} />

      {/* Counseling Helpline & WhatsApp Leads Modal Form */}
      {showRequest && requestCollege && (
        <RequestModal
          college={requestCollege}
          branchName={requestBranch}
          onClose={() => {
            setShowRequest(false);
            setRequestCollege(null);
          }}
        />
      )}

      {/* Floating "Need Help?" counselling widget */}
      <HelpWidget />

      {/* Floating AI Bot — Inku & Pinku */}
      <MentorshipWidget user={user} />
    </div>
    </>
  );
}
