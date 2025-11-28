import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";

export default function About() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const creators = [
    { name: "Hemavathi K", role: "Full-Stack Developer", img: "/assets/p1.png" },
    { name: "Noor Jahan", role: "UI/UX Designer", img: "/assets/p2.png" },
    { name: "Sanjay A", role: "Backend Engineer", img: "/assets/p3.png" },
  ];

  return (
    <>
      <Navbar />

      <div style={{ position: "relative", overflow: "hidden" }}>
        {/* Background Video */}
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
            filter: "blur(8px) brightness(0.5)",
            zIndex: -2,
          }}
        >
          <source src="/assets/about.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: -1,
          }}
        />

        {/* Main Content */}
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            padding: isMobile ? "40px 20px" : "60px 40px",
            color: "white",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Intro Section */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            style={{
              textAlign: "center",
              marginBottom: isMobile ? "40px" : "60px",
            }}
          >
            <h1
              style={{
                fontSize: isMobile ? "2rem" : "3rem",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              🌆 About “Making My City Good”
            </h1>
            <p
              style={{
                fontSize: isMobile ? "1rem" : "1.2rem",
                maxWidth: "800px",
                marginInline: "auto",
                lineHeight: "1.6",
              }}
            >
              <b>Making My City Good</b> is a citizen-driven initiative designed to build smarter, cleaner, and more connected cities.  
              Our mission is to give every resident a voice — to report issues, share ideas, and take part in improving urban life.  
              Through technology and community collaboration, we aim to turn every complaint into constructive change 🌱.
            </p>
          </motion.div>

          {/* Core Features Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
              marginBottom: isMobile ? "40px" : "60px",
            }}
          >
            {[
              { title: "📢 Citizen Voice", desc: "Report local issues like waste, road damage, or safety concerns instantly." },
              { title: "🏙️ Smart Governance", desc: "Bridge the gap between citizens and municipal bodies through digital tools." },
              { title: "🤝 Community Action", desc: "Encourage teamwork among residents for cleanup, volunteering, and civic improvement." },
              { title: "🌿 Sustainable Growth", desc: "Promote eco-friendly habits and long-term urban sustainability." },
            ].map((benefit, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                style={{
                  padding: "20px",
                  borderRadius: "15px",
                  background: "rgba(255, 255, 255, 0.95)",
                  boxShadow: "0px 8px 20px rgba(0,0,0,0.2)",
                  textAlign: "center",
                  color: "black",
                }}
              >
                <h2 style={{ fontSize: isMobile ? "1.2rem" : "1.5rem", marginBottom: "10px" }}>{benefit.title}</h2>
                <p style={{ fontSize: isMobile ? "0.9rem" : "1rem", lineHeight: "1.5" }}>{benefit.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Team Section */}
          <h2 style={{ textAlign: "center", fontSize: isMobile ? "2rem" : "2.5rem", marginBottom: "30px" }}>👩‍💻 Meet The Team</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              maxWidth: "1000px",
              margin: "auto",
            }}
          >
            {creators.map((creator, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.08, rotate: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                style={{
                  padding: "20px",
                  borderRadius: "20px",
                  background: "rgba(0,0,0,0.6)",
                  boxShadow: "0px 10px 25px rgba(255, 255, 255, 0.1)",
                  textAlign: "center",
                  color: "white",
                }}
              >
                <img
                  src={creator.img}
                  alt={creator.name}
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginBottom: "15px",
                    border: "3px solid gray",
                  }}
                />
                <h3 style={{ fontSize: isMobile ? "1.2rem" : "1.5rem" }}>{creator.name}</h3>
                <p style={{ fontSize: isMobile ? "0.9rem" : "1rem", opacity: "0.9" }}>{creator.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
