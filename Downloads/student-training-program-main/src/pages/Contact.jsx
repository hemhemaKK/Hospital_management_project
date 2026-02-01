import { Mail, Phone, MapPin, Award, Zap, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedSection from "../components/AnimatedSection";

function Contact() {
  const navigate = useNavigate();
  const [selectedEnrollment, setSelectedEnrollment] = useState(null); // 'mini' or 'major'
  const [selectedTrack, setSelectedTrack] = useState(null); // 'immediate' or 'indepth'

  // Redirect to form page when both selections are made
  useEffect(() => {
    if (selectedEnrollment && selectedTrack) {
      // Small delay for visual feedback before redirect
      const timer = setTimeout(() => {
        navigate("/enrollment-form", {
          state: {
            projectType: selectedEnrollment,
            learningTrack: selectedTrack
          }
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [selectedEnrollment, selectedTrack, navigate]);

  return (
    <div className="bg-slate-50 min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <AnimatedSection animation="slideDown">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-4">
              Choose Your Learning Path
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Select between Mini or Major Projects, then choose your preferred learning track. All programs include certificates!
            </p>
          </div>
        </AnimatedSection>

        {/* Enrollment Type Selection */}
        <AnimatedSection animation="slideUp">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-8">Step 1: Select Project Type</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

              {/* Mini Project Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setSelectedEnrollment('mini');
                  setSelectedTrack(null);
                }}
                className={`cursor-pointer rounded-2xl p-8 shadow-lg transition-all ${selectedEnrollment === 'mini'
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white ring-4 ring-blue-300'
                    : 'bg-white hover:shadow-xl'
                  }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Zap className={selectedEnrollment === 'mini' ? 'text-yellow-300' : 'text-blue-500'} size={32} />
                  <h3 className="text-2xl font-bold">Mini Project</h3>
                </div>
                <p className={`mb-4 ${selectedEnrollment === 'mini' ? 'text-blue-100' : 'text-gray-600'}`}>
                  Perfect for beginners and those looking for quick skill development
                </p>
                <ul className={`space-y-2 text-sm ${selectedEnrollment === 'mini' ? 'text-white' : 'text-gray-700'}`}>
                  <li>✓ 4-6 weeks duration</li>
                  <li>✓ Focused learning modules</li>
                  <li>✓ Practical hands-on projects</li>
                  <li>✓ Certificate of completion</li>
                </ul>
              </motion.div>

              {/* Major Project Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setSelectedEnrollment('major');
                  setSelectedTrack(null);
                }}
                className={`cursor-pointer rounded-2xl p-8 shadow-lg transition-all ${selectedEnrollment === 'major'
                    ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white ring-4 ring-purple-300'
                    : 'bg-white hover:shadow-xl'
                  }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Award className={selectedEnrollment === 'major' ? 'text-yellow-300' : 'text-purple-500'} size={32} />
                  <h3 className="text-2xl font-bold">Major Project</h3>
                </div>
                <p className={`mb-4 ${selectedEnrollment === 'major' ? 'text-purple-100' : 'text-gray-600'}`}>
                  Comprehensive program for career advancement and deep expertise
                </p>
                <ul className={`space-y-2 text-sm ${selectedEnrollment === 'major' ? 'text-white' : 'text-gray-700'}`}>
                  <li>✓ 8-12 weeks duration</li>
                  <li>✓ Advanced concepts & tools</li>
                  <li>✓ Industry-standard projects</li>
                  <li>✓ Professional certificate</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        {/* Learning Track Selection */}
        {selectedEnrollment && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-8">
              Step 2: Choose Your Learning Track
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

              {/* Immediate Project Track */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedTrack('immediate')}
                className={`cursor-pointer rounded-2xl p-8 shadow-lg transition-all ${selectedTrack === 'immediate'
                    ? 'bg-gradient-to-br from-green-500 to-teal-600 text-white ring-4 ring-green-300'
                    : 'bg-white hover:shadow-xl'
                  }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Zap className={selectedTrack === 'immediate' ? 'text-yellow-300' : 'text-green-500'} size={28} />
                  <h3 className="text-xl font-bold">Immediate Project</h3>
                </div>
                <p className={`mb-4 text-sm ${selectedTrack === 'immediate' ? 'text-green-100' : 'text-gray-600'}`}>
                  Start building right away with guided project-based learning
                </p>
                <ul className={`space-y-2 text-sm ${selectedTrack === 'immediate' ? 'text-white' : 'text-gray-700'}`}>
                  <li>✓ Project-first approach</li>
                  <li>✓ Learn by doing</li>
                  <li>✓ Quick results</li>
                  <li>✓ Certificate included</li>
                </ul>
              </motion.div>

              {/* In-depth Learning Track */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedTrack('indepth')}
                className={`cursor-pointer rounded-2xl p-8 shadow-lg transition-all ${selectedTrack === 'indepth'
                    ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white ring-4 ring-orange-300'
                    : 'bg-white hover:shadow-xl'
                  }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className={selectedTrack === 'indepth' ? 'text-yellow-300' : 'text-orange-500'} size={28} />
                  <h3 className="text-xl font-bold">In-depth Learning</h3>
                </div>
                <p className={`mb-4 text-sm ${selectedTrack === 'indepth' ? 'text-orange-100' : 'text-gray-600'}`}>
                  Comprehensive understanding with theory and advanced concepts
                </p>
                <ul className={`space-y-2 text-sm ${selectedTrack === 'indepth' ? 'text-white' : 'text-gray-700'}`}>
                  <li>✓ Detailed curriculum</li>
                  <li>✓ Theory + practice</li>
                  <li>✓ Deep expertise</li>
                  <li>✓ Certificate included</li>
                </ul>
              </motion.div>
            </div>

            {/* Loading indicator when both selected */}
            {selectedEnrollment && selectedTrack && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-8"
              >
                <div className="inline-flex items-center gap-3 bg-indigo-100 text-indigo-700 px-6 py-3 rounded-full">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                  <span className="font-semibold">Redirecting to enrollment form...</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Initial Message when nothing selected */}
        {!selectedEnrollment && (
          <div className="text-center py-12">
            <p className="text-xl text-slate-500">
              👆 Start by selecting your project type above
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Contact;
