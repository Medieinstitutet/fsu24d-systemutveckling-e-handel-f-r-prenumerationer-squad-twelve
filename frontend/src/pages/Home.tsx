import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import BuyNow from "./BuyNow";
import "../styles/headercontainer.css";
import "../styles/footercontainer.css";
import "../styles/maincontainer.css";
import "../styles/home.css";
import { isAuthenticated, getCurrentUser } from "../utils/auth";
import type { NewsArticle } from "../types/NewsArticle";
import BuyNowButtons from "../components/BuyNowButtons";

const freeNews = [
  {
    id: 1,
    title: "Global Markets Rally on Recovery Hopes",
    snippet: "Markets rose as investors welcomed strong economic signals.",
  },
  {
    id: 2,
    title: "Tech Innovations Reshape the Future",
    snippet: "AI and clean energy are quickly changing industries.",
  },
  {
    id: 3,
    title: "Cities Go Green for Climate Action",
    snippet: "Communities adopt eco-friendly practices nationwide.",
  },
];

const Home = () => {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    level: string;
  } | null>(null);

  const [news, setNews] = useState<NewsArticle[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser({
          name: currentUser.name,
          email: currentUser.email,
          level: currentUser.level,
        });
      } else {
        setError("Could not load user info.");
      }
    }
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No auth token found.");
          return;
        }

        const response = await fetch("http://localhost:3000/auth/news", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch news, status: ${response.status}`);
        }

        const data = await response.json();
        setNews(data);
      } catch (err) {
        setError("Could not fetch news.");
        console.error(err);
      }
    };

    if (user) {
      fetchNews();
    }
  }, [user]);

  return (
    <>
      <Header />
      <div className="main-container">
        {error && <p style={{ color: "red" }}>{error}</p>}

        <h1 className="home-title">
          {user ? `Welcome, ${user.name}!` : "Welcome!"}
        </h1>

        <BuyNow />

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

        <section className="user-news-section">
          <h2 className="user-news-heading">Your Subscription News</h2>
          {user ? (
            news.length > 0 ? (
              <ul className="user-news-list">
                {news.map((article) => (
                  <li key={article.id} className="user-news-item">
                    <h3 className="news-title">{article.title}</h3>
                    <p className="news-snippet">{article.body}</p>
                    <small>
                      Level: {article.access_level} | Date:{" "}
                      {new Date(article.created_at).toLocaleDateString()}
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                No additional news available for your subscription level. Please
                choose a plan below:
              </p>
            )
          ) : (
            <p>Please log in to see subscription-based news.</p>
          )}

          <BuyNowButtons />
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Home;
