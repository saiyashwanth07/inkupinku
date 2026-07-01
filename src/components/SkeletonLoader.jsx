import React from "react";

export default function SkeletonLoader({ count = 3 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
      {Array.from({ length: count }).map((_, idx) => (
        <div className="skeleton-card" key={idx}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: "16px", width: "80%" }}>
              <div className="shimmer shimmer-avatar" />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "60%" }}>
                <div className="shimmer shimmer-title" />
                <div className="shimmer shimmer-text-sm" />
              </div>
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
            <div className="shimmer shimmer-text-sm" style={{ width: "15%" }} />
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <div className="shimmer" style={{ height: "38px", width: "180px", borderRadius: "12px" }} />
              <div className="shimmer" style={{ height: "38px", width: "180px", borderRadius: "12px" }} />
            </div>
          </div>

          <div className="card-footer" style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px", marginTop: "4px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div className="shimmer" style={{ height: "12px", width: "60px" }} />
              <div className="shimmer" style={{ height: "20px", width: "80px" }} />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <div className="shimmer shimmer-btn" />
              <div className="shimmer shimmer-btn" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
