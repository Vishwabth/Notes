import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";   // ⬅️ New Home page

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Keep token in sync with localStorage (in case user logs in/out in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Home />} />

        {/* Auth pages */}
        <Route
          path="/login"
          element={<Login onLogin={() => setToken(localStorage.getItem("token"))} />}
        />
        <Route
          path="/signup"
          element={<Signup onSignup={() => setToken(localStorage.getItem("token"))} />}
        />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
