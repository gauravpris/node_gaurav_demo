const express = require("express");
const { authenticate } = require('../middlewares/auth');
const { getProfile } = require("../controllers/profileController");
const router = express.Router();

router.get('',authenticate,getProfile);

module.exports = router;