// server.js
const express = require('express');
const cors = require('cors');


const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Import your routes file
const apiRoutes = require('./routes/api');

// Mount the routes and apply the '/api' prefix to all of them
app.use('/api', apiRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('NEXUS API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});