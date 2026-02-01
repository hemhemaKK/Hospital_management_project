import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * Layout component wraps every page
 * Includes Navbar + Footer
 */
export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar at the top */}
      <Navbar />

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
}
