// routes/api.js
const express = require('express');
const router = express.Router();

// Import Controllers
const { getCampaigns, createCampaign } = require('../controllers/campaignController');
const { getClients, createClient } = require('../controllers/clientController');
const { getTasks, createTask, updateTask } = require('../controllers/taskController');
const { getMessages, createMessage } = require('../controllers/messageController');

const { createServiceRequest, getServiceRequests, updateServiceRequest } = require('../controllers/serviceRequestController');
const { approveServiceRequest } = require('../controllers/serviceRequestController'); // <-- Import the new controller function
// --- ROUTES ---

// Campaigns
router.get('/campaigns', getCampaigns);
router.post('/campaigns', createCampaign);

// Clients
router.get('/clients', getClients);
router.post('/clients', createClient);

// Tasks
router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);

// Messages
router.get('/messages', getMessages);
router.post('/messages', createMessage);

// Service Requests (AI Intake) <-- New Routes

router.get('/service-requests', getServiceRequests);
router.post('/service-requests', createServiceRequest);
router.put('/service-requests/:id', updateServiceRequest);
router.put('/service-requests/:id/approve', approveServiceRequest);
module.exports = router;