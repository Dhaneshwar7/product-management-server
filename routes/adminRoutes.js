const express = require('express');
const { homepage } = require('../controllers/adminControllers');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();

// GET /
router.get('/', homepage);

// GET /admin

module.exports = router;
