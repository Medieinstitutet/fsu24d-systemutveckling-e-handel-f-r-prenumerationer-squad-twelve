import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import PlanSelector from "./PlanSelector";
import "../styles/planselector.css";

const TheCurious = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBuyNow = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login?redirect=TheCurious");
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
          body: JSON.stringify({ tier: "curious" }),
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
        <h1>Buy Now - TheCurious</h1>
        <p className="plan-description">
          For just $100, The Curious plan offers essential news updates to keep
          you informed about the most important events worldwide. Perfect for
          those who want a quick overview and stay connected without getting
          overwhelmed. You'll receive carefully curated headlines and summaries
          delivered regularly so you never miss out on key stories.
        </p>

        <p>$100 Get basic news updates to stay in the loop.</p>

        <button onClick={handleBuyNow} disabled={loading}>
          {loading ? "Processing..." : "Buy Now"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
      <Footer />
    </>
  );
};

export default TheCurious;
