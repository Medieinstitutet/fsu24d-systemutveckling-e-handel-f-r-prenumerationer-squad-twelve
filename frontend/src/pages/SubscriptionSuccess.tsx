import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "../styles/headercontainer.css";
import "../styles/maincontainer.css";

const SubscriptionSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setSubscription(null);
          setError("You must be logged in to view subscription details.");
          setLoading(false);
          navigate("/login");
          return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get("session_id");

        if (!sessionId) {
          setSubscription(null);
          setError(
            "No session ID found. Please return to the subscription page and try again."
          );
          setLoading(false);
          return;
        }

        console.log("Verifying session with ID:", sessionId);

        try {
          const verifyResponse = await fetch(
            `http://localhost:3000/subscription/verify-session?session_id=${sessionId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!verifyResponse.ok) {
            setSubscription(null);
            const errorData = await verifyResponse.json();
            console.error("Session verification failed:", errorData);

            if (
              errorData.details &&
              errorData.details.includes("db.rollback is not a function")
            ) {
              setError(
                "There was a database issue processing your subscription. " +
                  "Your subscription might still be active. Please check your Dashboard."
              );
            } else if (
              errorData.details &&
              errorData.details.includes("Invalid time value")
            ) {
              setError(
                "There was a problem processing your subscription date information. " +
                  "Your subscription may still be active. Please check your Dashboard."
              );
            } else {
              setError(
                `Subscription verification failed: ${
                  errorData.message || "Unknown error"
                }. Please contact support.`
              );
            }
            setLoading(false);
            return;
          }

          const verifyData = await verifyResponse.json();
          console.log("Session verification successful:", verifyData);

          if (verifyData.token && verifyData.tier && verifyData.status) {
            localStorage.setItem("token", verifyData.token);
            setSubscription({
              tier: verifyData.tier,
              status: verifyData.status,
              validUntil: verifyData.validUntil,
              subscriptionId:
                verifyData.subscriptionId || verifyData.subscription,
              cancelAtPeriodEnd: false,
              interval: verifyData.interval,
            });
            setError(null);
          } else {
            setSubscription(null);
            setError(
              "Incomplete subscription data received. Please contact support."
            );
          }
        } catch (verifyError) {
          setSubscription(null);
          console.error("Error during session verification:", verifyError);
          setError(
            "An error occurred while verifying your subscription. Please check your Dashboard for subscription status."
          );
        }
      } catch (err) {
        setSubscription(null);
        console.error("Error handling subscription:", err);
        setError(
          "An unexpected error occurred. Please check your Dashboard for subscription status."
        );
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [navigate]);

  return (
    <>
      <Header />
      <div className="main-container">
        <h1>Subscription Processing</h1>

        {loading ? (
          <p>Processing your subscription...</p>
        ) : error ? (
          <section className="user-news-section">
            <ul className="user-news-list">
              <li className="user-news-item">
                <h3 className="news-title">Subscription Error</h3>
                <p className="news-snippet">{error}</p>
                <button
                  className="cancelSubBtn"
                  onClick={() => navigate("/dashboard")}
                >
                  Go to Dashboard
                </button>
              </li>
            </ul>
          </section>
        ) : subscription ? (
          <section className="user-news-section">
            <ul className="user-news-list">
              <li className="user-news-item">
                <h3 className="news-title">Your subscription is active!</h3>
                <p className="news-snippet">
                  <strong>Tier:</strong> {subscription.tier}
                </p>
                <p className="news-snippet">
                  <strong>Status:</strong> {subscription.status}
                </p>
                {subscription.validUntil && (
                  <>
                    <p className="news-snippet">
                      <strong>Valid until:</strong>{" "}
                      {new Date(subscription.validUntil).toLocaleDateString()}
                    </p>
                    {subscription.interval ? (
                      <p className="news-snippet">
                        <strong>Duration:</strong>{" "}
                        {subscription.interval} subscription
                      </p>
                    ) : null}
                  </>
                )}
                <p className="news-snippet">
                  Thank you for subscribing to The Daily Dose!
                </p>
                <button
                  className="cancelSubBtn"
                  onClick={() => navigate("/dashboard")}
                >
                  Go to Dashboard
                </button>
              </li>
            </ul>
          </section>
        ) : (
          <section className="user-news-section">
            <ul className="user-news-list">
              <li className="user-news-item">
                <h3 className="news-title">No Subscription Data</h3>
                <p className="news-snippet">
                  Could not find subscription information. Please contact support.
                </p>
                <button
                  className="cancelSubBtn"
                  onClick={() => navigate("/dashboard")}
                >
                  Go to Dashboard
                </button>
              </li>
            </ul>
          </section>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SubscriptionSuccess;
