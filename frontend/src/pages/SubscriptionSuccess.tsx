import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "../styles/maincontainer.css";

const SubscriptionSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          navigate("/login");
          return;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        
        if (sessionId) {
          const response = await fetch(`http://localhost:3000/subscription/verify-session?session_id=${sessionId}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.token) {
              localStorage.setItem("token", data.token);
            }
          }
        }
        
        const response = await fetch("http://localhost:3000/subscription/my-subscription", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        }
      } catch (err) {
        console.error("Error handling subscription:", err);
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
        <h1>Subscription Successful!</h1>
        
        {loading ? (
          <p>Loading your subscription details...</p>
        ) : subscription ? (
          <div>
            <h2>Your subscription details:</h2>
            <p><strong>Tier:</strong> {subscription.tier}</p>
            <p><strong>Status:</strong> {subscription.status}</p>
            {subscription.validUntil && (
              <p><strong>Valid until:</strong> {new Date(subscription.validUntil).toLocaleDateString()}</p>
            )}
            <p>Thank you for subscribing to The Daily Dose!</p>
            <button onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
          </div>
        ) : (
          <p>Could not find subscription information. Please contact support.</p>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SubscriptionSuccess;