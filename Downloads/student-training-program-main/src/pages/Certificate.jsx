function Certificate() {
  return (
    <div className="bg-[#faf9f7] py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-semibold text-blue-600 uppercase mb-3">
            Student Certification Program
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Student Training & Certification Program
          </h1>
          <p className="text-slate-600 max-w-3xl mx-auto text-lg">
            A structured training program designed to equip final-year MCA/BCA students
            with real-world skills, project experience, and a professional certification.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Left Content */}
          <div className="space-y-8">

            <div className="bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl transition">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Program Overview
              </h2>
              <p className="text-slate-700 leading-relaxed">
                This program emphasizes hands-on learning through real-world projects.
                Students are trained in industry-relevant skills and evaluated on
                implementation, problem-solving, and project presentation.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl transition">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Skills & Technologies Covered
              </h2>
              <ul className="grid grid-cols-2 gap-3 text-slate-700">
                <li>• HTML, CSS, JavaScript</li>
                <li>• React & Frontend Development</li>
                <li>• Java / Python Programming</li>
                <li>• Database & SQL</li>
                <li>• Project Architecture</li>
                <li>• Problem Solving & Debugging</li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8 hover:shadow-2xl transition">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Certification Criteria
              </h2>
              <ul className="space-y-3 text-slate-700">
                <li>• Completion of mini and major projects</li>
                <li>• Code quality and logical implementation</li>
                <li>• Project explanation and documentation</li>
                <li>• Active participation in reviews</li>
              </ul>
            </div>

          </div>

          {/* Right Certificate Mock */}
          <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6 text-center">
              Certificate Preview (Sample)
            </h2>

            {/* Certificate Card */}
            <div className="border border-dashed border-slate-300 rounded-xl p-6 bg-slate-50">
              <div className="border-2 border-slate-200 rounded-xl p-10 bg-white text-center shadow-sm">
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Certificate of Completion
                </h3>

                <p className="text-slate-500 text-sm mb-6">
                  This is to certify that
                </p>

                <p className="text-lg font-semibold text-slate-900 mb-4">
                  Student Name
                </p>

                <p className="text-slate-600 mb-6">
                  has successfully completed the
                </p>

                <p className="font-semibold text-slate-900 mb-4">
                  Student Training & Certification Program
                </p>

                <p className="text-slate-600 text-sm mb-8">
                  with hands-on project implementation and evaluation.
                </p>

                <div className="flex justify-between text-xs text-slate-500 mt-10">
                  <span>Program Coordinator</span>
                  <span>Date</span>
                </div>

              </div>
            </div>

            <p className="text-slate-500 text-sm text-center mt-6">
              * Certificate issued after successful evaluation
            </p>

          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-16 bg-blue-50 border border-blue-100 rounded-2xl p-10 text-center">
          <p className="text-slate-700 max-w-4xl mx-auto text-lg">
            This certification strengthens student profiles for final-semester
            projects, internships, placement interviews, and professional networking.
          </p>
        </div>

      </div>
    </div>
  );
}

export default Certificate;
