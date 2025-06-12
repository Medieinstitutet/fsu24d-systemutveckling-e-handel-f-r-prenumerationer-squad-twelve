import { useEffect, useState, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import BuyNow from './BuyNow';
import '../styles/headercontainer.css';
import '../styles/footercontainer.css';
import '../styles/maincontainer.css';
import '../styles/home.css';
import { isAuthenticated, getCurrentUser } from '../utils/auth';
import type { NewsArticle } from '../types/NewsArticle';
import BuyNowButtons from '../components/BuyNowButtons';
import ArticleModal from '../modals/ArticleModal';

const freeNews = [
  {
    id: 1,
    title: 'Global Markets Rally on Recovery Hopes',
    snippet: 'Markets rose as investors welcomed strong economic signals.',
  },
  {
    id: 2,
    title: 'Tech Innovations Reshape the Future',
    snippet: 'AI and clean energy are quickly changing industries.',
  },
  {
    id: 3,
    title: 'Cities Go Green for Climate Action',
    snippet: 'Communities adopt eco-friendly practices nationwide.',
  },
];

const Home = () => {
  // const navigate = useNavigate(); // For redirecting admin from / to /admin instead

  const [user, setUser] = useState<{
    name: string;
    email: string;
    level: string;
    role?: string;
  } | null>(null);

  const [news, setNews] = useState<NewsArticle[]>([]);
  const [error, setError] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(
    null
  );
  const [showReadMoreButton, setShowReadMoreButton] = useState<
    Map<number, boolean>
  >(new Map());
  const snippetRefs = useRef<Map<number, HTMLParagraphElement | null>>(
    new Map()
  );

  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (isAuthenticated()) {
      const currentUser = getCurrentUser();

      // Redirect admin to /admin instead
      // if (currentUser?.role === 'admin') {
      //   navigate('/admin');
      //   return;
      // }

      if (currentUser) {
        setUser({
          name: currentUser.name,
          email: currentUser.email,
          level: currentUser.level,
        });
        setFilter(currentUser.level);
      } else {
        setError('Could not load user info.');
      }
    }
  }, []);

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
          throw new Error(`Failed to fetch news, status: ${response.status}`);
        }

        const data = await response.json();
        setNews(data);
      } catch (err) {
        setError('Could not fetch news.');
        console.error(err);
      }
    };

    if (user) {
      fetchNews();
    } else {
      setNews([]);
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

  const openModal = (article: NewsArticle) => {
    setSelectedArticle(article);
  };

  const closeModal = () => {
    setSelectedArticle(null);
  };

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

        <h1 className='home-title'>
          {user ? `Welcome, ${user.name}!` : 'Welcome!'}
        </h1>

        <BuyNow />

        {!user && (
          <section className='free-news-section'>
            <h2 className='free-news-heading'>Free News</h2>
            <ul className='free-news-list'>
              {freeNews.map(({ id, title, snippet }) => (
                <li key={id} className='free-news-item'>
                  <strong className='news-title'>{title}</strong>
                  <p className='news-snippet'>{snippet}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className='user-news-section'>
          <h2 className='user-news-heading'>Your Subscription News</h2>
          {user ? (
            <>
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
                            onClick={() => openModal(article)}
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
                    No additional news available for your current selection or subscription level.
                  </p>
                  <BuyNowButtons />
                </>
              )}
            </>
          ) : (
            <p>Please log in to see subscription-based news.</p>
          )}
        </section>
      </div>
      <Footer />
      {selectedArticle && (
        <ArticleModal article={selectedArticle} onClose={closeModal} />
      )}
    </>
  );
};

export default Home;