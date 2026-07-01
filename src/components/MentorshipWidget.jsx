import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, HelpCircle, Phone, ArrowRight, Lock, CheckCircle, RefreshCw } from "lucide-react";
import { getGroqAIResponse, isGroqConfigured } from "../utils/ai";
import Inku from "./Inku";
import Pinku from "./Pinku";

export default function MentorshipWidget({ user, onAuthClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Pinku: 👋 Hello! I am Pinku, your AP EAPCET AI Counselor, and this is my logical partner Inku!\n\nAsk us about engineering colleges, branch scopes, or cutoff ranks in Andhra Pradesh.\n\nTo predict your colleges, tell us your:\n1. **Rank**\n2. **Category** (e.g. OC, BC-A, SC)\n3. **Gender** (Boys/Girls)\n4. **Local Region** (AU, SVU, OU)"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat feed to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMessage = { role: "user", content: inputText };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await getGroqAIResponse(updatedMessages);
      setMessages(prev => [...prev, response]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "⚠️ Sorry, I encountered an issue. Let's try again!" }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleChipClick = (suggestionText) => {
    setInputText(suggestionText);
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Pinku: 👋 Hello! I am Pinku, your AP EAPCET AI Counselor, and this is my logical partner Inku!\n\nAsk us about engineering colleges, branch scopes, or cutoff ranks in Andhra Pradesh.\n\nTo predict your colleges, tell us your:\n1. **Rank**\n2. **Category** (e.g. OC, BC-A, SC)\n3. **Gender** (Boys/Girls)\n4. **Local Region** (AU, SVU, OU)"
      }
    ]);
  };

  const promoWhatsappLink = "https://api.whatsapp.com/send?phone=917997166666&text=Hi,%20I%20need%20help%20with%20my%20AP%20EAPCET%20counselling%20and%20web%20options.";

  return (
    <div className="mentorship-widget-container" style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 1000, fontFamily: "var(--font-sans)" }}>
      
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="widget-toggle-btn"
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)",
          color: "white",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.4), 0 8px 10px -6px rgba(37, 99, 235, 0.4)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isOpen ? "rotate(90deg)" : "none",
          outline: "none"
        }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          className="chat-window-panel"
          style={{
            position: "absolute",
            bottom: "76px",
            right: "0",
            width: "380px",
            height: "580px",
            background: "#0a0e1a",
            borderRadius: "var(--radius-xl)",
            border: "1px solid rgba(99,102,241,0.2)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.1)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          {/* Header */}
          <div
            className="chat-header"
            style={{
              padding: "14px 18px",
              background: "linear-gradient(135deg, #0d1228 0%, #111827 100%)",
              borderBottom: "1px solid rgba(99,102,241,0.2)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ position: "relative", display: "flex" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    zIndex: 2
                  }}
                >
                  <Inku size={28} />
                </div>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: "-12px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                    zIndex: 1
                  }}
                >
                  <Pinku size={28} />
                </div>
                <span
                  style={{
                    position: "absolute",
                    bottom: "-2px",
                    right: "-2px",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: isGroqConfigured() ? "var(--safe)" : "var(--primary)",
                    border: "2px solid #0a0e1a"
                  }}
                />
              </div>
              
              <div>
                <div style={{ fontWeight: "700", fontSize: "0.95rem" }} className="font-poppins">Inku & Pinku</div>
                <div style={{ fontSize: "0.75rem", color: "var(--primary-light)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>{isGroqConfigured() ? "Llama3-8B Live" : "Simulator Mode"}</span>
                </div>
              </div>
            </div>

            {user && (
              <button 
                onClick={clearChat}
                style={{ background: "none", border: "none", color: "var(--primary-light)", cursor: "pointer", fontSize: "0.75rem", padding: "4px 8px", borderRadius: "4px" }}
              >
                Reset
              </button>
            )}
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            
            {/* GUEST AUTHENTICATION BARRIER */}
            {!user ? (
              <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", background: "#050814" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "rgba(99,102,241,0.12)",
                    boxShadow: "0 0 20px rgba(99,102,241,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--primary)",
                    marginBottom: "16px"
                  }}
                >
                  <Lock size={22} />
                </div>

                <h3 className="font-poppins" style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
                  🔒 Unlock AI Counselor
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "20px" }}>
                  Sign in with your phone number to chat with our AI counselor, check closing ranks, and run predictor tools directly.
                </p>

                <button 
                  onClick={() => { setIsOpen(false); onAuthClick(); }}
                  className="btn btn-primary font-poppins"
                  style={{ width: "100%", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  Login / Register <ArrowRight size={16} />
                </button>

                {/* Static Helpline alternatives */}
                <div style={{ marginTop: "24px", borderTop: "1px solid rgba(99,102,241,0.1)", paddingTop: "16px", width: "100%", textAlign: "left" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-tertiary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Direct Helpline Options:</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                    <div>📞 Call Expert: <a href="tel:7997166666" style={{ fontWeight: "700", color: "var(--primary)" }}>7997166666</a></div>
                    <div>💬 WhatsApp: <a href={promoWhatsappLink} target="_blank" rel="noreferrer" style={{ fontWeight: "700", color: "var(--safe)" }}>7997166666</a></div>
                  </div>
                </div>
              </div>
            ) : (
              /* LOGGED IN CHAT INTERFACE */
              <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", background: "#050814" }}>
                
                {/* Chat feed messages list */}
                <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {messages.map((msg, idx) => {
                    const isUser = msg.role === "user";
                    let content = msg.content;
                    let character = "Pinku"; // default
                    
                    if (!isUser) {
                      if (content.startsWith("Inku:")) {
                        character = "Inku";
                        content = content.replace("Inku:", "").trim();
                      } else if (content.startsWith("Pinku:")) {
                        character = "Pinku";
                        content = content.replace("Pinku:", "").trim();
                      } else if (content.startsWith("🤖 **AI Counselor (Simulator Mode)**")) {
                        character = "Inku";
                        content = content.replace("🤖 **AI Counselor (Simulator Mode)**\n\n", "").trim();
                      }
                    }
                    
                    return (
                      <div key={idx} style={{ display: "flex", gap: "8px", flexDirection: isUser ? "row-reverse" : "row", alignItems: "flex-start" }}>
                        {!isUser && (
                          <div style={{ flexShrink: 0, marginTop: "2px" }}>
                            {character === "Inku" ? (
                              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center" }}><Inku size={22} /></div>
                            ) : (
                              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#FCE7F3", display: "flex", alignItems: "center", justifyContent: "center" }}><Pinku size={22} /></div>
                            )}
                          </div>
                        )}
                        <div
                          style={{
                            maxWidth: "80%",
                            background: isUser ? "var(--primary)" : "#111827",
                            color: isUser ? "white" : "#e2e8f0",
                            padding: "10px 14px",
                            borderRadius: isUser ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                            fontSize: "0.85rem",
                            lineHeight: "1.5",
                            whiteSpace: "pre-line",
                            border: isUser ? "none" : "1px solid rgba(99,102,241,0.12)"
                          }}
                        >
                          {content}
                        </div>
                      </div>
                    );
                  })}
                  
                  {isTyping && (
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "flex-start"
                      }}
                    >
                      <div style={{ flexShrink: 0 }}><div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "rgba(96,165,250,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><Inku size={22} /></div></div>
                      <div
                        style={{
                          background: "#111827",
                          border: "1px solid rgba(99,102,241,0.12)",
                          padding: "12px 16px",
                          borderRadius: "16px 16px 16px 2px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                          display: "flex",
                          gap: "4px",
                          alignItems: "center"
                        }}
                      >
                        <span className="dot pulse-dot" style={{ width: "6px", height: "6px", background: "#6366f1", borderRadius: "50%", display: "inline-block" }} />
                        <span className="dot pulse-dot" style={{ width: "6px", height: "6px", background: "#6366f1", borderRadius: "50%", display: "inline-block", animationDelay: "0.2s" }} />
                        <span className="dot pulse-dot" style={{ width: "6px", height: "6px", background: "#6366f1", borderRadius: "50%", display: "inline-block", animationDelay: "0.4s" }} />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggestions row chips */}
                <div 
                  className="chips-row"
                  style={{
                    padding: "8px 12px",
                    display: "flex",
                    gap: "8px",
                    overflowX: "auto",
                    background: "#0a0e1a",
                    borderTop: "1px solid rgba(99,102,241,0.15)",
                    scrollbarWidth: "none"
                  }}
                >
                  <button 
                    onClick={() => handleChipClick("Predict colleges for rank 15000, OC, Boys, AU region")}
                    style={{ flexShrink: 0, padding: "5px 10px", fontSize: "0.73rem", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "20px", color: "#a5b4fc", cursor: "pointer" }}
                  >
                    🔮 Predict 15k
                  </button>
                  <button 
                    onClick={() => handleChipClick("How do I select the best web options?")}
                    style={{ flexShrink: 0, padding: "5px 10px", fontSize: "0.73rem", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "20px", color: "#a5b4fc", cursor: "pointer" }}
                  >
                    📋 Web Options
                  </button>
                  <button 
                    onClick={() => handleChipClick("What are the fees for GVP College?")}
                    style={{ flexShrink: 0, padding: "5px 10px", fontSize: "0.73rem", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "20px", color: "#a5b4fc", cursor: "pointer" }}
                  >
                    💰 Fees
                  </button>
                </div>

                {/* Typing Input footer form */}
                <form 
                  onSubmit={handleSendMessage}
                  style={{
                    padding: "12px 14px",
                    background: "#0a0e1a",
                    borderTop: "1px solid rgba(99,102,241,0.15)",
                    display: "flex",
                    gap: "10px",
                    alignItems: "center"
                  }}
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ask Inku & Pinku anything..."
                    style={{
                      flex: 1,
                      border: "1px solid rgba(99,102,241,0.2)",
                      borderRadius: "24px",
                      padding: "10px 16px",
                      fontSize: "0.85rem",
                      outline: "none",
                      background: "#111827",
                      color: "#e2e8f0"
                    }}
                    disabled={isTyping}
                  />
                  <button
                    type="submit"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "var(--gradient-primary)",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "white",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      opacity: inputText.trim() ? 1 : 0.4,
                      boxShadow: inputText.trim() ? "0 4px 12px rgba(99,102,241,0.4)" : "none",
                      transition: "all 0.2s ease"
                    }}
                    disabled={!inputText.trim() || isTyping}
                  >
                    <Send size={16} />
                  </button>
                </form>

              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
