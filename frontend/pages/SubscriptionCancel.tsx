import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "../styles/maincontainer.css";

const SubscriptionCancel = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="main-container">
        <h1>Subscription Cancelled</h1>
        <p>Your subscription checkout was cancelled.</p>
        <p>You can try again or choose a different subscription plan.</p>
        <button onClick={() => navigate("/BuyNow")}>View Plans</button>
      </div>
      <Footer />
    </>
  );
};

export default SubscriptionCancel;