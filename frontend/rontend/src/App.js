import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [posts, setPosts] = useState([]);
  const [view, setView] = useState('home');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    fetchPosts();
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
      await axios.post(`${API}/posts`, { title, content }, {
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
    try {
      await axios.delete(`${API}/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
    } catch (err) {
      alert('Unauthorized to delete this post');
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

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <h1 style={styles.logo} onClick={() => setView('home')}>Thiranex Blog</h1>
        <div>
          <button style={styles.navBtn} onClick={() => setView('home')}>Home</button>
          {token ? (
            <>
              <button style={styles.navBtn} onClick={() => setView('create')}>+ New Post</button>
              <span style={styles.welcome}>Hello, {user?.username}</span>
              <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button style={styles.navBtn} onClick={() => setView('login')}>Login</button>
              <button style={styles.primaryBtn} onClick={() => setView('register')}>Register</button>
            </>
          )}
        </div>
      </nav>

      <div style={styles.content}>
        {view === 'home' && (
          <div>
            <h2 style={styles.heading}>Recent Blog Posts</h2>
            {posts.length === 0 ? <p style={styles.text}>No posts available yet. Create one!</p> : null}
            {posts.map(post => (
              <div key={post._id} style={styles.card}>
                <h3 style={styles.postTitle}>{post.title}</h3>
                <p style={styles.author}>By {post.authorName} • {new Date(post.createdAt).toLocaleDateString()}</p>
                <p style={styles.postContent}>{post.content}</p>

                {token && post.author === user?.id && (
                  <button style={styles.deleteBtn} onClick={() => handleDeletePost(post._id)}>Delete Post</button>
                )}

                <div style={styles.commentSection}>
                  <h4>Comments ({post.comments.length})</h4>
                  {post.comments.map(c => (
                    <div key={c._id} style={styles.commentBox}>
                      <strong>{c.username}: </strong> {c.text}
                    </div>
                  ))}

                  {token ? (
                    <div style={styles.commentForm}>
                      <input 
                        type="text" 
                        placeholder="Write a comment..." 
                        value={commentText[post._id] || ''} 
                        onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
                        style={styles.commentInput}
                      />
                      <button style={styles.commentBtn} onClick={() => handleAddComment(post._id)}>Post</button>
                    </div>
                  ) : (
                    <p style={styles.loginPrompt}>Login to write a comment.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'login' && (
          <div style={styles.formCard}>
            <h2>Login to Your Account</h2>
            <form onSubmit={handleLogin}>
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} required />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} required />
              <button type="submit" style={styles.submitBtn}>Login</button>
            </form>
          </div>
        )}

        {view === 'register' && (
          <div style={styles.formCard}>
            <h2>Create an Account</h2>
            <form onSubmit={handleRegister}>
              <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={styles.input} required />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} required />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} required />
              <button type="submit" style={styles.submitBtn}>Register</button>
            </form>
          </div>
        )}

        {view === 'create' && (
          <div style={styles.formCard}>
            <h2>Create New Blog Post</h2>
            <form onSubmit={handleCreatePost}>
              <input type="text" placeholder="Blog Title" value={title} onChange={e => setTitle(e.target.value)} style={styles.input} required />
              <textarea placeholder="Write your content here..." value={content} onChange={e => setContent(e.target.value)} style={{ ...styles.input, height: '150px' }} required />
              <button type="submit" style={styles.submitBtn}>Publish Post</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: '#f8f9fa', minHeight: '100vh', margin: 0, padding: 0 },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2c3e50', color: '#fff', padding: '15px 30px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  logo: { margin: 0, fontSize: '22px', cursor: 'pointer', fontWeight: 'bold' },
  navBtn: { background: 'transparent', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer', marginLeft: '20px' },
  primaryBtn: { backgroundColor: '#3498db', border: 'none', color: '#fff', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', marginLeft: '20px', fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#e74c3c', border: 'none', color: '#fff', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', marginLeft: '20px' },
  welcome: { marginLeft: '20px', color: '#1abc9c', fontWeight: 'bold' },
  content: { maxWidth: '800px', margin: '30px auto', padding: '0 20px' },
  heading: { color: '#2c3e50', marginBottom: '20px' },
  card: { backgroundColor: '#fff', padding: '25px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  postTitle: { margin: '0 0 10px 0', color: '#2c3e50', fontSize: '24px' },
  author: { color: '#7f8c8d', fontSize: '13px', marginBottom: '15px' },
  postContent: { color: '#333', lineHeight: '1.6', fontSize: '16px' },
  deleteBtn: { backgroundColor: '#e74c3c', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', color: '#fff' },
  commentSection: { marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' },
  commentBox: { backgroundColor: '#f1f2f6', padding: '8px 12px', borderRadius: '4px', marginBottom: '8px', fontSize: '14px' },
  commentForm: { display: 'flex', marginTop: '10px' },
  commentInput: { flex: 1, padding: '8px', borderRadius: '4px 0 0 4px', border: '1px solid #ccc', outline: 'none' },
  commentBtn: { backgroundColor: '#2ecc71', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '0 4px 4px 0', cursor: 'pointer' },
  loginPrompt: { color: '#888', fontSize: '13px', fontStyle: 'italic', marginTop: '10px' },
  formCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', maxWidth: '400px', margin: '50px auto' },
  input: { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '15px' },
  submitBtn: { width: '100%', backgroundColor: '#3498db', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  text: { color: '#666' }
};

export default App;