const express = require('express');
const { createProduct } = require('../controllers/productController');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();

/* ------------ Product Routes ---------- */

/* -----------  ADMIN PRODUCT CREATE  -----------*/
// POST /admin/product/create
router.post('/admin/product/create', isAuthenticated, productCreate);

// POST /admin/product/view
router.get('/admin/product/viewall', isAuthenticated, productViewAll);


// PUT /admin/product/update
router.put('/admin/product/update', isAuthenticated, productUpdate);


// Delete /admin/product/update
router.delete('/admin/product/delete', isAuthenticated, productDelete
);



module.exports = router;
