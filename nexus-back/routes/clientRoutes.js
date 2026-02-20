const express = require('express');
const router = express.Router();
const { getClients, createClient } = require('../controllers/clientController');

router.route('/')
  .get(getClients)
  .post(createClient);

module.exports = router;