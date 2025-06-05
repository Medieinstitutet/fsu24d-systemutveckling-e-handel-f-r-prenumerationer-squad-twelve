import Header from "./Header";
import Footer from "./Footer";
import BuyNow from "./BuyNow";
import "../styles/headercontainer.css";
import "../styles/footercontainer.css";
import "../styles/maincontainer.css";
import "../styles/home.css";

const freeNews = [
  {
    id: 1,
    title: "Global Markets Rally on Economic Recovery Hopes",
    snippet:
      "Stock markets around the world saw a boost today as investors reacted positively to new economic data...",
  },
  {
    id: 2,
    title: "New Tech Innovations Shaping the Future",
    snippet:
      "From AI to renewable energy, new technologies are transforming industries faster than ever before...",
  },
  {
    id: 3,
    title: "Local Communities Embrace Green Initiatives",
    snippet:
      "Cities across the country are adopting sustainable practices to combat climate change and improve quality of life...",
  },
];

const Home = () => (
  <>
    <Header />
    <div className="main-container">
      <h1 className="home-title">Welcome to The Daily Dose!</h1>

      <section className="free-news-section">
        <h2 className="free-news-heading">Free News</h2>
        <ul className="free-news-list">
          {freeNews.map(({ id, title, snippet }) => (
            <li key={id} className="free-news-item">
              <strong className="news-title">{title}</strong>
              <p className="news-snippet">{snippet}</p>
            </li>
          ))}
        </ul>
      </section>

      <BuyNow />
    </div>
    <Footer />
  </>
);

export default Home;
