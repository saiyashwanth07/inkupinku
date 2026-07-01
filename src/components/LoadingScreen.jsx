import React from "react";
import Inku from "./Inku";
import Pinku from "./Pinku";

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-logo font-poppins">AP EAPCET Predictor</div>
      
      <div className="loading-characters">
        <Inku className="floating-inku" size={90} />
        <Pinku className="floating-pinku" size={90} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <div className="loading-text">
          <span className="font-poppins">Powered by Inku &amp; Pinku</span>
          <div className="loading-dots">
            <span>•</span><span>•</span><span>•</span>
          </div>
        </div>
        <div className="loading-tagline font-poppins">Loading your personalized counsellor experience</div>
      </div>

      <div className="loading-bar">
        <div className="loading-bar-fill" />
      </div>
    </div>
  );
}
