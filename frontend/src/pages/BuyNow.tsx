import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import "../styles/headercontainer.css";

const accessPriority: { [key: string]: number } = {
  free: 0,
  curious: 1,
  informed: 2,
  insider: 3,
};

const getUserLevelFromToken = (): string | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.level || null;
  } catch {
    return null;
  }
};

const BuyNow = () => {
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const level = getUserLevelFromToken();
    setUserLevel(level);
    setLoading(false);
  }, []);

  const userPriority = userLevel ? accessPriority[userLevel] : 0;

  // If user already has the highest plan, hide this component
  if (!loading && userPriority >= accessPriority["insider"]) {
    return null;
  }

  return (
    <>
      <p className="home-description">
        Stay updated with the latest news, carefully selected and delivered just
        for you. Choose from our simple plans to get the news you want.
      </p>
      <h1>Buy Now</h1>
      <nav className="navcontainer">
        {userPriority < accessPriority["curious"] && (
          <Link to="/TheCurious">
            The Curious - $100
          </Link>
        )}
        {userPriority < accessPriority["informed"] && (
          <Link to="/TheInformed">
            The Informed - $200
          </Link>
        )}
        {userPriority < accessPriority["insider"] && (
          <Link to="/TheInsider">
            The Insider - $300
          </Link>
        )}
      </nav>
      <Footer />
    </>
  );
};

export default BuyNow;
