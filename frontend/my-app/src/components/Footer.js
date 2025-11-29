import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  const footerContainer = {
    display: "flex",
    justifyContent: isMobile ? "center" : "space-between",
    flexWrap: "wrap",
    gap: isMobile ? "15px" : "20px",
    flexDirection: isMobile ? "column" : "row",
    alignItems: "stretch",
    width: "100%",
  };

  const footerColumn = {
    flex: "1",
    minWidth: isMobile ? "90%" : "220px",
    background: "#b2ebf2", // UPDATED: light cyan background
    padding: isMobile ? "15px" : "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: isMobile ? "center" : "left",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "#004d52", // dark teal text
  };

  const socialContainer = {
    display: "flex",
    gap: "12px",
    marginTop: "0.8rem",
    justifyContent: isMobile ? "center" : "flex-start",
  };

  return (
    <footer style={footerStyle}>
      <div style={footerContainer}>
        {/* Contact Us */}
        <div style={footerColumn}>
          <div>
            <h4 style={footerHeading}>Contact Us</h4>
            <p>Email: support@makemycity.com</p>
            <p>Phone: +91 9876543210</p>
          </div>
        </div>

        {/* Help */}
        <div style={footerColumn}>
          <div>
            <h4 style={footerHeading}>Help</h4>
            <Link to="/faq" style={footerLink}>FAQ</Link>
            <Link to="/support" style={footerLink}>Support</Link>
            <Link to="/terms" style={footerLink}>Terms & Conditions</Link>
          </div>
        </div>

        {/* Map / Location */}
        <div style={footerColumn}>
          <div>
            <h4 style={footerHeading}>Our Location</h4>
            <iframe
              title="Bangalore Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0659510137587!2d77.594562!3d12.9715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670a9e8a523%3A0xbaa60c6fbbbe06d!2sBangalore%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1698200000000!5m2!1sen!2sin"
              style={{
                border: 0,
                width: "100%",
                height: "120px",
                borderRadius: "10px",
                boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        {/* Social Media */}
        <div style={footerColumn}>
          <div>
            <h4 style={footerHeading}>Follow Us</h4>
            <div style={socialContainer}>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" style={socialIcon}>
                <FaFacebookF />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" style={socialIcon}>
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" style={socialIcon}>
                <FaInstagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={socialIcon}>
                <FaLinkedinIn />
              </a>
            </div>
          </div>
        </div>
      </div>

      <p style={footerCopy}>
        &copy; {new Date().getFullYear()} <strong>Make My City</strong>. All Rights Reserved.
      </p>
    </footer>
  );
}

// Base Styles
const footerStyle = {
  backgroundColor: "#00838f", // dark teal background
  color: "rgba(0, 77, 82, 1)",
  padding: "2rem 1.5rem",
  marginTop: "3rem",
  boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
};

const footerHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  marginBottom: "0.8rem",
  color: "#004d52",
};

const footerLink = {
  display: "block",
  color: "#004d52",
  textDecoration: "none",
  marginBottom: "0.5rem",
  transition: "color 0.3s",
};

const socialIcon = {
  color: "#004d52",
  fontSize: "22px",
  transition: "transform 0.3s, color 0.3s",
  textDecoration: "none",
};

const footerCopy = {
  fontWeight: "bold",
  textAlign: "center",
  marginTop: "1.5rem",
  fontSize: "14px",
  color: "#b2ebf2",
};
