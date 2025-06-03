import Footer from "./Footer";
import "../styles/headercontainer.css";
import Header from "./Header";

const TheInformed = () => {
  const handleBuyNow = () => {
    // TODO: Add Stripe Checkout logic here
    console.log("Buy Now button clicked. Insert Stripe code here.");
  };

  return (
    <>
      <Header />
      <div className="main-container">
        <h1>Buy Now - TheInformed</h1>
        <button onClick={handleBuyNow}>Buy Now</button>
      </div>
      <Footer />
    </>
  );
};

export default TheInformed;
