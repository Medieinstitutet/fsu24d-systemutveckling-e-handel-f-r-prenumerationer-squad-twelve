import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "../styles/headercontainer.css";
import { isAuthenticated, getCurrentUser } from "../utils/auth";
import type { NewsArticle } from "../types/NewsArticle";




const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    level: string;
  } | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      console.log("User is NOT authenticated, redirecting to login.");
      navigate("/login");
      return;
    }

    const currentUser = getCurrentUser();
    if (currentUser) {
      console.log("Loaded current user:", currentUser);
      setUser({
        name: currentUser.name,
        email: currentUser.email,
        level: currentUser.level,
      });
    } else {
      console.error("Could not load user info from token.");
      setError("Could not load user info.");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching news with token:", token);

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

        console.log("Fetch news response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Fetch news failed:", errorText);
          throw new Error(`Failed to fetch news, status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched news data:", data);
        setNews(data);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Could not fetch news.");
      }
    };

    if (user) {
      console.log("User loaded, fetching news...");
      fetchNews();
    }
  }, [user]);

  const handleCancelSubscription = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You must be logged in");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/auth/cancel-subscription", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      alert("Error: " + err.message);
      return;
    }

    const data = await res.json();
    localStorage.setItem("token", data.token);  // update token with new subscription level
    alert("Subscription cancelled! You are now on the free plan.");
    setUser((prev) => (prev ? { ...prev, level: "free" } : null));
  } catch (error) {
    alert("Something went wrong.");
    console.error(error);
  }
};


  return (
    <>
      <Header />
      <div className="main-container">
        {error && <p style={{ color: "red" }}>{error}</p>}
        {user ? (
          <>
            <h1>Welcome, {user.name}!</h1>
            <p>Email: {user.email}</p>
            <p>Access Level: {user.level}</p>

            <h2>Your News</h2>
            {news.length > 0 ? (
              <ul>
                {news.map((article) => (
                  <li key={article.id}>
                    <h3>{article.title}</h3>
                    <p>{article.body}</p>
                    <small>
                      Level: {article.access_level} | Date:{" "}
                      {new Date(article.created_at).toLocaleDateString()}
                    </small>
                    <hr />
                  </li>
                ))}
              </ul>
            ) : (
              <p>No news available for your subscription level.</p>
            )}
          </>
        ) : (
          <p>Loading user...</p>
        )}
      </div>

      {user && user.level !== "free" && (
        <button onClick={handleCancelSubscription}>
          Cancel My Subscription
        </button>
      )}

      <Footer />
    </>
  );
};

export default Dashboard;
