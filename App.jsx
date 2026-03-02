import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("destina_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("destina_theme");
    return stored ? stored === "dark" : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      root.classList.remove("light");
      localStorage.setItem("destina_theme", "dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      localStorage.setItem("destina_theme", "light");
    }
  }, [darkMode]);

  const hideGlobalLayout = useMemo(() => location.pathname.startsWith("/dashboard"), [location.pathname]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {!hideGlobalLayout && <Navbar darkMode={darkMode} onToggleTheme={() => setDarkMode((prev) => !prev)} />}

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard darkMode={darkMode} onToggleTheme={() => setDarkMode((prev) => !prev)} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </motion.div>
      </AnimatePresence>

      {!hideGlobalLayout && <Footer />}
    </div>
  );
}

export default App;
