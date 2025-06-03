import Header from "./Header";
import Footer from "./Footer";
import BuyNow from "./BuyNow";
import "../styles/headercontainer.css";
import "../styles/footercontainer.css";
import "../styles/maincontainer.css";

const Home = () => (
  <>
    <Header />
    <div className="main-container">
      <h1>Home</h1>
      <BuyNow />
    </div>
    <Footer />
  </>
);

export default Home;
