import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../styles/headercontainer.css';
import { isAuthenticated, getCurrentUser } from '../utils/auth';
import type { NewsArticle } from '../types/NewsArticle';
import Modal from '../modals/CancelModal';
import BuyNowButtons from '../components/BuyNowButtons';
import type { AuthPayload } from '../types/AuthPayload';
import ArticleModal from '../modals/ArticleModal';

interface ExtendedAuthPayload extends AuthPayload {
  billingFrequency?: string;
  nextBillingDate?: string;
  validUntil?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<ExtendedAuthPayload | null>(null);

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

  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(
    null
  );
  const [showReadMoreButton, setShowReadMoreButton] = useState<
    Map<number, boolean>
  >(new Map());
  const snippetRefs = useRef<Map<number, HTMLParagraphElement | null>>(
    new Map()
  );

  useEffect(() => {
    if (!isAuthenticated()) {
      console.log('User is NOT authenticated, redirecting to login.');
      navigate('/login');
      return;
    }

    const currentUser = getCurrentUser();
    if (currentUser) {
      console.log('Loaded current user:', currentUser);
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

  const [filter, setFilter] = useState<string>(user?.level || 'all');

  useEffect(() => {
    if (user && user.level && filter === 'all') {
      setFilter(user.level);
    }
  }, [user]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No auth token found.');
          setNews([]);
          return;
        }

        const url = new URL('http://localhost:3000/auth/news');
        if (filter) {
          url.searchParams.append('filter', filter);
        }

        const response = await fetch(url.toString(), {
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
  }, [user, filter]);

  useEffect(() => {
    const newShowButtonMap = new Map<number, boolean>();
    news.forEach((article) => {
      const snippetElement = snippetRefs.current.get(article.id);
      if (snippetElement) {
        const isOverflowing = snippetElement.scrollHeight > 72;
        newShowButtonMap.set(article.id, isOverflowing);
      }
    });
    setShowReadMoreButton(newShowButtonMap);
  }, [news]);

  const openArticleModal = (article: NewsArticle) => {
    setSelectedArticle(article);
  };

  const closeArticleModal = () => {
    setSelectedArticle(null);
  };

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

  const checkSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        'http://localhost:3000/subscription/check-status',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Subscription data received:", data);

        setUser(prevUser => {
          if (!prevUser) return null;
          
          return {
            ...prevUser,
            subscription_status: data.status,
            validUntil: data.currentPeriodEnd,
            billingFrequency: data.interval,
            nextBillingDate: data.nextInvoice || data.currentPeriodEnd
          };
        });
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
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
      setUser((prev) =>
        prev ? { ...prev, subscription_status: 'cancelled' } : null
      );

      await checkSubscriptionStatus();

      setModalContent({
        title: 'Subscription Cancelled',
        message:
          'Your subscription has been cancelled and will remain active until the end of your current billing period.',
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

  useEffect(() => {
    if (user && (user.subscription_status === 'cancelled' || user.subscription_status === 'active')) {
      checkSubscriptionStatus();
    }
  }, [user?.subscription_status]); 

  useEffect(() => {
    if (user && user.level !== 'free' && user.subscription_status !== 'failed') {
      console.log('Checking subscription details for paid user');
      checkSubscriptionStatus();
    }
  }, [user?.id]);

  const filteredNews = news.filter((article) => {
    if (!user) return false;

    if (article.access_level === 'free') {
      return true;
    }

    if (user.level === 'curious' && article.access_level === 'curious') {
      return true;
    }

    if (
      user.level === 'informed' &&
      (article.access_level === 'curious' ||
        article.access_level === 'informed')
    ) {
      return true;
    }

    if (user.level === 'insider') {
      return true;
    }

    return false;
  });

  return (
    <>
      <Header />
      <div className='main-container'>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {user ? (
          <>
            <h1>Dashboard</h1>
            <section className='user-news-section'>
              <ul className='user-news-list'>
                <li className='user-news-item'>
                  <h3 className='news-title'>Welcome, {user.name}!</h3>
                  <p className='news-snippet'>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p className='news-snippet'>
                    <strong>Access Level:</strong> {user.level}
                  </p>
                </li>
                {user && user.level !== 'free' && (
                  <li className="user-news-item">
                    <h3 className="news-title">Subscription</h3>
                    <div className="subscription-details">
                      <div className="subscription-row">
                        <strong>Product:</strong>
                        <span>
                          The {user.level.charAt(0).toUpperCase() + user.level.slice(1)}
                        </span>
                      </div>
                      
                      <div className="subscription-row">
                        <strong>Status:</strong>
                        <span>
                          {user.subscription_status === 'active' ? 'Active' : 
                           user.subscription_status === 'cancelled' ? 'Ending' : 
                           user.subscription_status}
                        </span>
                      </div>
                      
                      {user.validUntil && (
                        <div className="subscription-row">
                          <strong>{user.subscription_status === 'cancelled' ? 'Ends:' : 'Active until:'}</strong>
                          <span>
                            {new Date(user.validUntil).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                      
                      <div className="subscription-row">
                        <strong>Frequency:</strong>
                        <span>Billed {user.billingFrequency === 'week' ? 'weekly' : 
                                                user.billingFrequency === 'month' ? 'monthly' : 
                                                user.billingFrequency === 'year' ? 'yearly' : 
                                                user.billingFrequency}</span>
                      </div>
                      
                      <div className="subscription-row">
                        <strong>Next invoice:</strong>
                        <span>{(user.subscription_status === 'active' && user.nextBillingDate) ? 
                              new Date(user.nextBillingDate).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              }) : '–'}</span>
                      </div>
                    </div>
                  </li>
                )}
                <BuyNowButtons />
                {user?.subscription_status === 'failed' && (
                  <div
                    style={{
                      backgroundColor: 'black',
                      color: 'white',
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
                  className='cancelSubBtn'
                  onClick={handleCancelSubscription}
                >
                  Cancel My Subscription
                </button>
              )}
            </section>

            <section className='user-news-section'>
              <h2 className='user-news-heading'>Your Subscription News</h2>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ marginBottom: '1rem' }}
              >
                <option value='all'>All News</option>
                <option value='free'>Free news</option>
                <option value='curious'>The Curious</option>
                <option value='informed'>The Informed</option>
                <option value='insider'>The Insider</option>
              </select>

              {filteredNews.length > 0 ? (
                <ul className='user-news-list'>
                  {filteredNews.map((article) => (
                    <li key={article.id} className='user-news-item'>
                      <h3 className='news-title'>{article.title}</h3>
                      <p
                        ref={(el: HTMLParagraphElement | null) => {
                          snippetRefs.current.set(article.id, el);
                        }}
                        className='news-snippet'
                      >
                        {article.body}
                      </p>
                      <div className='news-info-row'>
                        <small>
                          Level: {article.access_level} | Date:{' '}
                          {new Date(article.created_at).toLocaleDateString()}
                        </small>
                        {showReadMoreButton.get(article.id) && (
                          <button
                            onClick={() => openArticleModal(article)}
                            className='read-more-button'
                          >
                            Läs mer
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <p>
                    No additional news available for your current selection or
                    subscription level.
                  </p>
                  <BuyNowButtons />
                </>
              )}
            </section>
          </>
        ) : (
          <p>Loading user...</p>
        )}
      </div>

      <Footer />

      {showModal && modalContent && <Modal {...modalContent} />}
      {selectedArticle && (
        <ArticleModal article={selectedArticle} onClose={closeArticleModal} />
      )}
    </>
  );
};

export default Dashboard;