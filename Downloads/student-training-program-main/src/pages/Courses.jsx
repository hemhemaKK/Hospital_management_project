import { useState } from "react";
import { Link } from "react-router-dom";

/* ================= MODULES (UNCHANGED) ================= */

const modules = [
  {
    icon: "📘",
    title: "Module 1: Programming Fundamentals",
    points: [
      "Introduction to programming",
      "Variables & data types",
      "Conditions & loops",
      "Functions & arrays",
      "Basic problem solving",
    ],
  },
  {
    icon: "📗",
    title: "Module 2: Core Concepts & OOPS",
    points: [
      "Class & object",
      "Constructor",
      "Inheritance",
      "Polymorphism",
      "Encapsulation",
      "Error handling & debugging",
    ],
  },
  {
    icon: "🛠",
    title: "Module 3: Tools & Development Workflow",
    points: [
      "VS Code setup",
      "Git & GitHub",
      "Project folder structure",
      "API basics",
      "Database fundamentals",
    ],
  },
  {
    icon: "💻",
    title: "Module 4: Project Development",
    points: [
      "Project idea & planning",
      "CRUD operations",
      "Backend & database connection",
      "GitHub project hosting",
      "Testing & debugging",
    ],
  },
  {
    icon: "🎯",
    title: "Module 5: Interview Preparation",
    points: [
      "How to explain project",
      "Common interview questions",
      "Resume project section",
      "Career guidance",
    ],
  },
];

/* ================= DAY PLAN GENERATORS ================= */

// 12-Day Immediate Track
const generateImmediateDays = () => [
  { day: "Day 1", topics: ["Project overview", "Finalize project idea"] },
  { day: "Day 2", topics: ["Requirement analysis", "Module breakdown"] },
  { day: "Day 3", topics: ["Programming basics for project"] },
  { day: "Day 4", topics: ["Functions & reusable logic"] },
  { day: "Day 5", topics: ["OOP concepts in project"] },
  { day: "Day 6", topics: ["Database design & CRUD flow"] },
  { day: "Day 7", topics: ["Project setup & folder structure"] },
  { day: "Day 8", topics: ["Core feature implementation – Part 1"] },
  { day: "Day 9", topics: ["Core feature implementation – Part 2"] },
  { day: "Day 10", topics: ["Validations & error handling"] },
  { day: "Day 11", topics: ["Testing & bug fixing"] },
  { day: "Day 12", topics: ["Final demo & interview preparation"] },
];

// 24-Day In-Depth Track
const generateInDepthDays = () => [
  { day: "Day 1", topics: ["Program orientation", "Industry overview"] },
  { day: "Day 2", topics: ["Programming basics & logic"] },
  { day: "Day 3", topics: ["Variables, loops & conditions"] },
  { day: "Day 4", topics: ["Functions & modular programming"] },
  { day: "Day 5", topics: ["Collections & data handling"] },
  { day: "Day 6", topics: ["Introduction to OOP"] },
  { day: "Day 7", topics: ["Classes & constructors"] },
  { day: "Day 8", topics: ["Inheritance & encapsulation"] },
  { day: "Day 9", topics: ["Polymorphism & examples"] },
  { day: "Day 10", topics: ["Error handling & debugging"] },
  { day: "Day 11", topics: ["Clean coding practices"] },
  { day: "Day 12", topics: ["Revision & assessment"] },
  { day: "Day 13", topics: ["Project idea finalization"] },
  { day: "Day 14", topics: ["Requirement analysis"] },
  { day: "Day 15", topics: ["Database schema design"] },
  { day: "Day 16", topics: ["Project setup"] },
  { day: "Day 17", topics: ["CRUD – Part 1"] },
  { day: "Day 18", topics: ["CRUD – Part 2"] },
  { day: "Day 19", topics: ["Business logic implementation"] },
  { day: "Day 20", topics: ["Validation & error handling"] },
  { day: "Day 21", topics: ["Testing & debugging"] },
  { day: "Day 22", topics: ["Optimization & refactoring"] },
  { day: "Day 23", topics: ["Documentation & GitHub"] },
  { day: "Day 24", topics: ["Final demo & interview prep"] },
];

