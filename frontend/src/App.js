import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80"
];

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [posts, setPosts] = useState([]);
  const [view, setView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentSlide, setCurrentSlide] = useState(0);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API}/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setView('home');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/auth/register`, { username, email, password });
      alert('Registration successful! Please login.');
      setView('login');
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.clear();
    setView('home');
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/posts`, { title, content, category }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitle('');
      setContent('');
      setView('home');
      fetchPosts();
    } catch (err) {
      alert('Failed to create post');
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await axios.delete(`${API}/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
    } catch (err) {
      alert('Unauthorized');
    }
  };

  const handleAddComment = async (postId) => {
    try {
      const text = commentText[postId];
      if (!text) return;
      await axios.post(`${API}/posts/${postId}/comments`, { text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommentText({ ...commentText, [postId]: '' });
      fetchPosts();
    } catch (err) {
      alert('Please login to comment');
    }
  };

  const filteredPosts = selectedCategory === 'All' 
    ? posts 
    : posts.filter(p => p.category === selectedCategory);

  return (
    <div style={styles.container}>
      {/* Sticky Glassmorphism Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navLeft} onClick={() => setView('home')}>
          <div style={styles.logoIcon}>⚡</div>
          <span style={styles.logoText}>Daily Spark</span>
        </div>
        <div style={styles.navRight}>
          <button style={styles.navLink} onClick={() => setView('home')}>Discover</button>
          {token ? (
            <>
              <button style={styles.primaryBtn} onClick={() => setView('create')}>+ Create Story</button>
              <div style={styles.userBadge}>
                <span style={styles.avatarMini}>{user?.username?.charAt(0).toUpperCase()}</span>
                <span>{user?.username}</span>
              </div>
              <button style={styles.outlineBtn} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button style={styles.navLink} onClick={() => setView('login')}>Sign In</button>
              <button style={styles.primaryBtn} onClick={() => setView('register')}>Get Started</button>
            </>
          )}
        </div>
      </nav>

      <div style={styles.wrapper}>
        {view === 'home' && (
          <div>
            {/* Dynamic Sliding Hero Section */}
            <div style={styles.heroSlider}>
              {HERO_IMAGES.map((img, idx) => (
                <div 
                  key={idx} 
                  style={{
                    ...styles.slide, 
                    backgroundImage: `linear-gradient(to right, rgba(10, 15, 30, 0.9), rgba(15, 23, 42, 0.6)), url(${img})`,
                    opacity: currentSlide === idx ? 1 : 0,
                    zIndex: currentSlide === idx ? 2 : 1
                  }}
                >
                  <div style={styles.slideContent}>
                    <span style={styles.heroBadge}>TRENDING SPOTLIGHT • 2026</span>
                    <h1 style={styles.heroTitle}>Engineering Scalable Systems & Modern Architecture</h1>
                    <p style={styles.heroDesc}>Explore deep-dive technical articles, backend breakthroughs, and UI innovations crafted by developers.</p>
                  </div>
                </div>
              ))}
              <div style={styles.dots}>
                {HERO_IMAGES.map((_, idx) => (
                  <span 
                    key={idx} 
                    style={{
                      ...styles.dot, 
                      backgroundColor: currentSlide === idx ? '#38bdf8' : 'rgba(255,255,255,0.4)'
                    }}
                    onClick={() => setCurrentSlide(idx)}
                  />
                ))}
              </div>
            </div>

            {/* Category Navigation Bar */}
            <div style={styles.filterBar}>
              {['All', 'Engineering', 'AI Trends', 'Web Dev', 'Design', 'Announcements'].map(cat => (
                <button 
                  key={cat} 
                  style={{
                    ...styles.filterTab,
                    color: selectedCategory === cat ? '#38bdf8' : '#94a3b8',
                    borderBottom: selectedCategory === cat ? '2px solid #38bdf8' : '2px solid transparent',
                    fontWeight: selectedCategory === cat ? '700' : '500'
                  }}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Long Scrolling Article Grid */}
            <div style={styles.grid}>
              {filteredPosts.length === 0 ? (
                <div style={styles.emptyCard}>
                  <p style={{ color: '#94a3b8' }}>No articles published yet. Be the first to share your story!</p>
                </div>
              ) : (
                filteredPosts.map((post, index) => (
                  <div key={post._id} style={styles.card}>
                    <div style={styles.cardImageWrapper}>
                      <img 
                        src={HERO_IMAGES[index % HERO_IMAGES.length]} 
                        alt="Thumbnail" 
                        style={styles.cardImg} 
                      />
                      <span style={styles.cardCategory}>{post.category || 'Engineering'}</span>
                    </div>
                    <div style={styles.cardBody}>
                      <div style={styles.cardMeta}>
                        <span>{new Date(post.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>• {Math.ceil((post.content?.length || 100) / 250)} min read</span>
                      </div>
                      <h3 style={styles.cardTitle}>{post.title}</h3>
                      <p style={styles.cardSnippet}>{post.content}</p>

                      <div style={styles.cardFooter}>
                        <div style={styles.authorSection}>
                          <div style={styles.authorCircle}>{post.authorName?.charAt(0).toUpperCase()}</div>
                          <span style={styles.authorName}>{post.authorName}</span>
                        </div>
                        {token && post.author === user?.id && (
                          <button style={styles.deleteBtn} onClick={() => handleDeletePost(post._id)}>Delete</button>
                        )}
                      </div>

                      {/* Interactive Comments Section */}
                      <details style={styles.commentDetails}>
                        <summary style={styles.commentSummary}>Discussion ({post.comments.length})</summary>
                        <div style={styles.commentBoxContainer}>
                          {post.comments.map(c => (
                            <div key={c._id} style={styles.commentItem}>
                              <strong style={{ color: '#38bdf8' }}>{c.username}: </strong> 
                              <span>{c.text}</span>
                            </div>
                          ))}
                          {token ? (
                            <div style={styles.commentInputRow}>
                              <input 
                                type="text" 
                                placeholder="Share your perspective..." 
                                value={commentText[post._id] || ''}
                                onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                                style={styles.commentInput}
                              />
                              <button style={styles.commentPostBtn} onClick={() => handleAddComment(post._id)}>Reply</button>
                            </div>
                          ) : (
                            <p style={styles.loginHint}>Sign in to join the discussion.</p>
                          )}
                        </div>
                      </details>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {view === 'login' && (
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>Welcome Back</h2>
            <p style={styles.formSub}>Enter your credentials to access your Daily Spark account</p>
            <form onSubmit={handleLogin}>
              <label style={styles.label}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} required />
              <label style={styles.label}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} required />
              <button type="submit" style={styles.submitBtn}>Sign In</button>
            </form>
          </div>
        )}

        {view === 'register' && (
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>Join Daily Spark</h2>
            <p style={styles.formSub}>Create a creator profile and start publishing stories</p>
            <form onSubmit={handleRegister}>
              <label style={styles.label}>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={styles.input} required />
              <label style={styles.label}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} required />
              <label style={styles.label}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} required />
              <button type="submit" style={styles.submitBtn}>Create Account</button>
            </form>
          </div>
        )}

        {view === 'create' && (
          <div style={styles.formContainerWide}>
            <h2 style={styles.formTitle}>Publish a New Story</h2>
            <form onSubmit={handleCreatePost}>
              <label style={styles.label}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={styles.input}>
                <option value="Engineering">Engineering</option>
                <option value="AI Trends">AI Trends</option>
                <option value="Web Dev">Web Dev</option>
                <option value="Design">Design</option>
                <option value="Announcements">Announcements</option>
              </select>
              <label style={styles.label}>Article Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} style={styles.input} placeholder="Catchy title for your story..." required />
              <label style={styles.label}>Full Content / Story</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} style={styles.textarea} placeholder="Write your thoughts here..." required />
              <button type="submit" style={styles.submitBtn}>Publish to World</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: "Inter, system-ui, -apple-system, sans-serif", backgroundColor: '#0b0f19', minHeight: '100vh', color: '#f8fafc', margin: 0, padding: 0 },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 48px', position: 'sticky', top: 0, zIndex: 1000 },
  navLeft: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
  logoIcon: { fontSize: '18px', backgroundColor: '#38bdf8', color: '#0f172a', padding: '6px 10px', borderRadius: '8px', fontWeight: 'bold' },
  logoText: { fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff' },
  navRight: { display: 'flex', alignItems: 'center', gap: '20px' },
  navLink: { background: 'none', border: 'none', fontSize: '14px', color: '#94a3b8', cursor: 'pointer', fontWeight: '500', transition: 'color 0.2s' },
  primaryBtn: { backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '9px 18px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 4px 14px rgba(56,189,248,0.3)' },
  outlineBtn: { background: 'none', border: '1px solid rgba(239,68,68,0.4)', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', color: '#f87171' },
  userBadge: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#e2e8f0', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px' },
  avatarMini: { width: '24px', height: '24px', backgroundColor: '#38bdf8', color: '#0f172a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' },
  wrapper: { maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' },
  heroSlider: { position: 'relative', height: '420px', borderRadius: '20px', overflow: 'hidden', marginBottom: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' },
  slide: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', padding: '0 60px', transition: 'opacity 1s ease-in-out' },
  slideContent: { maxWidth: '700px', zIndex: 3 },
  heroBadge: { backgroundColor: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px' },
  heroTitle: { fontSize: '38px', fontWeight: '800', color: '#fff', margin: '16px 0', lineHeight: '1.25' },
  heroDesc: { fontSize: '16px', color: '#cbd5e1', lineHeight: '1.6' },
  dots: { position: 'absolute', bottom: '20px', right: '30px', display: 'flex', gap: '8px', zIndex: 10 },
  dot: { width: '10px', height: '10px', borderRadius: '50%', cursor: 'pointer', transition: 'background-color 0.3s' },
  filterBar: { display: 'flex', gap: '30px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '40px', overflowX: 'auto', paddingBottom: '4px' },
  filterTab: { background: 'none', border: 'none', padding: '12px 4px', fontSize: '15px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.2s' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '30px' },
  card: { backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, box-shadow 0.3s', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
  cardImageWrapper: { position: 'relative', height: '200px', overflow: 'hidden' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' },
  cardCategory: { position: 'absolute', top: '12px', left: '12px', backgroundColor: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)', color: '#38bdf8', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' },
  cardBody: { padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 },
  cardMeta: { display: 'flex', gap: '10px', fontSize: '12px', color: '#94a3b8', marginBottom: '10px' },
  cardTitle: { fontSize: '20px', fontWeight: '700', color: '#f8fafc', marginBottom: '12px', lineHeight: '1.4' },
  cardSnippet: { fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '20px', flex: 1 },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' },
  authorSection: { display: 'flex', alignItems: 'center', gap: '10px' },
  authorCircle: { width: '30px', height: '30px', backgroundColor: '#475569', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold' },
  authorName: { fontSize: '13px', fontWeight: '600', color: '#cbd5e1' },
  deleteBtn: { background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  commentDetails: { marginTop: '16px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '12px' },
  commentSummary: { fontSize: '13px', color: '#94a3b8', cursor: 'pointer', fontWeight: '600' },
  commentBoxContainer: { marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' },
  commentItem: { backgroundColor: 'rgba(15,23,42,0.5)', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', color: '#cbd5e1' },
  commentInputRow: { display: 'flex', gap: '8px', marginTop: '10px' },
  commentInput: { flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0f172a', color: '#fff', fontSize: '13px', outline: 'none' },
  commentPostBtn: { backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '700' },
  loginHint: { fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginTop: '8px' },
  formContainer: { maxWidth: '440px', margin: '60px auto', backgroundColor: '#1e293b', padding: '40px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' },
  formContainerWide: { maxWidth: '700px', margin: '40px auto', backgroundColor: '#1e293b', padding: '40px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' },
  formTitle: { fontSize: '26px', fontWeight: '800', marginBottom: '8px', color: '#fff' },
  formSub: { fontSize: '14px', color: '#94a3b8', marginBottom: '24px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0f172a', color: '#fff', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box', outline: 'none' },
  textarea: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0f172a', color: '#fff', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box', height: '180px', outline: 'none', resize: 'vertical' },
  submitBtn: { width: '100%', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(56,189,248,0.3)' },
  emptyCard: { gridColumn: '1 / -1', textAlign: 'center', padding: '60px', backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }
};

export default App;