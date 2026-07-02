import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./views/Home";
import Dashboard from "./views/Dashboard";
import AdminPanel from "./views/AdminPanel";
import RequestModal from "./components/RequestModal";
import HelpWidget from "./components/HelpWidget";
const AuthModal = lazy(() => import("./components/AuthModal"));
import { 
  initializeDB, 
  getFavoritesSync, 
  saveFavoritesSync, 
  getPredictionHistorySync, 
  savePredictionToHistorySync,
  getUsers,
  saveUsers,
  updateLastLogin
} from "./utils/db";
import { auth as fbAuth, isFirebaseConfigured } from "./utils/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./App.css";

// ─── Toast Component ──────────────────────────────────────────────────────────
function Toast({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div style={{
      position: "fixed",
      top: "76px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
      color: "white",
      padding: "12px 24px",
      borderRadius: "50px",
      boxShadow: "0 8px 32px rgba(37,99,235,0.35)",
      fontSize: "0.88rem",
      fontWeight: "600",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      animation: "fadeUp 0.3s ease",
      whiteSpace: "nowrap"
    }}>
      <span style={{ fontSize: "1.1rem" }}>🔓</span>
      {message}
      <button
        onClick={onDismiss}
        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: "1rem", lineHeight: 1, marginLeft: "4px" }}
      >×</button>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState("home"); // "home" | "dashboard" | "admin"
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  // Modals state
  const [showAuth, setShowAuth] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [requestCollege, setRequestCollege] = useState(null);
  const [requestBranch, setRequestBranch] = useState("");

  // Toast
  const [toastMessage, setToastMessage] = useState(null);

  // Favorites state
  const [favorites, setFavorites] = useState([]);
  
  // Prediction history logs
  const [predictionHistory, setPredictionHistory] = useState([]);

  // Rerun hook query data
  const [rerunQuery, setRerunQuery] = useState(null);

  // Load user-specific data using UID (no fake email needed)
  const loadUserData = useCallback(async (uid) => {
    const favs = await getFavoritesSync(uid || "guest");
    setFavorites(favs);
    const hist = await getPredictionHistorySync(uid || "guest");
    setPredictionHistory(hist);
  }, []);

  // Initialize DB and bind Auth observer
  useEffect(() => {
    initializeDB();
    let unsubscribe = null;
    
    if (isFirebaseConfigured() && fbAuth) {
      unsubscribe = onAuthStateChanged(fbAuth, async (fbUser) => {
        if (fbUser) {
          // Look up Firestore profile
          const usersList = await getUsers();
          let activeUser = usersList.find(u => u.uid === fbUser.uid || u.id === fbUser.uid);
          
          if (!activeUser) {
            const isAdmin = fbUser.phoneNumber === "+919999999999" || fbUser.phoneNumber === "+917997166666";
            activeUser = {
              uid: fbUser.uid,
              id: fbUser.uid,
              name: isAdmin ? "System Administrator" : "Student",
              phoneNumber: fbUser.phoneNumber,
              role: isAdmin ? "admin" : "student"
            };
            usersList.push(activeUser);
            await saveUsers(usersList);
          } else {
            // Update lastLogin on every session restore
            await updateLastLogin(fbUser.uid);
          }
          
          setUser(activeUser);
          localStorage.setItem("eapcet_current_user", JSON.stringify(activeUser));
          await loadUserData(fbUser.uid);
        } else {
          setUser(null);
          localStorage.removeItem("eapcet_current_user");
          await loadUserData("guest");
        }
      });
    } else {
      // Local Auth Fallback
      const savedUser = localStorage.getItem("eapcet_current_user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        loadUserData(parsedUser.uid || parsedUser.id || "guest");
      } else {
        loadUserData("guest");
      }
    }

    setIsAppLoading(false);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadUserData]);

  // Auth actions
  const handleLoginSuccess = async (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem("eapcet_current_user", JSON.stringify(loggedInUser));
    await loadUserData(loggedInUser.uid || loggedInUser.id || "guest");
    
    // Always return to predictor (admin → admin panel is the only exception)
    if (loggedInUser.role === "admin") {
      setCurrentView("admin");
    } else {
      setCurrentView("home");
      // Show unlock toast
      const name = loggedInUser.name && loggedInUser.name !== "Student" ? loggedInUser.name.split(" ")[0] : "";
      setToastMessage(name
        ? `Welcome back, ${name}! Your complete college list has been unlocked.`
        : "Welcome back! Your complete college list has been unlocked."
      );
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

  // Favorites Toggle Action (uid-keyed)
  const handleFavoriteToggle = async (collegeId) => {
    const uid = user ? (user.uid || user.id || "guest") : "guest";
    let updatedFavs = [];

    if (favorites.includes(collegeId)) {
      updatedFavs = favorites.filter(id => id !== collegeId);
    } else {
      updatedFavs = [...favorites, collegeId];
    }

    setFavorites(updatedFavs);
    await saveFavoritesSync(uid, updatedFavs);
  };

  // Save prediction query to logs (uid-keyed)
  const savePredictionToHistory = async (queryItem) => {
    const uid = user ? (user.uid || user.id || "guest") : "guest";
    const updatedHistory = [queryItem, ...predictionHistory].slice(0, 20);
    setPredictionHistory(updatedHistory);
    await savePredictionToHistorySync(uid, queryItem);
  };

  // Details request modal triggers
  const handleRequestDetails = (college, branchName = "") => {
    setRequestCollege(college);
    setRequestBranch(branchName);
    setShowRequest(true);
  };

  // Rerun prediction trigger from Dashboard logs
  const handleRerunPrediction = (histItem) => {
    setRerunQuery(histItem);
    setCurrentView("home");
    setTimeout(() => {
      document.getElementById("predictor-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <>
      {/* Welcome unlock toast */}
      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}

      <div className={`app-container ${isAppLoading ? "hidden" : ""}`}>
        <Navbar
          currentView={currentView}
          onViewChange={setCurrentView}
          user={user}
          onLoginClick={() => setShowAuth(true)}
          onLogout={handleLogout}
        />

        {/* Main screens routing */}
        <main className="main-content">
          {currentView === "home" && (
            <Home
              user={user}
              onAuthClick={() => setShowAuth(true)}
              favorites={favorites}
              onFavoriteToggle={handleFavoriteToggle}
              onRequestDetails={handleRequestDetails}
              savePredictionToHistory={savePredictionToHistory}
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

        {/* Footer */}
        <Footer onViewChange={setCurrentView} />

        {/* Counseling Lead Modal */}
        {showRequest && requestCollege && (
          <RequestModal
            college={requestCollege}
            branchName={requestBranch}
            user={user}
            onClose={() => {
              setShowRequest(false);
              setRequestCollege(null);
            }}
          />
        )}

        {/* Floating help widget */}
        <HelpWidget />

        {/* Auth Modal */}
        {showAuth && (
          <Suspense fallback={<div className="modal-overlay font-poppins"><div className="modal-content"><p>Loading secure login...</p></div></div>}>
            <AuthModal 
              onClose={() => setShowAuth(false)} 
              onLoginSuccess={handleLoginSuccess} 
            />
          </Suspense>
        )}
      </div>
    </>
  );
}
