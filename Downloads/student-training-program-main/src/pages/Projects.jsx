import { FaDatabase, FaLaptopCode, FaProjectDiagram } from "react-icons/fa";

function Projects() {
  const projects = [
    {
      title: "Student Management System",
      stack: "HTML • CSS • JS / Python / Java • SQL",
      description:
        "A system to manage student records including registration, updates, search, and reports.",
      features: [
        "Add, update & delete student records",
        "Search & filter students",
        "Database integration",
      ],
      icon: <FaDatabase className="text-blue-500 w-8 h-8" />,
    },
    {
      title: "Library Management System",
      stack: "Java / Python • SQL",
      description:
        "Manage books, members, issue/return tracking, and fine calculation.",
      features: [
        "Book inventory management",
        "Issue & return workflow",
        "Fine calculation logic",
      ],
      icon: <FaDatabase className="text-green-500 w-8 h-8" />,
    },
    {
      title: "Online Course Registration System",
      stack: "React • JS • SQL",
      description:
        "A web application where students can register for courses and track enrollment status.",
      features: [
        "Course listing & registration",
        "Student dashboard",
        "Data persistence",
      ],
      icon: <FaLaptopCode className="text-yellow-500 w-8 h-8" />,
    },
    {
      title: "Attendance Management System",
      stack: "HTML • CSS • JS • SQL",
      description:
        "Track daily attendance for students with reports and summaries.",
      features: [
        "Daily attendance entry",
        "Monthly attendance reports",
        "User-friendly interface",
      ],
      icon: <FaLaptopCode className="text-purple-500 w-8 h-8" />,
    },
    {
      title: "To-Do & Task Management App",
      stack: "React • JS",
      description:
        "A task management system for organizing daily activities with status tracking.",
      features: ["Add, edit & delete tasks", "Task status tracking", "Component-based UI"],
      icon: <FaProjectDiagram className="text-pink-500 w-8 h-8" />,
    },
    {
      title: "Employee Management System",
      stack: "Python / Java • SQL",
      description:
        "Manage employee details, departments, and basic payroll structure.",
      features: ["Employee CRUD operations", "Department mapping", "Structured database design"],
      icon: <FaDatabase className="text-red-500 w-8 h-8" />,
    },
    {
      title: "Online Examination System",
      stack: "HTML • CSS • JS • SQL",
      description:
        "Conduct online tests with question management and result evaluation.",
      features: ["MCQ based tests", "Automatic evaluation", "Result generation"],
      icon: <FaLaptopCode className="text-indigo-500 w-8 h-8" />,
    },
    {
      title: "College Event Management System",
      stack: "React • JS • Backend Basics",
      description:
        "Manage college events, registrations, and participant details.",
      features: ["Event creation & listing", "Participant registration", "Simple admin panel"],
      icon: <FaProjectDiagram className="text-teal-500 w-8 h-8" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f7] py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-semibold text-blue-600 tracking-wide uppercase mb-3">
            Final year Projects
          </span>

          <h1 className="text-5xl font-extrabold text-slate-900 mb-6">
            Academic & Real-World Project Ideas
          </h1>

          <p className="text-slate-600 max-w-3xl mx-auto text-lg">
            Carefully designed for all final-semester students, focusing on real-world problems, database usage, and practical implementation required for academic submission and viva.
          </p>
        </div>

        {/* PROJECT LIST */}
        <div className="grid md:grid-cols-2 gap-10">
          {projects.map((p, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-slate-200
                         p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  {p.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{p.title}</h3>
              </div>

              <p className="text-sm font-semibold text-blue-600 mb-4">
                Tech Stack: {p.stack}
              </p>

              <p className="text-slate-600 mb-5 leading-relaxed">{p.description}</p>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-slate-900 mb-3">
                  Core Features
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
                  {p.features.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FOOT NOTE */}
        <div className="mt-24 text-center max-w-3xl mx-auto">
          <p className="text-slate-600 text-lg">
            Each project includes problem understanding, system design, implementation, and explanation—making them ideal for final-year evaluation and project defense.
          </p>
        </div>

      </div>
    </div>
  );
}

export default Projects;
