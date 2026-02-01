import { Link } from "react-router-dom";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 mb-2">
            Student Training
          </h2>
          <p className="text-sm font-semibold text-blue-600 mb-4">
            Certification Program
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            A weekend-based learning program designed for MCA / BCA final semester
            students to gain real-world development skills and certification.
          </p>
        </div>

        {/* Programs */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase">
            Program
          </h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>JavaScript Foundations</li>
            <li>React Development</li>
            <li>Python & Java Basics</li>
            <li>Database & Tools</li>
            <li>Final Project & Certificate</li>
          </ul>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase">
            Navigation
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/" className="text-slate-600 hover:text-blue-600 transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/courses" className="text-slate-600 hover:text-blue-600 transition">
                Course Structure
              </Link>
            </li>
            <li>
              <Link to="/projects" className="text-slate-600 hover:text-blue-600 transition">
                Projects
              </Link>
            </li>
            <li>
              <Link to="/certificate" className="text-slate-600 hover:text-blue-600 transition">
                Certification
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-slate-600 hover:text-blue-600 transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase">
            Contact
          </h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>Email: info@yourdomain.com</li>
            <li>Phone / WhatsApp: +91 XXXXX XXXXX</li>
            <li>Weekend Classes (Sat–Sun)</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        © {year} Student Training & Certification Program. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
