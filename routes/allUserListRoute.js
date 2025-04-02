const express = require("express");
const { authenticate } = require('../middlewares/auth');
const { allUser } = require("../controllers/allUserListController");
const router = express.Router();

router.get('',authenticate,allUser);

module.exports = router;