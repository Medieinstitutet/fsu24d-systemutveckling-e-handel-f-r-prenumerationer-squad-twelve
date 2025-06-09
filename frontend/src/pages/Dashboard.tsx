import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "../styles/headercontainer.css";
import { isAuthenticated, getCurrentUser } from "../utils/auth";
import type { NewsArticle } from "../types/NewsArticle";
import Modal from "../modals/Modal";

const Dashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<{
    name: string;
    email: string;
    level: string;
  } | null>(null);

  const [news, setNews] = useState<NewsArticle[]>([]);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  } | null>(null);

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

  const handleCancelSubscription = () => {
    // Ask for confirmation using modal
    setModalContent({
      title: "Cancel Subscription",
      message: "Are you sure you want to cancel your subscription?",
      confirmText: "Yes, cancel it",
      cancelText: "No, keep it",
      onConfirm: () => {
        setShowModal(false);
        confirmCancelSubscription();
      },
      onCancel: () => setShowModal(false),
    });
    setShowModal(true);
  };

  const confirmCancelSubscription = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setModalContent({
        title: "Error",
        message: "You must be logged in to cancel your subscription.",
        confirmText: "OK",
        onConfirm: () => setShowModal(false),
      });
      setShowModal(true);
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
        setModalContent({
          title: "Error",
          message: err.message || "Could not cancel subscription.",
          confirmText: "OK",
          onConfirm: () => setShowModal(false),
        });
        setShowModal(true);
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.token); // Update token
      setUser((prev) => (prev ? { ...prev, level: "free" } : null));

      setModalContent({
        title: "Subscription Cancelled",
        message: "You are now on the free plan.",
        confirmText: "OK",
        onConfirm: () => setShowModal(false),
      });
      setShowModal(true);
    } catch (error) {
      console.error(error);
      setModalContent({
        title: "Error",
        message: "Something went wrong. Please try again later.",
        confirmText: "OK",
        onConfirm: () => setShowModal(false),
      });
      setShowModal(true);
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
        <button className="cancelSubBtn" onClick={handleCancelSubscription}>
          Cancel My Subscription
        </button>
      )}

      <Footer />

      {/* Show modal if needed */}
      {showModal && modalContent && <Modal {...modalContent} />}
    </>
  );
};

export default Dashboard;
