// controllers/messageController.js
const db = require('../config/db');

// Get all messages (ordered by time)
const getMessages = async (req, res) => {
  try {
    const messagesRef = db.collection('messages');
    // Assuming you will save a 'timestamp' or 'time' field when creating
    const snapshot = await messagesRef.orderBy('time', 'asc').get();
    
    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const messages = [];
    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new message
const createMessage = async (req, res) => {
  try {
    const newMessage = {
      ...req.body,
      time: new Date().toISOString() // Auto-generate timestamp if not provided
    };
    const docRef = await db.collection('messages').add(newMessage);
    res.status(201).json({ id: docRef.id, ...newMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getMessages, createMessage };