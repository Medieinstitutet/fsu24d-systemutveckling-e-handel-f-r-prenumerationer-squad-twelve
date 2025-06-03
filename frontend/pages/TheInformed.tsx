import Footer from "./Footer";
import "../styles/headercontainer.css";
import Header from "./Header";
import PlanSelector from "./PlanSelector";
import "../styles/planselector.css";

const TheInformed = () => {
  const handleBuyNow = () => {
    // TODO: Add Stripe Checkout logic here
    console.log("Buy Now button clicked. Insert Stripe code here.");
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
