import Footer from "./Footer";
import Header from "./Header";
import PlanSelector from "./PlanSelector";
import "../styles/planselector.css";

const TheCurious = () => {
  const handleBuyNow = () => {
    // TODO: Add Stripe Checkout logic here
    console.log("Buy Now button clicked. Insert Stripe code here.");
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
        <button onClick={handleBuyNow}>Buy Now</button>
      </div>
      <Footer />
    </>
  );
};

export default TheCurious;
