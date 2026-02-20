// controllers/campaignController.js
const db = require('../config/db');

// Get all campaigns
const getCampaigns = async (req, res) => {
  try {
    const campaignsRef = db.collection('campaigns');
    const snapshot = await campaignsRef.get();
    
    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const campaigns = [];
    snapshot.forEach(doc => {
      campaigns.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new campaign
const createCampaign = async (req, res) => {
  try {
    const newCampaign = req.body;
    const docRef = await db.collection('campaigns').add(newCampaign);
    res.status(201).json({ id: docRef.id, ...newCampaign });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getCampaigns, createCampaign };