import { Link } from "react-router-dom";
import AnimatedSection from "../components/AnimatedSection";
import InteractiveFAQ from "../components/InteractiveFAQ";
import { motion } from "framer-motion";

const highlights = [
  {
    title: "Weekend Classes",
    description: "Flexible weekend sessions for All type of students to learn without disturbing college.",
    icon: "🕒",
    color: "from-blue-400 to-indigo-400",
  },
  {
    title: "Full Stack Development",
    description: "Learn JavaScript, React, Python, Java, Node.js, Express and Machine Learning while building hands-on experience end-to-end projects.",
    icon: "💻",
    color: "from-green-400 to-teal-500",
  },
  {
    title: "Database & Tools",
    description: "Get practical experience with Postman, swagger, SQL/NoSQL, Git/GitHUb, VS Code, and version control best practices.",
    icon: "🗄️",
    color: "from-yellow-400 to-orange-400",
  },
  {
    title: "Certificate Program",
    description: "Earn a professional certificate recognized by Neo9 organization under Government for your skills.",
    icon: "🎓",
    color: "from-purple-400 to-pink-400",
  },
  {
    title: "Career Guidance",
    description: "Mentorship, Interview tips, and resume, protofolio building guidance to boost your learning journey.",
    icon: "📈",
    color: "from-rose-400 to-red-400",
  },
];

const timeline = [
  {
    title: "Week 1–2: Programming Foundations",
    description: "Understand how programs work, basic logic building, variables, data types, conditionals, loops, input/output, and debugging fundamentals."
  },
  {
    title: "Week 3–4: Core Programming Concepts",
    description: "Learn functions, parameters, return values, variable scope, arrays/lists, string handling, modular code, and basic problem-solving patterns."
  },
  {
    title: "Week 5–6: Data Structures & OOP Concepts",
    description: "Work with common data structures, object-oriented principles (classes, objects, inheritance, polymorphism), error handling, and reusable code design."
  },
  {
    title: "Week 7: Databases, Tools & Best Practices",
    description: "Understand databases and CRUD operations, SQL fundamentals, version control with Git, IDE usage, clean code practices, and basic software architecture."
  },
  {
    title: "Week 8: Final Project & Certification",
    description: "Design and build a real-world project using learned concepts, apply clean architecture, test and debug code, and complete final evaluation."
  }
];

const testimonials = [
  { name: "Amit Sharma", role: "BCA Student", feedback: "The program covered JS, React, Python & Java. Very practical and useful for projects!" },
  { name: "Neha Singh", role: "MCA Student", feedback: "Weekend classes and all-round coverage of technologies made learning so easy." },
  { name: "Rohit Kumar", role: "Bsc Student", feedback: "Projects and certification gave me confidence for hands-on skills." },
];

const faqs = [
  { question: "Who can join this program?", answer: "Students from any Branch can join and who wants to build live projets can join." },
  { question: "Do I need prior experience in all languages?", answer: "No. We start with basics foundation, and we will guide you to build projects step by step." },
  { question: "Will I get a certificate?", answer: "Yes! You get a professional certificate after completing the program and projects." },
];

function Home() {
  return (
    <div className="bg-[#FFFDF5] font-sans">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400 text-white py-28 shadow-lg overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
          >
            Student <span className="text-yellow-300">Training & Certification</span> Program
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl mb-10 max-w-3xl mx-auto"
          >
            Join our 2-month weekend program for final semester MCA/BCA students. Build hands-on projects and earn a professional certificate.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              to="/contact"
              className="inline-block px-10 py-4 bg-yellow-400 text-gray-900 font-bold rounded-xl shadow-lg hover:bg-yellow-300 hover:scale-105 transform transition duration-300"
            >
              Enroll Now
            </Link>
          </motion.div>
        </div>
        {/* Floating circles decoration */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </section>

      {/* Highlights Section */}
      <AnimatedSection animation="slideUp">
        <section className="py-20 bg-gradient-to-b from-[#FFFDF5] to-[#FFF9E6]">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Program Highlights</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {highlights.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer"
                >
                  <div className={`h-2 bg-gradient-to-r ${item.color}`}></div>
                  <div className="p-6 flex flex-col items-center text-center">
                    <motion.div
                      className="text-5xl mb-4"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {item.icon}
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Timeline Section */}
      <AnimatedSection animation="fade">
        <section className="py-20 bg-[#FFFDF5]">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">8-Week Learning Journey</h2>
            <div className="relative">
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-indigo-400 to-purple-400"></div>
              {timeline.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className={`flex flex-col md:flex-row items-center mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className="md:w-1/2 mb-4 md:mb-0 md:px-8">
                    <div className="bg-white rounded-2xl shadow-xl p-6 transition transform hover:-translate-y-2 hover:shadow-2xl">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{t.title}</h3>
                      <p className="text-gray-600">{t.description}</p>
                    </div>
                  </div>
                  <motion.div
                    className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white font-bold text-lg z-10 transition transform hover:scale-110"
                    whileHover={{ scale: 1.2 }}
                  >
                    {i + 1}
                  </motion.div>
                  <div className="md:w-1/2 md:px-8"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Testimonials Section */}
      <AnimatedSection animation="slideUp">
        <section className="py-20 bg-[#FFF9E6]">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 text-center mb-12">
              What Our Students Say
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative group"
                >
                  {/* Glow Background */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-300"></div>

                  {/* Testimonial Card */}
                  <div className="relative bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition duration-300 flex flex-col items-center text-center">

                    {/* AI Avatar */}
                    <img
                      src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${t.name}`}
                      alt={t.name}
                      className="w-24 h-24 rounded-full mb-4 border-4 border-white shadow-md"
                    />

                    {/* Quote */}
                    <div className="text-5xl text-gray-300 mb-4">"</div>

                    {/* Feedback */}
                    <p className="text-gray-700 mb-6 italic">{t.feedback}</p>

                    {/* Name and Role */}
                    <h3 className="text-gray-800 font-bold">{t.name}</h3>
                    <p className="text-gray-500 text-sm">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* FAQ Section */}
      <AnimatedSection animation="slideUp">
        <section className="py-20 bg-[#FFFDF5]">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">Frequently Asked Questions</h2>
            <InteractiveFAQ faqs={faqs} />
          </div>
        </section>
      </AnimatedSection>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400 text-white text-center">
        <div className="max-w-5xl mx-auto px-6">
          <AnimatedSection animation="scale">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Begin Your Learning Journey?</h2>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Join our weekend program and enhance your skills with JS, React, Python, and Java.
            </p>
            <Link
              to="/contact"
              className="inline-block px-10 py-5 bg-yellow-400 text-gray-900 font-bold rounded-xl shadow-lg hover:bg-yellow-300 hover:scale-105 transform transition duration-300"
            >
              Enroll Now
            </Link>
          </AnimatedSection>
        </div>
      </section>

    </div>
  );
}

export default Home;
