const express = require('express');
const { isAuthenticated } = require('../middlewares/auth');
const {
	currentUser,
	homepage,
	userSignIn,
	userSignUp,
	userSignOut,
	userUpdate,
	userSendLinkMail,
	userForgetLink,
	userResetPassword,
	userAvatar,
	deleteUser,
} = require('../controllers/userControllers');

const router = express.Router();

// app.use('/api/user', require('./routes/userRoutes'));

// GET /
router.get('/home', homepage);

// GET /api/user/current  ✅
router.get('/current', isAuthenticated, currentUser);

// POST /user/signup ✅
router.post('/signup', userSignUp);

// POST User/signin ✅
router.post('/signin', userSignIn);

// // GET User/signout ✅
router.post('/signout', isAuthenticated, userSignOut);

// // POST //update/:adminId ✅
router.post('/update/:id', isAuthenticated, userUpdate);

// // POST /sendlink-mail
router.post('/sendlink-mail', userSendLinkMail);

// // GET /forget-link/:adminId ✅
router.get('/forget-link/:id', userForgetLink);

// // POST /reset-password/:adminId   ✅
router.post('/reset-password/:id', isAuthenticated, userResetPassword);

// // POST /avatar/:adminId ✅
router.post('/avatar/:id', isAuthenticated, userAvatar);

// /* ---------- Delete Admin * -------- */
// // POST /user/delete/:adminId  ✅
router.delete('/user/delete/:adminId', isAuthenticated, deleteUser);

module.exports = router;
