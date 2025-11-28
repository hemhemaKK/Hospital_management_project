import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  // Reusable HoverLink (button-like)
  const HoverLink = ({ to, children }) => {
    const [hover, setHover] = useState(false);
    const style = {
      color: "black",
      marginLeft: isMobile ? "0" : "1rem",
      textDecoration: "none",
      fontSize: "16px",
      fontWeight: "bold",
      backgroundColor: "#fbfbfbff",
      padding: "6px 12px",
      borderRadius: "5px",
      boxShadow: hover
        ? "0 12px 2px rgba(0,0,0,0.1)"
        : "0 8px 25px rgba(0,0,0,0.4)",
      transform: hover ? "translateY(-3px)" : "translateY(0)",
      transition: "all 0.3s ease",
      cursor: "pointer",
      display: "inline-block",
      marginBottom: isMobile ? "10px" : "0",
    };
    return (
      <Link
        to={to}
        style={style}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => isMobile && setMenuOpen(false)}
      >
        {children}
      </Link>
    );
  };

  // Simple link (no button style)
  const SimpleLink = ({ to, children }) => {
    const [hover, setHover] = useState(false);
    const style = {
      color: hover ? "#a2a2a2ff" : "white",
      marginLeft: isMobile ? "0" : "2rem",
      textDecoration: hover ? "underline" : "none",
      fontSize: "18px",
      fontWeight: "bold",
      transition: "all 0.3s ease",
      marginBottom: isMobile ? "10px" : "0",
    };
    return (
      <Link
        to={to}
        style={style}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => isMobile && setMenuOpen(false)}
      >
        {children}
      </Link>
    );
  };

  // Mobile menu style
  const mobileMenuStyle = {
    display: isMobile && menuOpen ? "flex" : "none",
    flexDirection: "column",
    position: "absolute",
    top: "70px",
    left: 0,
    width: "100%",
    backgroundColor: "#090909dd",
    padding: "1rem 0",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    zIndex: 1000,
    alignItems: "center",
  };

  return (
    <nav style={navStyle}>
      <Link to="/">
        <img
          src="/assets/logo.png"
          alt="Making My City Good Logo"
          style={{
            height: "60px",
            width: "60px",
            borderRadius: "50%",
            objectFit: "cover",
            transition: "transform 0.3s ease",
          }}
        />
      </Link>

      {/* Desktop & Mobile Links */}
      {isMobile ? (
        <>
          <div onClick={() => setMenuOpen(!menuOpen)} style={hamburgerStyle}>
            {menuOpen ? <FaTimes size={25} /> : <FaBars size={25} />}
          </div>
          <div style={mobileMenuStyle}>
            <SimpleLink to="/">Home</SimpleLink>
            <SimpleLink to="/about">About Us</SimpleLink>
            <HoverLink to="/login">Login</HoverLink>
            <HoverLink to="/register">Sign Up</HoverLink>
          </div>
        </>
      ) : (
        <div style={{ display: "flex", alignItems: "center" }}>
          <SimpleLink to="/">Home</SimpleLink>
          <SimpleLink to="/about">About Us</SimpleLink>
          <HoverLink to="/login">Login</HoverLink>
          <HoverLink to="/register">Sign Up</HoverLink>
        </div>
      )}
    </nav>
  );
}

// Styles
const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.5rem 3rem",
  backgroundColor: "#000000ff",
  position: "relative",
  zIndex: 999,
};

const hamburgerStyle = {
  cursor: "pointer",
  color: "white",
};
