// controllers/song.controller.js
const Song = require('../models/songsModel');

exports.listSongs = async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: songs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching songs',
      error: error.message
    });
  }
};