/* ================= COURSE PLANS ================= */

const coursePlans = {
  mini: {
    title: "Mini Project",
    description: "Academic mini project with guided development",
    immediate: {
      duration: "4–6 Weeks (12 Days)",
      days: generateImmediateDays(),
    },
    indepth: {
      duration: "8–12 Weeks (24 Days)",
      days: generateInDepthDays(),
    },
  },
  major: {
    title: "Major Project",
    description: "Industry-level final year project",
    immediate: {
      duration: "4–6 Weeks (12 Days)",
      days: generateImmediateDays(),
    },
    indepth: {
      duration: "8–12 Weeks (24 Days)",
      days: generateInDepthDays(),
    },
  },
};

/* ================= COMPONENT ================= */

function Courses() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  const [visibleDays, setVisibleDays] = useState({
    immediate: 5,
    indepth: 5,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* HERO */}
        <div className="text-center mb-24">
          <h1 className="text-5xl font-extrabold mb-4">
            Weekend <span className="text-blue-600">Industry-Oriented</span> Tech Program
          </h1>
          <p className="text-slate-600 max-w-3xl mx-auto">
            Learn, build, and complete real-world projects with structured weekend sessions.
          </p>
        </div>

        {/* MODULES */}
        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {modules.map((mod, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition"
            >
              <div className="text-4xl mb-4">{mod.icon}</div>
              <h3 className="text-xl font-bold mb-3">{mod.title}</h3>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                {mod.points.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* PROJECT TYPE */}
        <h2 className="text-4xl font-bold text-center mb-12">Choose Project Type</h2>

        <div className="grid md:grid-cols-2 gap-10 mb-24">
          {Object.entries(coursePlans).map(([key, plan]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedProject(key);
                setExpandedDay(null);
                setVisibleDays({ immediate: 5, indepth: 5 });
              }}
              className={`rounded-3xl p-12 text-left transition shadow-lg
                ${selectedProject === key
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  : "bg-white hover:shadow-xl"}`}
            >
              <h3 className="text-3xl font-bold mb-3">{plan.title}</h3>
              <p className="opacity-90">{plan.description}</p>
            </button>
          ))}
        </div>

        {/* TRACKS */}
        {selectedProject && (
          <div className="grid lg:grid-cols-2 gap-12 mb-32">
            {["immediate", "indepth"].map((track) => {
              const data = coursePlans[selectedProject][track];
              return (
                <div key={track} className="bg-white rounded-3xl p-10 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold capitalize">{track} Track</h3>
                    <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-semibold">
                      {data.duration}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {data.days.slice(0, visibleDays[track]).map((day, i) => (
                      <div key={i} className="border rounded-2xl p-5">
                        <button
                          onClick={() =>
                            setExpandedDay(
                              expandedDay === `${track}-${i}` ? null : `${track}-${i}`
                            )
                          }
                          className="w-full flex justify-between items-center font-semibold"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm">
                              {i + 1}
                            </span>
                            {day.day}
                          </div>
                          <span>{expandedDay === `${track}-${i}` ? "−" : "+"}</span>
                        </button>

                        {expandedDay === `${track}-${i}` && (
                          <ul className="mt-3 ml-11 list-disc list-inside text-slate-600 space-y-1">
                            {day.topics.map((t, idx) => (
                              <li key={idx}>{t}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* LOAD MORE */}
                  {visibleDays[track] < data.days.length && (
                    <button
                      onClick={() =>
                        setVisibleDays((prev) => ({
                          ...prev,
                          [track]: prev[track] + 5,
                        }))
                      }
                      className="w-full mt-6 py-3 rounded-xl
                                 border border-blue-600
                                 text-blue-600 font-semibold
                                 hover:bg-blue-600 hover:text-white
                                 transition"
                    >
                      Load More Days
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="text-center bg-blue-50 rounded-[2.5rem] p-16">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Start Your Project?
          </h3>
          <p className="text-slate-600 mb-10">
            Choose the right project type and learning track for your goals.
          </p>
          <Link
            to="/contact"
            className="px-12 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
          >
            Contact for Enrollment
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Courses;
