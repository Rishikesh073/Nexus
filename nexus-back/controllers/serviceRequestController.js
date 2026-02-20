// controllers/serviceRequestController.js
const db = require('../config/db');

// @route   POST /api/service-requests
// @desc    Create a new AI service request (Submitted by Client)
const approveServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const requestRef = db.collection('serviceRequests').doc(id);
    
    // 1. Update the status to 'approved'
    await requestRef.update({
      status: 'approved',
      approvedAt: new Date().toISOString()
    });
    
    // 2. YOUR TEAMMATE'S AI TRIGGER GOES HERE
    // e.g., triggerAiAgent(id);

    res.status(200).json({ message: 'AI Agent Deployed Successfully', id });
  } catch (error) {
    console.error("Error approving service request:", error);
    res.status(500).json({ error: error.message });
  }
};

const createServiceRequest = async (req, res) => {
  try {
    const newRequest = {
      ...req.body,
      status: req.body.status || 'pending_admin_review',
      createdAt: new Date().toISOString()
    };
    
    // Save to Firestore 'serviceRequests' collection
    const docRef = await db.collection('serviceRequests').add(newRequest);
    res.status(201).json({ id: docRef.id, ...newRequest });
  } catch (error) {
    console.error("Error creating service request:", error);
    res.status(500).json({ error: error.message });
  }
};

// @route   GET /api/service-requests
// @desc    Get all service requests (Viewed by Admin)
const getServiceRequests = async (req, res) => {
  try {
    const requestsRef = db.collection('serviceRequests');
    // Order by newest first
    const snapshot = await requestsRef.orderBy('createdAt', 'desc').get();
    
    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const requests = [];
    snapshot.forEach(doc => {
      requests.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching service requests:", error);
    res.status(500).json({ error: error.message });
  }
};

// @route   PUT /api/service-requests/:id
// @desc    Update a service request status (e.g. Admin approves it)
const updateServiceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const requestRef = db.collection('serviceRequests').doc(id);
    await requestRef.update(updates);
    
    res.status(200).json({ message: 'Service request updated successfully', id, ...updates });
  } catch (error) {
    console.error("Error updating service request:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createServiceRequest, getServiceRequests, updateServiceRequest, approveServiceRequest };