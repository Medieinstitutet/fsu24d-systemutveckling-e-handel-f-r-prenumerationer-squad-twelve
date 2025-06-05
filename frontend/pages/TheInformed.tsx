import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import PlanSelector from "./PlanSelector";
import "../styles/planselector.css";

const TheInformed = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBuyNow = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login?redirect=Theinformed");
        return;
      }

      const response = await fetch(
        "http://localhost:3000/subscription/create-checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tier: "informed" }),
        }
      );

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.message || "Failed to create checkout session");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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
        <button onClick={handleBuyNow}>Buy Now</button>
      </div>
      <Footer />
    </>
  );
};

export default TheInformed;
