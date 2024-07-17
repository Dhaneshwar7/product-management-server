const express = require('express');
const {
	homepage,
	currentAdmin,
	adminSignUp,
    adminSignIn,
    adminSignOut,
    adminSendLinkMail,
    adminForgetLink,
    adminResetPassword,
    adminUpdate,
    adminAvatar,
    deleteAdmin,
} = require('../controllers/adminControllers');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();

// GET /
router.get('/', homepage);

// GET /admin ✅
router.post('/admin', isAuthenticated, currentAdmin);

// POST /admin/signup ✅
router.post('/admin/signup', adminSignUp);

// POST /admin/signin ✅
router.post('/admin/signin', adminSignIn);

// // GET /admin/signout ✅
router.get('/admin/signout', isAuthenticated, adminSignOut);

// // POST /admin/update/:adminId ✅
router.post('/admin/update/:id', isAuthenticated, adminUpdate);

// // POST /admin/sendlink-mail
router.post('/admin/sendlink-mail', adminSendLinkMail);

// // GET /admin/forget-link/:adminId ✅
router.get('/admin/forget-link/:id', adminForgetLink);

// // POST /admin/reset-password/:adminId   ✅
router.post('/admin/reset-password/:id', isAuthenticated, adminResetPassword);

// // POST /admin/avatar/:adminId ✅
router.post('/admin/avatar/:id', isAuthenticated, adminAvatar);

// /* ---------- Delete Admin * -------- */
// // POST /admin/delete/:adminId  ✅
router.delete('/admin/delete/:adminId', isAuthenticated, deleteAdmin);

module.exports = router;
