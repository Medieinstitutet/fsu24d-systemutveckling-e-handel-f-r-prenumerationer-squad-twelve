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

const TheInsider = () => {
  const navigate = useNavigate();
  const [userLevel, setUserLevel] = useState<string | null>(null);

  useEffect(() => {
    const level = getUserLevelFromToken();
    setUserLevel(level);
  }, []);

  const handleBuyNow = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate(
       "/login?redirectedFrom=theinsider&message=You need to log in or create an account to purchase this plan."
      );
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/subscription/create-checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tier: "insider" }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();

      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert(
        "There was a problem starting the checkout process. Please try again."
      );
    }
  };

  const planLevel = accessPriority["insider"];
  const canBuy =
    !userLevel ||
    (userLevel && accessPriority[userLevel] < planLevel);

  return (
    <>
      <Header />
      <div className="main-container">
        <PlanSelector />
        <h1>Buy Now - TheInsider</h1>
        <p className="plan-description">
          For $300, The Insider plan provides full access to all news plus
          exclusive content available only to insiders. Gain in-depth reports,
          special interviews, and unique perspectives that you won’t find
          anywhere else. This plan is tailored for those who want to be truly
          ahead, with premium insights and insider knowledge at their
          fingertips.
        </p>

        <p>$300 Access all news plus exclusive content only for insiders.</p>

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

export default TheInsider;
