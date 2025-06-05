import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import PlanSelector from "./PlanSelector";
import "../styles/planselector.css";

const TheInsider = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBuyNow = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login?redirect=Theinsider");
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
          body: JSON.stringify({ tier: "insider" }),
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
        <button onClick={handleBuyNow} disabled={loading}>
          {loading ? "Processing..." : "Buy Now"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
      <Footer />
    </>
  );
};

export default TheInsider;
