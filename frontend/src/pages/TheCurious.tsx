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

const TheCurious = () => {
  const navigate = useNavigate();
  const [userLevel, setUserLevel] = useState<string | null>(null);

  useEffect(() => {
    const level = getUserLevelFromToken();
    setUserLevel(level);
  }, []);

  const handleBuyNow = () => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = "https://your-stripe-checkout-link.com";
    } else {
      navigate(
        "/login?redirectedFrom=thecurious&message=You need to log in or create an account to purchase this plan."
      );
    }
  };

  const planLevel = accessPriority["curious"];
  const canBuy = !userLevel || (userLevel && accessPriority[userLevel] < planLevel);

  return (
    <>
      <Header />
      <div className="main-container">
        <PlanSelector />
        <h1>Buy Now - TheCurious</h1>
        <p className="plan-description">
          For just $100, The Curious plan offers essential news updates to keep
          you informed about the most important events worldwide. Perfect for
          those who want a quick overview and stay connected without getting
          overwhelmed. You'll receive carefully curated headlines and summaries
          delivered regularly so you never miss out on key stories.
        </p>

        <p>$100 Get basic news updates to stay in the loop.</p>

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

export default TheCurious;
