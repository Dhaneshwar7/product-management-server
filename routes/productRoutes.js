const express = require('express');
const multer = require('multer');

const {
	productCreate,
	productView,
	productViewAll,
	productUpdate,
	productDelete,
	productImage,
	productFilter,
	productsCreateMany,
	productSearch,
	productCreateFull,
	renderAllProducts,
} = require('../controllers/productController');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();

/* ------------ Product Routes ---------- */

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/'); // Change 'uploads/' to your desired directory
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`); // Create unique filenames
	},
});

const upload = multer({ storage });

/* -----------  ADMIN PRODUCT CREATE  -----------*/
// POST /admin/product/view ✅
router.get('/render-allproducts', renderAllProducts);

// POST /admin/product/create  ✅
router.post('/create', isAuthenticated, productCreate);

/* -----------  ADMIN PRODUCT CREATE Many  -----------*/
// POST /admin/product/create-many  ✅
router.post('/create-many', isAuthenticated, productsCreateMany);

// POST /admin/product/view ✅
router.get('/viewall', isAuthenticated, productViewAll);

// POST /admin/product/:productId ✅
router.get('/viewproduct/:productId', isAuthenticated, productView);

// PUT /admin/product/update/:productId ✅
router.put('/update/:productId', isAuthenticated, productUpdate);

// Delete /admin/product/delete/:productId ✅
router.delete('/delete/:productId', isAuthenticated, productDelete);

// POST /admin/product/:productId ✅
router.post('/product-image/:id', isAuthenticated, productImage);

// GET /admin/product/?query Pagination and Filtering Routes Additional
router.get('/product-filter/', isAuthenticated, productFilter);

// Pagination and Filtering Routes Additionall
router.get('/search', isAuthenticated, productSearch);

// POST /admin/product/create  ✅
router.post(
	'/create-product',
	isAuthenticated,
	productCreateFull
);

module.exports = router;
