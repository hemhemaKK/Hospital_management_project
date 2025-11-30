import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { X, Send } from "lucide-react";

const Chatbot = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [messages, setMessages] = useState([
    { text: "👋 Hi! I’m your support assistant. Need any help?", isBot: true },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatWindowRef = useRef(null);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);

  // 💬 Auto-hide popup after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // 🚪 Close chat when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Auto scroll to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { text: userMessage, isBot: false }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await axios.post("https://hospital-management-project-gf55.onrender.com/api/chatbot", {
        userId,
        message: userMessage,
      });

      const botReply = res.data.reply || "Sorry, I didn't understand that.";
      setMessages((prev) => [...prev, { text: botReply, isBot: true }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { text: "Something went wrong. Please try again.", isBot: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) handleSendMessage(e);
  };

  // Bot typing animation
  const TypingAnimation = () => (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
      <div
        style={{
          display: "flex",
          gap: "4px",
          padding: "8px 14px",
          background: "#f1f1f1",
          borderRadius: "18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      >
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
      <style>
        {`
          .dot {
            width: 6px;
            height: 6px;
            background-color: #555;
            border-radius: 50%;
            animation: bounce 1.4s infinite ease-in-out both;
          }
          .dot:nth-child(1) { animation-delay: -0.32s; }
          .dot:nth-child(2) { animation-delay: -0.16s; }
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );

  // Message renderer
  const renderMessage = (msg, idx) => (
    <div
      key={idx}
      style={{
        display: "flex",
        justifyContent: msg.isBot ? "flex-start" : "flex-end",
        alignItems: "flex-start",
        gap: "6px",
        marginBottom: "6px",
      }}
    >
      {msg.isBot && (
        <img
          src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
          alt="bot"
          style={{ width: "28px", height: "28px" }}
        />
      )}
      <div
        style={{
          maxWidth: "75%",
          padding: "10px 14px",
          borderRadius: "18px",
          backgroundColor: msg.isBot ? "#f1f1f1" : "#4f46e5",
          color: msg.isBot ? "#111" : "#fff",
          fontSize: "14px",
          lineHeight: "1.4",
          whiteSpace: "pre-wrap",
          boxShadow: msg.isBot
            ? "0 1px 4px rgba(0,0,0,0.15)"
            : "0 2px 6px rgba(0,0,0,0.25)",
          animation: "fadeIn 0.3s ease",
        }}
      >
        {msg.text}
      </div>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );

  return (
    <>
      {/* Floating robot button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "65px",
          height: "65px",
          borderRadius: "50%",
          backgroundColor: "#4f46e5",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          zIndex: 1000,
        }}
      >
        {!isOpen ? (
          <img
            src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
            alt="chatbot"
            style={{
              width: "35px",
              height: "35px",
              animation: "wave 1.5s infinite ease-in-out",
            }}
          />
        ) : (
          <X size={26} color="#fff" />
        )}
        <style>
          {`
            @keyframes wave {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(10deg); }
            }
          `}
        </style>
      </button>

      {/* 💬 Greeting Popup */}
      {showPopup && !isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "95px",
            right: "30px",
            backgroundColor: "#fff",
            color: "#111",
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "10px 14px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            fontSize: "14px",
            animation: "fadeInOut 5s ease-in-out",
            zIndex: 1000,
          }}
        >
          💬 Hi there! Need help? Let’s chat!
        </div>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "370px",
            height: "520px",
            backgroundColor: "#fff",
            borderRadius: "18px",
            boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1000,
            fontFamily: "Inter, sans-serif",
            animation: "slideUp 0.4s ease",
          }}
        >
          <style>
            {`
              @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}
          </style>

          {/* Header */}
          <div
            style={{
              backgroundColor: "#4f46e5",
              color: "#fff",
              padding: "12px 16px",
              fontWeight: "bold",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>🤖 Support Chat</span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: "12px 16px",
              overflowY: "auto",
              backgroundColor: "#f9f9f9",
            }}
          >
            {messages.map(renderMessage)}
            {isLoading && <TypingAnimation />}
            <div ref={messageEndRef}></div>
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            style={{
              display: "flex",
              borderTop: "1px solid #ddd",
              padding: "10px 12px",
              gap: "8px",
              backgroundColor: "#fff",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type your message..."
              style={{
                flex: 1,
                borderRadius: "12px",
                padding: "8px 12px",
                border: "1px solid #ccc",
                resize: "none",
                outline: "none",
                fontSize: "14px",
                color: "#111",
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                backgroundColor: "#4f46e5",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "0 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
