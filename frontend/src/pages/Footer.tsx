import { useState, useEffect } from "react";
import "../styles/footercontainer.css";

const Footer = () => {
  const [isBottom, setIsBottom] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      setIsBottom(scrollPosition >= pageHeight - 100);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <footer className={`footer-container${isBottom ? " visible" : " hidden"}`}>
      <div className="footer-content">
        <p className="darkmode">
          &copy; {new Date().getFullYear()} The Daily Dose.
        </p>
        <button className="darkmode" onClick={toggleDarkMode}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </footer>
  );
};

export default Footer;
