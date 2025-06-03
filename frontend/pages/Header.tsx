import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Header = () => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setHidden(true); 
      } else {
        setHidden(false);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`header-container${hidden ? " hidden" : ""}`}>
      <nav className="NavBar">
        <h1>The Daily Dose</h1>
        <Link to="/" className="home">
          Home
        </Link>
        <Link to="/login" className="login">
          Login
        </Link>
      </nav>
    </div>
  );
};

export default Header;
