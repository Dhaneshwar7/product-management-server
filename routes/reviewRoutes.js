const express = require('express');
const {
	createReview,
	updateReview,
	deleteReview,
} = require('../controllers/reviewController');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();

// ----- Review Routes  ------
router.post('/create-review/:productId', isAuthenticated, createReview);

// router.patch('/update-review', isAuthenticated, updateReview);

// router.delete('/delete-review', isAuthenticated, deleteReview);

module.exports = router;
