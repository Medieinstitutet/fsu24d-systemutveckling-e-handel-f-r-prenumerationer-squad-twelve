import { Link } from "react-router-dom";
import Footer from "./Footer";

const BuyNow = () => (
  <>
    <h1>Buy Now</h1>
    <nav>
      <Link to="/TheCurious">TheCurious</Link>
      <Link to="/TheInformed">TheInformed</Link>
      <Link to="/TheInsider">TheInsider</Link>
    </nav>
    <Footer />
  </>
);

export default BuyNow;
