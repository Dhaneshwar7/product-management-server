const express = require('express');
const { productCreate, productView, productViewAll, productUpdate, productDelete, productImage } = require('../controllers/productController');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();

/* ------------ Product Routes ---------- */

/* -----------  ADMIN PRODUCT CREATE  -----------*/
// POST /admin/product/create
router.post('/create', isAuthenticated, productCreate);

// POST /admin/product/view
router.get('/viewall', isAuthenticated, productViewAll);

// POST /admin/product/:productId
router.get('/viewproduct/:productId', isAuthenticated, productView);

// PUT /admin/product/update/:productId
router.put('/update/:productId', isAuthenticated, productUpdate);

// Delete /admin/product/delete/:productId
router.delete('/delete/:productId', isAuthenticated, productDelete);

// POST /admin/product/:productId
router.post('/avatar/:productId', isAuthenticated, productImage);

module.exports = router;
