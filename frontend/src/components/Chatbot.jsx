import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import "../styles/Chatbot.css";

const API_BASE = "";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! 🌿 I am your Herbal AI Assistant. Ask me anything about medicinal plants!",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const navigate = useNavigate();

  /* 🔥 Close on ESC key */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const addMsg = (role, text) =>
    setMessages((m) => [...m, { role, text }]);

  const parseAndExecute = async (text) => {
    const raw = text.trim();
    if (!raw) return;

    addMsg("user", raw);
    setBusy(true);

    const lower = raw.toLowerCase();

    try {
      if (lower.startsWith("open ") || lower.startsWith("go to ")) {
        const route = raw.replace(/^(open|go to)\s+/i, "").trim();
        navigate(route.startsWith("/") ? route : `/${route}`);
        addMsg("assistant", `Opening ${route}`);
        setBusy(false);
        return;
      }

      const response = await axios.post(`${API_BASE}/api/chat`, {
        message: raw,
      });

      const aiReply =
        response.data?.reply || "Sorry, I couldn't understand.";

      addMsg("assistant", aiReply);
      setBusy(false);
    } catch (err) {
      console.error(err);
      addMsg("assistant", "⚠️ AI service is unavailable right now.");
      setBusy(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    parseAndExecute(input);
    setInput("");
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            background: "#22c55e",
            color: "#fff",
            border: "none",
            borderRadius: "999px",
            width: 65,
            height: 65,
            boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
            cursor: "pointer",
            fontSize: 22,
            zIndex: 1000,
          }}
        >
          💬
        </button>
      )}

      {/* Overlay + Chat Panel */}
      {open && (
        <>
          {/* 🔥 Overlay (click outside to close) */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.3)",
              zIndex: 1500,
            }}
          />

          {/* Chat Panel */}
          <div
            style={{
              position: "fixed",
              right: 0,
              top: 0,
              width: "50vw",
              height: "100vh",
              background: "#ffffff",
              boxShadow: "-10px 0 30px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              zIndex: 2000,
              animation: "slideIn 0.3s ease forwards",
            }}
            onClick={(e) => e.stopPropagation()} // prevent overlay close
          >
            {/* Header */}
            <div
              style={{
                background: "#22c55e",
                color: "#fff",
                padding: "16px 20px",
                fontWeight: 600,
                fontSize: 18,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              🌿 Herbal AI Assistant

              {/* 🔥 Close Button */}
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  fontSize: 24,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {/* Messages */}
            <div
              ref={listRef}
              style={{
                flex: 1,
                padding: 24,
                overflowY: "auto",
                background: "#f9fafb",
              }}
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 20,
                    textAlign: m.role === "user" ? "right" : "left",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "14px 18px",
                      borderRadius: 16,
                      background:
                        m.role === "user" ? "#dcfce7" : "#ffffff",
                      border:
                        m.role === "assistant"
                          ? "1px solid #e5e7eb"
                          : "none",
                      maxWidth: "80%",
                      fontSize: 15,
                      lineHeight: 1.7,
                      textAlign: "left",
                    }}
                  >
                    {m.role === "assistant" ? (
                      <ReactMarkdown
                        components={{
                          h2: (props) => (
                            <h2 style={{ marginTop: 18 }} {...props} />
                          ),
                          li: (props) => (
                            <li style={{ marginBottom: 10 }} {...props} />
                          ),
                          p: (props) => (
                            <p style={{ marginBottom: 14 }} {...props} />
                          ),
                        }}
                      >
                        {m.text}
                      </ReactMarkdown>
                    ) : (
                      m.text
                    )}
                  </div>
                </div>
              ))}

              {busy && (
                <div style={{ fontSize: 14, color: "#888" }}>
                  🌿 AI is thinking...
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={onSubmit}
              style={{
                display: "flex",
                padding: 16,
                borderTop: "1px solid #eee",
                background: "#fff",
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about any medicinal plant..."
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: "1px solid #ddd",
                  fontSize: 15,
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || busy}
                style={{
                  marginLeft: 10,
                  background: "#22c55e",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 18px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Send
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
}