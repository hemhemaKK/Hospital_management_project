import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [reviews, setReviews] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const defaultReviews = [
    {
      name: "Aarav",
      title: "Quick Care",
      comment: "Booked an appointment in minutes and the doctor was ready on time. Very efficient!",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=1",
    },
    {
      name: "Meera",
      title: "Seamless Experience",
      comment: "The system made it easy to download prescriptions and test reports.",
      rating: 4,
      image: "https://i.pravatar.cc/150?img=2",
    },
    {
      name: "Ravi",
      title: "Great Support",
      comment: "Hospital admin resolved a scheduling conflict quickly. Highly recommend.",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=3",
    },
    {
      name: "Liya",
      title: "User Friendly",
      comment: "Nurses updated vitals in real-time — loved the live dashboard.",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=4",
    },
  ];

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/review");

        if (res.data.reviews && res.data.reviews.length > 0) {
          const mapped = res.data.reviews.map((r) => ({
            name: r.name || "User",
            title: r.title || "Patient Feedback",
            comment: r.comment,
            rating: r.rating,
            image: r.image || "https://i.pravatar.cc/150?img=7",
          }));

          setReviews([...defaultReviews, ...mapped]);
        } else {
          setReviews(defaultReviews);
        }
      } catch {
        setReviews(defaultReviews);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div style={{ width: "100vw", overflowX: "hidden", fontFamily: "Inter, sans-serif" }}>
      <Navbar />

      {/* ---------------------------- HERO SECTION ---------------------------- */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: isMobile ? "2rem 1rem" : "5rem 2rem",
          background: "linear-gradient(135deg,#e0f7fa,#ffffff,#b2ebf2)",
          flexWrap: "wrap",
          flexDirection: isMobile ? "column" : "row", // ✅ stack on mobile
          animation: "fadeIn 1.3s ease",
        }}
      >
        {/* Left Content */}
        <div
          style={{
            flex: 1,
            minWidth: "300px",
            maxWidth: "500px",
            padding: "1rem",
            animation: "slideLeft 1.2s ease",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          <h1
            style={{
              fontSize: isMobile ? "2rem" : "3.5rem",
              fontWeight: "800",
              color: "#004d53",
              lineHeight: "1.2",
            }}
          >
            HOSPITAL <br /> MANAGEMENT <br /> SYSTEM
          </h1>

          <p
            style={{
              color: "#555",
              fontSize: isMobile ? "1rem" : "1.1rem",
              marginTop: "1rem",
              marginBottom: "2rem",
            }}
          >
            A comprehensive solution for efficient hospital operations and improved patient care.
          </p>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: isMobile ? "center" : "flex-start",
              flexWrap: "wrap",
            }}
          >
            <button
              style={{
                padding: "0.9rem 1.8rem",
                background: "linear-gradient(135deg,#00626a,#0097a7)",
                border: "none",
                borderRadius: "10px",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "0.3s",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.08)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            >
              GET STARTED
            </button>

            <button
              style={{
                padding: "0.9rem 1.8rem",
                border: "2px solid #00626a",
                background: "white",
                borderRadius: "10px",
                color: "#00626a",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "0.3s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#e0f2f1";
                e.target.style.transform = "scale(1.07)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "white";
                e.target.style.transform = "scale(1)";
              }}
            >
              CONTACT US
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            animation: "slideRight 1.2s ease",
            marginTop: isMobile ? "1rem" : "0",
            width: "100%",
          }}
        >
          <img
            src="/assets/hero.png"
            style={{
              width: isMobile ? "80%" : "100%",
              maxWidth: "450px",
              height: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0px 8px 20px rgba(0,0,0,0.15))",
            }}
          />
        </div>
      </div>

      {/* ---------------------------- FEATURES SECTION ---------------------------- */}
      <div
        style={{
          padding: "3rem 1rem",
          background: "#ffffff",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: isMobile ? "1.5rem" : "2.2rem",
            color: "#004d53",
            marginBottom: "2rem",
          }}
        >
          Powerful Features for Modern Hospitals
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "2rem",
          }}
        >
          {[
            {
              title: "Patient Management",
              text: "Streamline patient registration, appointments, and records.",
              icon: "👨‍⚕️",
            },
            {
              title: "Billing & Invoicing",
              text: "Automate billing processes and manage invoices seamlessly.",
              icon: "💳",
            },
            {
              title: "Inventory Control",
              text: "Track and manage hospital supplies with ease.",
              icon: "📦",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255, 255, 255, 0.75)",
                backdropFilter: "blur(10px)",
                padding: "2rem",
                width: "300px",
                borderRadius: "15px",
                boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
                transition: "0.4s",
                animation: "fadeInUp 1.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.1)";
              }}
            >
              <div style={{ fontSize: "3rem" }}>{item.icon}</div>
              <h3 style={{ color: "#00626a", marginTop: "1rem" }}>{item.title}</h3>
              <p style={{ color: "#555", marginTop: "0.5rem" }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --------------------------- TESTIMONIALS --------------------------- */}
      <h1
        style={{
          textAlign: "center",
          fontSize: isMobile ? "1.6rem" : "2.2rem",
          marginTop: "50px",
          color: "#00626a",
        }}
      >
        See Features from Our Users
      </h1>

      <div
        style={{
          overflow: "hidden",
          padding: "2rem 0",
          background: "linear-gradient(to right,#e0f7fa,#b2ebf2,#e0f7fa)",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", animation: "scroll 25s linear infinite" }}>
          {reviews.map((t, i) => (
            <div
              key={i}
              style={{
                background: "white",
                padding: "1.2rem",
                borderRadius: "15px",
                margin: "0 1rem",
                minWidth: "260px",
                maxWidth: "260px",
                textAlign: "center",
                boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
                transition: "0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <img
                src={t.image}
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  marginBottom: "0.7rem",
                }}
              />
              <h3 style={{ color: "#00626a" }}>{t.name}</h3>
              <h4 style={{ color: "#555", fontStyle: "italic" }}>{t.title}</h4>
              <div style={{ color: "#FFD700", margin: "0.3rem 0" }}>
                {[...Array(t.rating)].map((_, idx) => (
                  <FaStar key={idx} />
                ))}
              </div>
              <p style={{ color: "#444" }}>{t.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------------------- ANIMATIONS ---------------------------- */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <Footer />
    </div>
  );
}
