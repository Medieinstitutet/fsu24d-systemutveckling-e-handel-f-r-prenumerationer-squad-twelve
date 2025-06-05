import { useEffect, useState } from "react";
import Footer from "./Footer";
import Header from "./Header";
import PlanSelector from "./PlanSelector";
import "../styles/planselector.css";
import { useNavigate } from "react-router-dom";

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

const TheInformed = () => {
  const navigate = useNavigate();
  const [userLevel, setUserLevel] = useState<string | null>(null);

  useEffect(() => {
    const level = getUserLevelFromToken();
    setUserLevel(level);
  }, []);

  const handleBuyNow = () => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = "https://your-stripe-checkout-link.com/informed";
    } else {
      navigate(
        "/login?redirectedFrom=theinformed&message=You need to log in or create an account to purchase The Informed plan."
      );
    }
  };

  const planLevel = accessPriority["informed"];
  const canBuy = !userLevel || (userLevel && accessPriority[userLevel] < planLevel);

  return (
    <>
      <Header />
      <div className="main-container">
        <PlanSelector />
        <h1>Buy Now - TheInformed</h1>
        <p className="plan-description">
          At $200, The Informed plan dives deeper with detailed news reports and
          expert insights. Ideal for readers who want more context, analysis,
          and background to understand the bigger picture behind the headlines.
          You'll get comprehensive coverage of current affairs, helping you make
          well-informed decisions in your daily life.
        </p>

        <p>$200 Receive more detailed news and insights.</p>

        {canBuy ? (
          <button onClick={handleBuyNow}>Buy Now</button>
        ) : (
          <p>You already have this plan.</p>
        )}
      </div>
      <Footer />
    </>
  );
};

export default TheInformed;
