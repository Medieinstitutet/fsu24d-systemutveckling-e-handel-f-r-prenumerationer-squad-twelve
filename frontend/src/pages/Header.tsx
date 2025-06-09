import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../utils/auth";

const Header = () => {
  const [hidden, setHidden] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());

    const handleStorageChange = () => {
      setIsLoggedIn(isAuthenticated());
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        setHidden(false);
      } else {
        setHidden(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessLevel");
    setIsLoggedIn(false);
    navigate("/");
    window.location.reload();
  };

  return (
    <div className={`header-container${hidden ? " hidden" : ""}`}>
      <nav className="NavBar">
        <h1 className="header-h1">The Daily Dose</h1>
        <Link to="/" className="home">
          Home
        </Link>

        {isLoggedIn && (
          <Link to="/dashboard" className="dashboard-link">
            Dashboard
          </Link>
        )}

        {isLoggedIn ? (
          <button className="login" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link to="/login" className="login">
            Login
          </Link>
        )}
      </nav>
    </div>
  );
};

export default Header;
