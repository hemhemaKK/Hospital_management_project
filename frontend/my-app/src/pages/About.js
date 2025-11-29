import React, { useState, useEffect } from "react";
import Footer from "../components/Footer"; // default export
import Navbar from "../components/Navbar"; // default export
import { motion } from "framer-motion";

export default function About() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const team = [
    { name: "Dr. Hemavathi K", role: "Chief Medical Officer", img: "/assets/p1.png" },
    { name: "Noor Jahan", role: "Hospital Admin", img: "/assets/p2.png" },
    { name: "Sanjay A", role: "IT & Backend Lead", img: "/assets/p3.png" },
  ];

  const features = [
    { title: "🩺 Patient Management", desc: "Streamline patient registration, appointments, and medical records efficiently." },
    { title: "💳 Billing & Invoicing", desc: "Automate billing processes and manage invoices seamlessly." },
    { title: "📦 Inventory Control", desc: "Track and manage hospital supplies and medicines in real-time." },
    { title: "📊 Analytics & Reports", desc: "Generate reports to monitor hospital performance and patient care." },
  ];

  return (
    <>
      <Navbar />

      <div
        style={{
          fontFamily: "Arial, sans-serif",
          padding: isMobile ? "40px 20px" : "60px 40px",
          background: "#f9f9f9",
          color: "#333",
        }}
      >
        {/* Intro Section */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{ textAlign: "center", marginBottom: isMobile ? "40px" : "60px" }}
        >
          <h1
            style={{
              fontSize: isMobile ? "2rem" : "3rem",
              fontWeight: "bold",
              marginBottom: "20px",
              color: "#004d53",
            }}
          >
            🏥 About Our Hospital Management System
          </h1>
          <p
            style={{
              fontSize: isMobile ? "1rem" : "1.2rem",
              maxWidth: "800px",
              marginInline: "auto",
              lineHeight: "1.6",
              color: "#555",
            }}
          >
            Our <b>Hospital Management System</b> is designed to streamline hospital operations and improve patient care.  
            From patient registration and appointments to billing, inventory, and analytics, our system provides an efficient, user-friendly platform for medical staff and administrators.  
            Empower your hospital to deliver faster, smarter, and safer healthcare.
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
          {features.map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              style={{
                padding: "20px",
                borderRadius: "15px",
                background: "white",
                boxShadow: "0px 8px 20px rgba(0,0,0,0.1)",
                textAlign: "center",
                color: "#333",
              }}
            >
              <h2 style={{ fontSize: isMobile ? "1.2rem" : "1.5rem", marginBottom: "10px", color: "#00626a" }}>
                {feature.title}
              </h2>
              <p style={{ fontSize: isMobile ? "0.9rem" : "1rem", lineHeight: "1.5" }}>{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Team Section */}
        <h2 style={{ textAlign: "center", fontSize: isMobile ? "2rem" : "2.5rem", marginBottom: "30px", color: "#004d53" }}>
          👨‍⚕️ Meet The Team
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            maxWidth: "1000px",
            margin: "auto",
          }}
        >
          {team.map((member, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.08, rotate: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              style={{
                padding: "20px",
                borderRadius: "20px",
                background: "white",
                boxShadow: "0px 10px 25px rgba(0,0,0,0.1)",
                textAlign: "center",
                color: "#333",
              }}
            >
              <img
                src={member.img}
                alt={member.name}
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: "15px",
                  border: "3px solid #00626a",
                }}
              />
              <h3 style={{ fontSize: isMobile ? "1.2rem" : "1.5rem" }}>{member.name}</h3>
              <p style={{ fontSize: isMobile ? "0.9rem" : "1rem", opacity: "0.9" }}>{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
