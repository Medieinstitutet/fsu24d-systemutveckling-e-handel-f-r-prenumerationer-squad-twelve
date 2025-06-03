import { Link } from "react-router-dom";
import Footer from "./Footer";
import "../styles/headercontainer.css";

const BuyNow = () => (
  <>
    <h1>Buy Now</h1>
    <nav className="navcontainer">
      <Link to="/TheCurious">The Curious</Link>
      <Link to="/TheInformed">The Informed</Link>
      <Link to="/TheInsider">The Insider</Link>
    </nav>
    <Footer />
  </>
);

export default BuyNow;
