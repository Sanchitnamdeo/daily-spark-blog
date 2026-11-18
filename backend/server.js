const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = 'thiranex_secret_key';

// In-Memory Database (Arrays)
let users = [];
let posts = [];

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = users.find(u => u.email === email);
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { id: Date.now().toString(), username, email, password: hashedPassword };
        users.push(newUser);
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = users.find(u => u.email === email);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- TOKEN VERIFICATION MIDDLEWARE ---
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

// --- POSTS ROUTES ---
app.get('/api/posts', (req, res) => {
    res.json(posts);
});

app.post('/api/posts', verifyToken, (req, res) => {
    try {
        const { title, content } = req.body;
        const newPost = {
            _id: Date.now().toString(),
            title,
            content,
            author: req.user.id,
            authorName: req.user.username,
            comments: [],
            createdAt: new Date()
        };
        posts.unshift(newPost);
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/posts/:id', verifyToken, (req, res) => {
    try {
        const postIndex = posts.findIndex(p => p._id === req.params.id);
        if (postIndex === -1) return res.status(404).json({ error: 'Post not found' });
        
        if (posts[postIndex].author !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        posts.splice(postIndex, 1);
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/posts/:id/comments', verifyToken, (req, res) => {
    try {
        const { text } = req.body;
        const post = posts.find(p => p._id === req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        const newComment = {
            _id: Date.now().toString(),
            user: req.user.id,
            username: req.user.username,
            text,
            createdAt: new Date()
        };
        post.comments.push(newComment);
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running smoothly on port ${PORT} (Without MongoDB)`));