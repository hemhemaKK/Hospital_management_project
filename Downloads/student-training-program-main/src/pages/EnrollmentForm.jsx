import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin, CheckCircle, ArrowLeft } from "lucide-react";
import AnimatedSection from "../components/AnimatedSection";

/* ================= CONTACT INFO ================= */

const contactInfo = [
  {
    icon: <Mail className="text-blue-500" size={24} />,
    title: "Email Address",
    details: "contact@skillforge.com",
    link: "mailto:contact@skillforge.com",
  },
  {
    icon: <Phone className="text-green-500" size={24} />,
    title: "Phone / WhatsApp",
    details: "+91 98765 43210",
    link: "https://wa.me/919876543210",
  },
  {
    icon: <MapPin className="text-purple-500" size={24} />,
    title: "Training Location",
    details: "Online Sessions Only",
    link: "#",
  },
];

/* ================= PRICING MATRIX ================= */

const pricingMatrix = {
  mini: {
    name: "Mini Project",
    color: "from-blue-500 to-indigo-600",
    immediate: {
      duration: "4–6 Weeks (12 Days)",
      approach: "Project-first, fast execution",
      price: "₹3,999",
    },
    indepth: {
      duration: "8–12 Weeks (24 Days)",
      approach: "Concept-first, in-depth learning",
      price: "₹4,999",
    },
  },
  major: {
    name: "Major Project",
    color: "from-purple-500 to-pink-600",
    immediate: {
      duration: "4–6 Weeks (12 Days)",
      approach: "Fast-track industry project",
      price: "₹8,999",
    },
    indepth: {
      duration: "8–12 Weeks (24 Days)",
      approach: "Complete industry-level training",
      price: "₹12,999",
    },
  },
};

/* ================= COMPONENT ================= */

function EnrollmentForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectType, learningTrack } = location.state || {};

  /* ✅ Redirect SAFELY using useEffect */
  useEffect(() => {
    if (!projectType || !learningTrack) {
      navigate("/contact", { replace: true });
    }
  }, [projectType, learningTrack, navigate]);

  if (!projectType || !learningTrack) return null;

  const selectedProject = pricingMatrix[projectType];
  const selectedTrack = selectedProject[learningTrack];

  return (
    <div className="bg-slate-50 min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Back Button */}
        <button
          onClick={() => navigate("/contact")}
          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Change Selection</span>
        </button>

        {/* Header */}
        <AnimatedSection animation="slideDown">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Complete Your Enrollment
            </h1>
            <p className="text-lg text-slate-600">
              You're one step away from starting your learning journey!
            </p>
          </div>
        </AnimatedSection>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-1">
            <AnimatedSection animation="slideLeft">
              <div className="space-y-6 sticky top-24">

                {/* SELECTION SUMMARY CARD */}
                <div
                  className={`bg-gradient-to-br ${selectedProject.color} text-white rounded-2xl p-6 shadow-xl`}
                >
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <CheckCircle size={24} />
                    Your Selection
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm opacity-90">Project Type</p>
                      <p className="text-lg font-bold">
                        {selectedProject.name}
                      </p>
                    </div>

                    <div className="border-t border-white/30 pt-3">
                      <p className="text-sm opacity-90">Learning Track</p>
                      <p className="text-lg font-bold capitalize">
                        {learningTrack}
                      </p>
                      <p className="text-sm opacity-75">
                        {selectedTrack.approach}
                      </p>
                    </div>

                    <div className="border-t border-white/30 pt-3">
                      <p className="text-sm opacity-90">Duration</p>
                      <p className="font-semibold">
                        {selectedTrack.duration}
                      </p>
                    </div>

                    <div className="border-t border-white/30 pt-3">
                      <p className="text-sm opacity-90">Price</p>
                      <p className="text-2xl font-extrabold">
                        {selectedTrack.price}
                      </p>
                    </div>

                    <div className="border-t border-white/30 pt-3">
                      <p className="text-sm font-semibold">
                        ✓ Certificate Included
                      </p>
                    </div>
                  </div>
                </div>

                {/* CONTACT INFO */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="font-bold text-slate-800 mb-4">
                    Need Help?
                  </h3>
                  <div className="space-y-3">
                    {contactInfo.map((info, idx) => (
                      <a
                        key={idx}
                        href={info.link}
                        target={info.link.includes("http") ? "_blank" : "_self"}
                        rel={info.link.includes("http") ? "noopener noreferrer" : ""}
                        className="flex items-center gap-3 text-sm hover:text-indigo-600 transition-colors"
                      >
                        {info.icon}
                        <div>
                          <p className="font-semibold">{info.title}</p>
                          <p className="text-xs text-slate-500">
                            {info.details}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

              </div>
            </AnimatedSection>
          </div>

          {/* RIGHT SECTION – GOOGLE FORM */}
          <div className="lg:col-span-2">
            <AnimatedSection animation="slideRight">
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">

                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Enrollment Form
                  </h2>
                  <p className="text-slate-600 text-sm">
                    Please fill out all required fields. We'll contact you within 24 hours.
                  </p>
                </div>

                {/* NOTE */}
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your selection (
                    {selectedProject.name} – {learningTrack}) and price (
                    {selectedTrack.price}) will be automatically included.
                  </p>
                </div>

                {/* GOOGLE FORM */}
                <div className="w-full overflow-hidden rounded-xl border-2 border-slate-200">
                  <iframe
                    src="https://docs.google.com/forms/d/e/1FAIpQLSfcHYdCTz7KWI7GwiP3Xd9pInNJY6MH5G0LtlYLPyICShFaug/viewform?usp=publish-editor"
                    className="w-full h-[1000px] md:h-[1200px]"
                    frameBorder="0"
                    marginHeight="0"
                    marginWidth="0"
                  >
                    Loading enrollment form…
                  </iframe>
                </div>

                <p className="text-xs text-slate-500 mt-4 text-center">
                  We respect your privacy. Your information will only be used for enrollment purposes.
                </p>

              </div>
            </AnimatedSection>
          </div>

        </div>
      </div>
    </div>
  );
}

export default EnrollmentForm;
