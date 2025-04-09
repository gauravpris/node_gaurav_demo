// routes/song.routes.js
const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');

// Public endpoint to get all songs
router.get('/', songController.listSongs);

module.exports = router;