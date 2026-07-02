import React, { useState } from "react";
import { X, CheckCircle, Phone, User, HelpCircle, MessageSquare } from "lucide-react";
import { saveLead, getLeads, saveLeads } from "../utils/db";

export default function RequestModal({ college, branchName, user, onClose }) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    mobile: user?.phoneNumber?.replace("+91", "") || ""
  });
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Full name is required";
    if (!formData.mobile.trim()) {
      errs.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      errs.mobile = "Please enter a valid 10-digit Indian mobile number";
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const userId = user?.uid || user?.id || "guest";

    // 1. Save to new `leads` collection in Firestore
    await saveLead({
      userId,
      university: college.name,
      action: "Request Details"
    });

    // 2. Also save full lead data to old `requests` collection for CRM use
    const currentLeads = await getLeads();
    const newLead = {
      id: Date.now().toString(),
      name: formData.name,
      mobile: "+91" + formData.mobile,
      collegeId: college.id,
      collegeName: college.name,
      collegeCode: college.code || "UNI",
      branch: branchName || "General Counseling",
      type: "Counseling Call",
      createdAt: new Date().toISOString()
    };
    currentLeads.push(newLead);
    await saveLeads(currentLeads);

    setIsSuccess(true);
  };

  const whatsappLink = `https://api.whatsapp.com/send?phone=917997166666&text=Hello!%20I%20need%20admission%20guidance%20for%20${encodeURIComponent(college.name)}.%20Please%20guide%20me.`;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "480px" }}>
        <div className="modal-header">
          <div className="modal-title font-poppins">
            <HelpCircle size={20} className="logo-icon" />
            <span>Get Admission Guidance</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {isSuccess ? (
            <div className="success-animation">
              <div className="success-checkmark" style={{ background: "var(--safe-light)", color: "var(--safe)" }}>
                <CheckCircle size={40} strokeWidth={2.5} />
              </div>
              <h3 className="font-poppins" style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--secondary)" }}>
                Guidance Request Registered!
              </h3>
              <p style={{ color: "var(--secondary-light)", fontSize: "0.85rem", lineHeight: "1.6", marginBottom: "16px" }}>
                Your counseling profile for <strong>{college.name}</strong> is registered. Connect with our experts:
              </p>

              <div className="mentorship-contact-info" style={{ width: "100%", textAlign: "left", marginBottom: "20px" }}>
                <div className="mentorship-contact-item">
                  <Phone size={14} />
                  <span><strong>Free Helpline:</strong> <a href="tel:7997166666" style={{ color: "var(--primary)", fontWeight: "700" }}>7997166666</a></span>
                </div>
                <div className="mentorship-contact-item">
                  <MessageSquare size={14} />
                  <span><strong>WhatsApp:</strong> <a href={whatsappLink} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: "700" }}>7997166666</a></span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", width: "100%", flexDirection: "column" }}>
                <a href="tel:7997166666" className="btn btn-primary" style={{ width: "100%", padding: "12px" }}>
                  📞 Call Now
                </a>
                <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width: "100%", padding: "12px", background: "var(--safe)", boxShadow: "none" }}>
                  💬 Chat on WhatsApp
                </a>
                <button className="btn btn-text" onClick={onClose} style={{ marginTop: "6px" }}>
                  Maybe Later
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "var(--primary-light)", padding: "12px 16px", borderRadius: "12px", border: "1px dashed rgba(37, 99, 235, 0.2)", fontSize: "0.85rem", color: "var(--secondary-light)" }}>
                Get guidance for <strong style={{ color: "var(--secondary)" }}>{college.name}</strong>
                {branchName && branchName !== "Direct Admission" && <> — <strong style={{ color: "var(--primary)" }}>{branchName}</strong></>}
              </div>

              <p style={{ fontSize: "0.8rem", color: "var(--secondary-light)", margin: "0" }}>
                Register for free counseling and get 24/7 helpline access from our AP EAPCET experts.
              </p>

              <div className="form-group">
                <label className="form-label"><User size={16} /> Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="input-style"
                  required
                />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label"><Phone size={16} /> Mobile Number</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="input-style"
                  required
                />
                {errors.mobile && <span className="error-msg">{errors.mobile}</span>}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", marginTop: "8px" }}>
                Register & Get Helpline Access
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
