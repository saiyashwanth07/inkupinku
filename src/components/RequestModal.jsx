import React, { useState } from "react";
import { X, CheckCircle, Mail, Phone, User, Landmark, HelpCircle, MessageSquare } from "lucide-react";
import { getLeads, saveLeads } from "../utils/db";

export default function RequestModal({ college, branchName, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: ""
  });
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Full name is required";
    
    if (!formData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Please enter a valid email address";
    }

    if (!formData.mobile.trim()) {
      errs.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      errs.mobile = "Please enter a valid 10-digit Indian mobile number";
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Save lead to database (Supabase + localStorage fallback)
    const currentLeads = await getLeads();
    const newLead = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
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

  const whatsappLink = `https://api.whatsapp.com/send?phone=917997166666&text=Hello!%20I%20just%20submitted%20my%20profile%20for%20admission%20guidance%20for%20${encodeURIComponent(college.name)}.%20Please%20guide%20me.`;

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
                Your counseling profile for <strong>{college.name}</strong> is registered. Connect with our admission experts immediately:
              </p>

              <div className="mentorship-contact-info" style={{ width: "100%", textAlign: "left", marginBottom: "20px" }}>
                <div className="mentorship-contact-item">
                  <Phone size={14} />
                  <span>
                    <strong>Free Helpline:</strong> <a href="tel:7997166666" style={{ color: "var(--primary)", fontWeight: "700" }}>7997166666</a>
                  </span>
                </div>
                <div className="mentorship-contact-item">
                  <MessageSquare size={14} />
                  <span>
                    <strong>WhatsApp AI Bot:</strong> <a href={whatsappLink} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", fontWeight: "700" }}>7997166666</a>
                  </span>
                </div>
                <div className="mentorship-contact-item">
                  <Mail size={14} />
                  <span>
                    <strong>Email Support:</strong> <a href="mailto:support@admissionindia.in" style={{ color: "var(--secondary)", fontWeight: "600" }}>support@admissionindia.in</a>
                  </span>
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
                Need information about <strong style={{ color: "var(--secondary)" }}>{college.name}</strong>?
                {branchName && branchName !== "Direct Admission" && <> Preferred branch: <strong style={{ color: "var(--primary)" }}>{branchName}</strong></>}
              </div>

              <p style={{ fontSize: "0.8rem", color: "var(--secondary-light)", margin: "0" }}>
                Enter your details to register for free counseling mentorship and get 24/7 helpline access.
              </p>

              <div className="form-group">
                <label className="form-label">
                  <User size={16} /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Sai Yashwanth"
                  className="input-style"
                  required
                />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@eapcet.com"
                  className="input-style"
                  required
                />
                {errors.email && <span className="error-msg">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={16} /> Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="7997166666"
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
