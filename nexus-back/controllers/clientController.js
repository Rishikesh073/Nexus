// controllers/clientController.js
const db = require('../config/db');

// Get all clients
const getClients = async (req, res) => {
  try {
    const clientsRef = db.collection('clients');
    const snapshot = await clientsRef.get();
    
    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const clients = [];
    snapshot.forEach(doc => {
      clients.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new client
const createClient = async (req, res) => {
  try {
    const newClient = req.body;
    const docRef = await db.collection('clients').add(newClient);
    res.status(201).json({ id: docRef.id, ...newClient });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getClients, createClient };