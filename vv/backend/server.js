const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { initializeSocket } = require('./socket');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Make io available to routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/provider', require('./routes/provider'));
app.use('/api/services', require('./routes/services'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/chat', require('./routes/chat'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.IO initialized');
});
