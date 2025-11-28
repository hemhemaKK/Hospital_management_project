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

  // defaultReviews and fetch logic stays the same
  const defaultReviews = [
    {
      name: "Aarav",
      title: "Clean Streets Initiative",
      comment: "I reported garbage near my area and it was cleared in 2 days. Great platform!",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=1",
    },
    {
      name: "Meera",
      title: "Quick Response",
      comment: "The municipality acted fast after I raised a streetlight complaint!",
      rating: 4,
      image: "https://i.pravatar.cc/150?img=2",
    },
    {
      name: "Ravi",
      title: "Transparent System",
      comment: "Loved being able to track complaint status and see updates in real time.",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=3",
    },
    {
      name: "Liya",
      title: "Very Helpful App",
      comment: "Easy to report civic issues without visiting the office.",
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
            title: r.title || "Citizen Feedback",
            comment: r.comment,
            rating: r.rating,
            image: r.image || "https://i.pravatar.cc/150?img=7",
          }));
          setReviews([...defaultReviews, ...mapped]);
        } else {
          setReviews(defaultReviews);
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setReviews(defaultReviews);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div style={{ width: "100vw", overflowX: "hidden", fontFamily: "Arial, sans-serif" }}>
      <Navbar />

      {/* Video Background */}
      <div style={{ position: "relative", height: isMobile ? "50vh" : "75vh", overflow: "hidden" }}>
        <video
          autoPlay
          loop
          muted
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1,
          }}
        >
          <source src="/assets/home.mp4" type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>

        {/* Hero Section */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "white",
            width: isMobile ? "90%" : "60%",
            maxWidth: isMobile ? "95%" : "700px",
            padding: isMobile ? "1rem" : "2rem",
            borderRadius: "20px",
            backgroundColor: "rgba(0,0,0,0.6)",
            boxShadow: "0 8px 25px rgba(255, 255, 255, 0.5)",
          }}
        >
          <h1 style={{ fontSize: isMobile ? "1.8rem" : "3rem", marginBottom: "1rem" }}>
            Welcome to Improve My City
          </h1>
          <p style={{ fontSize: isMobile ? "1rem" : "1.3rem", maxWidth: "600px", margin: "0 auto" }}>
            Empower citizens to report civic issues like potholes, garbage, or streetlight failures — and track them until resolved.
          </p>
        </div>
      </div>

      {/* Rest of the page remains the same */}
      
      {/* Services */}
      <h1
        style={{
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "-10px",
          marginTop: "40px",
          padding: "20px",
        }}
      >
        What You Can Do
      </h1>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          padding: "2rem",
          backgroundColor: "#d3d3d3",
        }}
      >
        {[
          "Report Civic Issues",
          "Track Complaint Progress",
          "View Resolved Problems",
          "Connect with Local Authorities",
        ].map((title, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "white",
              borderRadius: "15px",
              padding: "2rem",
              margin: "1rem",
              minWidth: "250px",
              flex: "1 1 250px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-10px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <h3 style={{ marginBottom: "1rem", color: "#333" }}>{title}</h3>
            <p style={{ color: "#555" }}>
              Helping citizens and authorities connect to make cities cleaner, safer, and more efficient.
            </p>
          </div>
        ))}
      </div>

      {/* Image Gallery + Benefits */}
<div
  style={{
    display: "flex",
    flexWrap: "wrap",
    alignItems: "stretch",
    justifyContent: "center",
    padding: "3rem 2rem",
    gap: "2rem",
    backgroundColor: "#f9fafb",
  }}
>
  {/* Left: Gallery Section */}
  <div
    className="gallery-section"
    style={{
      flex: "2",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "20px",
      width: "100%",
    }}
  >
    {[
      "/assets/1.png",
      "/assets/2.png",
      "/assets/3.png",
      "/assets/5.png",
      "/assets/4.png",
    ].map((src, i) => (
      <div
        key={i}
        style={{
          overflow: "hidden",
          borderRadius: "12px",
          height: "220px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          background: "#fff",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.1)";
        }}
      >
        <img
          src={src}
          alt={`Gallery ${i + 1}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        />
      </div>
    ))}
  </div>
  {/* Right: Benefits */}
 <div
  className="benefits-section"
  style={{
    flex: "1",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "2rem",
    gap: "1rem",
    background: "#e5e4e4",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  }}
>
  <h2
    style={{
      fontWeight: "bold",
      fontSize: "1.8rem",
      textAlign: "center",
      color: "#333",
    }}
  >
    Why Use <span style={{ color: "#FB6F92" }}>Improve My City?</span>
  </h2>

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      fontSize: "1.05rem",
      color: "#444",
      lineHeight: "1.6",
    }}
  >
    <p>📍 Report problems directly with photos and location.</p>
    <p>🔔 Receive updates when authorities take action.</p>
    <p>👀 See resolved issues near your neighborhood.</p>
    <p>🤝 Build a cleaner, better, more transparent community.</p>
    <p>🌟 Trusted by thousands of responsible citizens!</p>
  </div>

  {/* Responsive styles */}
  <style>
    {`
      @media (max-width: 768px) {
        .benefits-section {
          padding: 1.5rem;
          text-align: center;
        }
        .benefits-section h2 {
          font-size: 1.5rem;
        }
        .benefits-section p {
          font-size: 0.95rem;
        }
      }

      @media (max-width: 480px) {
        .benefits-section {
          padding: 1rem;
          border-radius: 8px;
        }
        .benefits-section h2 {
          font-size: 1.3rem;
        }
        .benefits-section p {
          font-size: 0.9rem;
          line-height: 1.5;
        }
      }
    `}
  </style>
</div>


  {/* Responsive Style */}
  <style>
    {`
      @media (max-width: 900px) {
        .gallery-section {
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        }
      }

      @media (max-width: 768px) {
        .gallery-section, .benefits-section {
          flex: 1 1 100%;
        }
        .benefits-section {
          order: 2;
          margin-top: 1rem;
        }
      }

      @media (max-width: 480px) {
        .gallery-section {
          grid-template-columns: repeat(1, 1fr);
        }
      }
    `}
  </style>
</div>


      {/* Testimonials */}
      <h1 style={{ textAlign: "center", fontWeight: "bold", marginTop: "60px", marginBottom: "20px" }}>
        Citizens’ Voices
      </h1>
      <div style={{ overflow: "hidden", padding: "2rem 0", backgroundColor: "#b6b6b6" }}>
        <div style={{ display: "flex", animation: "scrollCards 30s linear infinite" }}>
          {reviews.map((t, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "white",
                borderRadius: "15px",
                padding: "1rem",
                margin: "0 1rem",
                minWidth: "250px",
                maxWidth: "250px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                textAlign: "center",
              }}
            >
              <img
                src={t.image}
                alt={t.name}
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: "0.5rem",
                }}
              />
              <h3 style={{ margin: "0.5rem 0" }}>{t.name}</h3>
              <h4 style={{ margin: "0.3rem 0", fontStyle: "italic", color: "#555" }}>{t.title}</h4>
              <div style={{ color: "#FFD700", marginBottom: "0.5rem" }}>
                {[...Array(t.rating)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <p style={{ fontSize: "0.9rem", color: "#555" }}>{t.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Animation Style */}
      <style>
        {`
          @keyframes scrollCards {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>

      <Footer />
    </div>
  );
}

  