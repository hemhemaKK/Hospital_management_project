import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

/**
 * DarkModeToggle - Toggle between light and dark themes
 * Persists user preference in localStorage
 */
function DarkModeToggle() {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem("theme");
        return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.setAttribute("data-theme", "light");
            localStorage.setItem("theme", "light");
        }
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="relative w-16 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full p-1 transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            aria-label="Toggle dark mode"
        >
            <motion.div
                className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
                animate={{
                    x: isDark ? 32 : 0
                }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                }}
            >
                {isDark ? (
                    <Moon size={14} className="text-indigo-600" />
                ) : (
                    <Sun size={14} className="text-yellow-500" />
                )}
            </motion.div>
        </button>
    );
}

export default DarkModeToggle;
