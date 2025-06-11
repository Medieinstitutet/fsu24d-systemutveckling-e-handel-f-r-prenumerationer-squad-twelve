import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../utils/auth';
import Header from '../Header';
import Footer from '../Footer';
import '../../styles/adminpanel.css';

interface ContentItem {
  id: number;
  title: string;
  body: string;
  access_level: 'free' | 'curious' | 'informed' | 'insider';
  created_at: string;
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    access_level: 'free',
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [token] = useState(localStorage.getItem('token'));
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const [sortMode, setSortMode] = useState<
    'level-asc' | 'level-desc' | 'title-asc' | 'title-desc'
  >('level-asc');

  const levelPriority = {
    free: 0,
    curious: 1,
    informed: 2,
    insider: 3,
  };

  const fetchContent = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/admin/content', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 403) {
        setIsAuthorized(false);
        return;
      }

      const data = await res.json();
      setContentList(data);
      setIsAuthorized(true);
    } catch (err) {
      console.error('Failed to fetch content:', err);
      setIsAuthorized(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId
      ? `http://localhost:3000/admin/content/${editId}`
      : 'http://localhost:3000/admin/content';
    const method = editId ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      setFormData({ title: '', body: '', access_level: 'free' });
      setEditId(null);
      fetchContent();
    } catch (err) {
      console.error('Failed to submit content:', err);
    }
  };

  const handleEdit = (item: ContentItem) => {
    setFormData({
      title: item.title,
      body: item.body,
      access_level: item.access_level,
    });
    setEditId(item.id);
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/admin/content/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchContent();
    } catch (err) {
      console.error('Failed to delete content:', err);
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!token || !user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchContent();
  }, [token, navigate, fetchContent]);

  if (isAuthorized === false) return <p>Access denied. Admins only.</p>;
  if (isAuthorized === null) return <p>Loading admin panel...</p>;

  const sortedList = [...contentList].sort((a, b) => {
    switch (sortMode) {
      case 'level-asc':
        return levelPriority[a.access_level] - levelPriority[b.access_level];
      case 'level-desc':
        return levelPriority[b.access_level] - levelPriority[a.access_level];
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  return (
    <>
      <Header />
      <div className="admin-panel">
        <h1>Admin Content Panel</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
          <textarea
            placeholder="Body"
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            required
          />
          <select
            value={formData.access_level}
            onChange={(e) =>
              setFormData({ ...formData, access_level: e.target.value })
            }
          >
            <option value="free">Free</option>
            <option value="curious">Curious</option>
            <option value="informed">Informed</option>
            <option value="insider">Insider</option>
          </select>
          <button type="submit">{editId ? 'Update' : 'Create'} Content</button>
        </form>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="sort">Sort by: </label>
          <select
            id="sort"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as typeof sortMode)}
          >
            <option value="level-asc">Access Level ↑</option>
            <option value="level-desc">Access Level ↓</option>
            <option value="title-asc">Title A–Z</option>
            <option value="title-desc">Title Z–A</option>
          </select>
        </div>

        <ul>
          {sortedList.map((item) => (
            <li key={item.id} className="content-item">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <small>({item.access_level})</small>
              <div className="actions">
                <button onClick={() => handleEdit(item)}>✏️ Edit</button>
                <button onClick={() => handleDelete(item.id)}>❌ Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </>
  );
};

export default AdminPanel;
