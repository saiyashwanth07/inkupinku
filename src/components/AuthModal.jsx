import React, { useState, useEffect } from "react";
import { X, Phone, User, Eye, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth, isFirebaseConfigured } from "../utils/firebase";
import { getUsers, saveUsers, getUserProfile, checkUserExistsByPhone } from "../utils/db";

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState("login"); // "login" | "register"
  const [step, setStep] = useState("input"); // "input" | "otp"
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Firebase confirmation results
  const [confirmationResult, setConfirmationResult] = useState(null);

  const formattedMobile = mobile.trim().startsWith("+") ? mobile.trim() : `+91${mobile.trim()}`;
  const isTestNumber = formattedMobile === "+919848575599" || formattedMobile === "+919999999999" || formattedMobile === "+917997166666";

  // Cleanup verifier on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {}
      }
    };
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFullName("");
    setMobile("");
    setOtp("");
    setErrors({});
    setAuthError("");
    setStep("input");
  };

  const validateInput = () => {
    const errs = {};
    if (activeTab === "register" && !fullName.trim()) {
      errs.fullName = "Full name is required";
    }

    if (!mobile.trim()) {
      errs.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      errs.mobile = "Enter a valid 10-digit mobile number";
    }
    return errs;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    const validationErrors = validateInput();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setAuthError("");
    setIsLoading(true);

    try {
      const userExists = await checkUserExistsByPhone(formattedMobile);

      if (activeTab === "login" && !userExists && formattedMobile !== "+917997166666" && formattedMobile !== "+919999999999" && formattedMobile !== "+919848575599") {
        setAuthError("Mobile number is not registered. Please create an account first.");
        setIsLoading(false);
        return;
      }

      if (activeTab === "register" && userExists) {
        setAuthError("Mobile number is already registered. Please Sign In.");
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Failed to check if user exists:", e);
    }

    // Handle Mock SMS Fallback ONLY if Firebase is not configured
    if (!isFirebaseConfigured()) {
      setTimeout(() => {
        setIsLoading(false);
        setStep("otp");
      }, 800);
      return;
    }

    // Live Firebase Phone Auth
    try {
      // Dynamically initialize reCAPTCHA verifier to prevent verifier is not initialized errors
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          },
          "expired-callback": () => {
            setAuthError("reCAPTCHA expired. Please try again.");
          }
        });
      }
      const verifier = window.recaptchaVerifier;

      // Proceed directly to send OTP. The backend auth flow will naturally handle existing vs new users securely.

      const confirmation = await signInWithPhoneNumber(auth, formattedMobile, verifier);
      setConfirmationResult(confirmation);
      setIsLoading(false);
      setStep("otp");
    } catch (err) {
      console.error("Firebase SMS send failed: ", err);
      setAuthError(err.message || "Failed to send OTP. Please check your network or reCAPTCHA.");
      setIsLoading(false);
      
      // Reset reCAPTCHA
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        } catch (e) {}
      }
      setStep("input");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setAuthError("Please enter a valid 6-digit OTP code");
      return;
    }

    setAuthError("");
    setIsLoading(true);

    // Mock SMS Verification ONLY if Firebase is not configured
    if (!isFirebaseConfigured()) {
      setTimeout(async () => {
        if (otp !== "123456") {
          setAuthError("Invalid OTP code. Please enter 123456.");
          setIsLoading(false);
          return;
        }

        // Login/Signup success triggers
        const usersList = await getUsers();
        let activeUser = usersList.find(
          u => (u.phoneNumber === formattedMobile || u.phone === formattedMobile)
        );

        if (activeTab === "register") {
          if (activeUser) {
            setAuthError("User already exists. Logging in.");
          } else {
            // Create user locally — NO fake email
            const isFirstAdmin = formattedMobile === "+919999999999";
            activeUser = {
              uid: "mock-uid-" + Date.now(),
              id: "mock-uid-" + Date.now(),
              name: fullName,
              phoneNumber: formattedMobile,
              role: isFirstAdmin ? "admin" : "student"
            };
            usersList.push(activeUser);
            await saveUsers(usersList);
          }
        } else {
          // Double check login
          if (!activeUser) {
            // Create automatic fallback profile if admin number
            const isFirstAdmin = formattedMobile === "+919999999999";
            activeUser = {
              uid: isFirstAdmin ? "admin-uuid-1111" : "mock-uid-" + Date.now(),
              id: isFirstAdmin ? "admin-uuid-1111" : "mock-uid-" + Date.now(),
              name: isFirstAdmin ? "System Administrator" : "Student User",
              phoneNumber: formattedMobile,
              email: isFirstAdmin ? "admin@eapcet.com" : "student@eapcet.com",
              role: isFirstAdmin ? "admin" : "student"
            };
            usersList.push(activeUser);
            await saveUsers(usersList);
          }
        }

        onLoginSuccess(activeUser);
        setIsLoading(false);
        onClose();
      }, 800);
      return;
    }

    // Live Firebase OTP verification
    try {
      const result = await confirmationResult.confirm(otp);
      const fbUser = result.user;
      
      let activeUser = await getUserProfile(fbUser.uid, fbUser.phoneNumber);
      const usersList = await getUsers(); // Fallback for saveUsers array management

      if (!activeUser) {
        // Create Firestore profile — NO fake email
        const isFirstAdmin = formattedMobile === "+919999999999" || formattedMobile === "+917997166666";
        activeUser = {
          uid: fbUser.uid,
          id: fbUser.uid,
          name: activeTab === "register" ? fullName : "Student",
          phoneNumber: fbUser.phoneNumber,
          role: isFirstAdmin ? "admin" : "student"
        };
        usersList.push(activeUser);
        await saveUsers(usersList);
      }

      onLoginSuccess(activeUser);
      setIsLoading(false);
      onClose();
    } catch (err) {
      console.error("Firebase OTP Verification failed: ", err);
      setAuthError("Incorrect OTP verification code. Please request a new one.");
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "420px" }}>
        
        {/* Auth Mode Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab font-poppins ${activeTab === "login" ? "active" : ""}`}
            onClick={() => handleTabChange("login")}
            disabled={isLoading || step === "otp"}
          >
            Sign In
          </button>
          <button
            className={`auth-tab font-poppins ${activeTab === "register" ? "active" : ""}`}
            onClick={() => handleTabChange("register")}
            disabled={isLoading || step === "otp"}
          >
            Create Account
          </button>
        </div>

        <button
          className="modal-close-btn"
          style={{ position: "absolute", right: "16px", top: "12px", zIndex: 10 }}
          onClick={onClose}
          disabled={isLoading}
        >
          <X size={16} />
        </button>

        <div className="modal-body" style={{ paddingTop: "24px" }}>
          
          {authError && (
            <div className="error-msg" style={{ background: "var(--borderline-light)", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.8rem", gap: "8px", display: "flex" }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

          {step === "input" ? (
            <form onSubmit={handleSendOTP} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {activeTab === "register" && (
                <div className="form-group">
                  <label className="form-label">
                    <User size={16} /> Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sai Yashwanth"
                    className="input-style"
                    disabled={isLoading}
                  />
                  {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  <Phone size={16} /> Mobile Number
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value="+91"
                    disabled
                    className="input-style"
                    style={{ width: "60px", textAlign: "center", background: "#f1f5f9", border: "1px solid var(--card-border)", color: "var(--secondary-light)", fontWeight: "600" }}
                  />
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="7997166666"
                    className="input-style"
                    disabled={isLoading}
                  />
                </div>
                {errors.mobile && <span className="error-msg">{errors.mobile}</span>}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", marginTop: "8px" }} disabled={isLoading}>
                {isLoading ? "Requesting SMS..." : "Send Verification OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "var(--primary-light)", padding: "12px 16px", borderRadius: "12px", border: "1px dashed rgba(37, 99, 235, 0.2)", fontSize: "0.85rem", color: "var(--secondary-light)" }}>
                Verification OTP code sent to: <br />
                <strong style={{ color: "var(--secondary)" }}>+91 {mobile}</strong>
                {isTestNumber && (
                  <div style={{ marginTop: "8px", fontSize: "0.75rem", color: "var(--primary)", fontWeight: "600" }}>
                    💡 Test Mode: Please enter <strong>{mobile === "9848575599" ? "559999" : "123456"}</strong> to verify.
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <ShieldCheck size={16} /> Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 123456"
                  className="input-style font-poppins"
                  style={{ textAlign: "center", letterSpacing: "8px", fontSize: "1.25rem", fontWeight: "700" }}
                  disabled={isLoading}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", marginTop: "8px" }} disabled={isLoading}>
                {isLoading ? "Verifying Profile..." : "Verify OTP & Continue"}
              </button>

              <button
                type="button"
                className="btn btn-text"
                style={{ fontSize: "0.8rem", alignSelf: "center" }}
                onClick={() => { setStep("input"); setOtp(""); setAuthError(""); }}
                disabled={isLoading}
              >
                Change Phone Number
              </button>
            </form>
          )}

          {/* Premium Sign In Benefits */}
          <div style={{ marginTop: "24px", borderTop: "1px solid var(--card-border)", paddingTop: "16px" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--secondary)", marginBottom: "8px" }}>Unlock Premium Features:</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.75rem", color: "var(--secondary-light)" }}>
              <div>✓ View All Eligible Colleges</div>
              <div>✓ Branch Comparison</div>
              <div>✓ Closing Cutoff Ranks</div>
              <div>✓ Prediction History logs</div>
              <div>✓ Save Favorites List</div>
              <div>✓ Admission Counselling Support</div>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", textAlign: "center", marginTop: "16px" }}>
              {!isFirebaseConfigured() ? (
                <span>Simulated Mode (Vite debug: Key is {import.meta.env.VITE_FIREBASE_API_KEY ? "Present" : "Missing"})</span>
              ) : (
                <span>Secured by Google Firebase Authentication.</span>
              )}
            </div>
          </div>

          {/* Invisible Google reCAPTCHA Mount anchor (always mounted to prevent element loss on step transitions) */}
          <div id="recaptcha-container"></div>

        </div>
      </div>
    </div>
  );
}
