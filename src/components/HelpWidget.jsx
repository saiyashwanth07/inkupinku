import React, { useState } from "react";
import { Phone, MessageSquare, X, HelpCircle } from "lucide-react";

const WA_LINK = "https://api.whatsapp.com/send?phone=917997166666&text=Hi,%20I%20need%20help%20with%20AP%20EAPCET%20college%20selection%20and%20counselling.";

export default function HelpWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="help-widget-container">
      {/* Slide-up support panel */}
      {open && (
        <div className="help-panel">
          {/* Header */}
          <div className="help-panel-header">
            <div>
              <div className="help-panel-title">Free AP EAPCET Counselling</div>
              <div className="help-panel-sub">Not sure which college to choose?</div>
            </div>
            <button className="help-close-btn" onClick={() => setOpen(false)}>
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="help-panel-body">
            <div className="help-checklist">
              {[
                "Personalized College Guidance",
                "Web Options Support",
                "Admission Assistance",
                "Scholarship Guidance",
              ].map((item) => (
                <div className="help-check-item" key={item}>
                  <span>✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Contact rows */}
            <div className="help-contact-row">
              <Phone size={15} />
              <span>
                <strong>📞 Call:</strong>{" "}
                <a href="tel:7997166666" style={{ color: "var(--primary)", fontWeight: "700" }}>
                  7997166666
                </a>
              </span>
            </div>
            <div className="help-contact-row">
              <MessageSquare size={15} style={{ color: "#22C55E" }} />
              <span>
                <strong>💬 WhatsApp:</strong>{" "}
                <a href={WA_LINK} target="_blank" rel="noreferrer" style={{ color: "#22C55E", fontWeight: "700" }}>
                  7997166666
                </a>
              </span>
            </div>

            {/* Action buttons */}
            <div className="help-panel-actions">
              <a href="tel:7997166666" className="help-btn-call font-poppins">
                <Phone size={15} /> Call Expert
              </a>
              <a href={WA_LINK} target="_blank" rel="noreferrer" className="help-btn-wa font-poppins">
                <MessageSquare size={15} /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        className="help-widget-btn font-poppins"
        onClick={() => setOpen((p) => !p)}
        aria-label="Toggle counselling help panel"
      >
        <HelpCircle size={17} />
        Need Help?
      </button>
    </div>
  );
}
