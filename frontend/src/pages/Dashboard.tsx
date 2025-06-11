// unchanged imports
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../styles/headercontainer.css';
import { isAuthenticated, getCurrentUser } from '../utils/auth';
import type { NewsArticle } from '../types/NewsArticle';
import Modal from '../modals/CancelModal';
import BuyNowButtons from '../components/BuyNowButtons';
import type { AuthPayload } from '../types/AuthPayload';

const Dashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthPayload | null>(null);

  const [news, setNews] = useState<NewsArticle[]>([]);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  } | null>(null);

  // ✅ Get user from token
  useEffect(() => {
    if (!isAuthenticated()) {
      console.log('User is NOT authenticated, redirecting to login.');
      navigate('/login');
      return;
    }

    const currentUser = getCurrentUser();
    if (currentUser) {
      console.log('Loaded current user:', currentUser);

      // If admin → redirect to admin panel
      if (currentUser.role === 'admin') {
        navigate('/admin');
        return;
      }

      setUser(currentUser);
    } else {
      console.error('Could not load user info from token.');
      setError('Could not load user info.');
    }
  }, [navigate]);

  // ✅ Fetch filtered news from backend
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No auth token found.');
          return;
        }

        const response = await fetch('http://localhost:3000/auth/news', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Fetch news failed:', errorText);
          throw new Error(`Failed to fetch news, status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched news data:', data);
        setNews(data);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Could not fetch news.');
      }
    };

    if (user) {
      fetchNews();
    }
  }, [user]);

  const handleCancelSubscription = () => {
    setModalContent({
      title: 'Cancel Subscription',
      message: 'Are you sure you want to cancel your subscription?',
      confirmText: 'Yes, cancel it',
      cancelText: 'No, keep it',
      onConfirm: () => {
        setShowModal(false);
        confirmCancelSubscription();
      },
      onCancel: () => setShowModal(false),
    });
    setShowModal(true);
  };

  const confirmCancelSubscription = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setModalContent({
        title: 'Error',
        message: 'You must be logged in to cancel your subscription.',
        confirmText: 'OK',
        onConfirm: () => setShowModal(false),
      });
      setShowModal(true);
      return;
    }

    try {
      const res = await fetch(
        'http://localhost:3000/auth/cancel-subscription',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        setModalContent({
          title: 'Error',
          message: err.message || 'Could not cancel subscription.',
          confirmText: 'OK',
          onConfirm: () => setShowModal(false),
        });
        setShowModal(true);
        return;
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      setUser((prev) => (prev ? { ...prev, level: 'free' } : null));

      setModalContent({
        title: 'Subscription Cancelled',
        message: 'You are now on the free plan.',
        confirmText: 'OK',
        onConfirm: () => setShowModal(false),
      });
      setShowModal(true);
    } catch (error) {
      console.error(error);
      setModalContent({
        title: 'Error',
        message: 'Something went wrong. Please try again later.',
        confirmText: 'OK',
        onConfirm: () => setShowModal(false),
      });
      setShowModal(true);
    }
  };

  return (
    <>
      <Header />
      <div className="main-container">
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {user ? (
          <>
            <h1>Dashboard</h1>
            <section className="user-news-section">
              <ul className="user-news-list">
                <li className="user-news-item">
                  <h3 className="news-title">Welcome, {user.name}!</h3>
                  <p className="news-snippet">
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p className="news-snippet">
                    <strong>Access Level:</strong> {user.level}
                  </p>
                </li>
                <BuyNowButtons />
                {user?.subscription_status === 'failed' && (
                  <div
                    style={{
                      backgroundColor: '#fee',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginTop: '1rem',
                    }}
                  >
                    <p>
                      Your payment failed. Please retry to keep your
                      subscription active.
                    </p>
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem('token');
                        try {
                          const res = await fetch(
                            'http://localhost:3000/subscription/create-checkout',
                            {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({ tier: user.level }),
                            }
                          );

                          if (!res.ok)
                            throw new Error(
                              'Failed to create checkout session'
                            );
                          const { url } = await res.json();
                          window.location.href = url;
                        } catch (err) {
                          alert(
                            'Could not retry payment. Please try again later.'
                          );
                          console.error('Retry failed:', err);
                        }
                      }}
                    >
                      Retry Payment
                    </button>
                  </div>
                )}
              </ul>

              {user && user.level !== 'free' && (
                <button
                  className="cancelSubBtn"
                  onClick={handleCancelSubscription}
                >
                  Cancel My Subscription
                </button>
              )}
            </section>

            <section className="user-news-section">
              <h2 className="user-news-heading">Your Subscription News</h2>
              {news.length > 0 ? (
                <ul className="user-news-list">
                  {news.map((article) => (
                    <li key={article.id} className="user-news-item">
                      <h3 className="news-title">{article.title}</h3>
                      <p className="news-snippet">{article.body}</p>
                      <small>
                        Level: {article.access_level} | Date:{' '}
                        {new Date(article.created_at).toLocaleDateString()}
                      </small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No additional news available for your subscription level.</p>
              )}
            </section>
          </>
        ) : (
          <p>Loading user...</p>
        )}
      </div>

      <Footer />

      {showModal && modalContent && <Modal {...modalContent} />}
    </>
  );
};

export default Dashboard;
