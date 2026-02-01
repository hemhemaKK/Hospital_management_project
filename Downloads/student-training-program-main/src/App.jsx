import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Courses from "./pages/Courses";
import Projects from "./pages/Projects";
import Certificate from "./pages/Certificate";
import Contact from "./pages/Contact";
import EnrollmentForm from "./pages/EnrollmentForm";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/certificate" element={<Certificate />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/enrollment-form" element={<EnrollmentForm />} />
      </Routes>
    </Layout>
  );
}

export default App;
