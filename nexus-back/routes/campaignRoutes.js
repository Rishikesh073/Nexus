const express = require('express');
const router = express.Router();
const { getCampaigns, createCampaign } = require('../controllers/campaignController');

router.route('/')
  .get(getCampaigns)
  .post(createCampaign);

module.exports = router;