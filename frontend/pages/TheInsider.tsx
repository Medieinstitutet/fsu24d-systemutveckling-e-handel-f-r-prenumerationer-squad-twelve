import Footer from "./Footer";
import "../styles/headercontainer.css";
import Header from "./Header";
import PlanSelector from "./PlanSelector";
import "../styles/planselector.css";

const TheInsider = () => {
  const handleBuyNow = () => {
    // TODO: Add Stripe Checkout logic here
    console.log("Buy Now button clicked. Insert Stripe code here.");
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
        <button onClick={handleBuyNow}>Buy Now</button>
      </div>
      <Footer />
    </>
  );
};

export default TheInsider;
