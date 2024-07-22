const exp = require('constants');
const { catchAsyncError } = require('../middlewares/catchAsyncError');
const Admin = require('../models/adminModel');
const multer = require('multer');
const ErrorHandler = require('../utils/ErrorHandlers');
const { sendtoken } = require('../utils/SendToken');
const { sendmail } = require('../utils/nodemailer');
const path = require('path');
const Product = require('../models/productModel');
const imageKit = require('../utils/imageKit').uploadImagekit();

/* ------------ Product Controllers ---------- */

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
exports.productCreate = catchAsyncError(async (req, res, next) => {
	const admin = await Admin.findById(req.id).exec();
	const product = await new Product(req.body);
	product.admin = admin._id;
	admin.products.push(product._id);
	await product.save();
	await admin.save();
	res.status(201).json({ success: true, product });
});

/* -----------  ADMIN PRODUCT VIEWALL  -----------*/
exports.productViewAll = catchAsyncError(async (req, res, next) => {
	const { products } = await Admin.findById(req.id).populate('products').exec();
	res.status(200).json({ success: true, products });
});

/* -----------  ADMIN VIEW ONEPRODUCT  -----------*/
exports.productView = catchAsyncError(async (req, res, next) => {
	const product = await Product.findById(req.params.productId).exec();
	if (!product) {
		return next(new ErrorHandler('Product not found', 404));
	}
	res.status(200).json({ success: true, product });
});

/* -----------  ADMIN PRODUCT UPDATE  -----------*/
exports.productUpdate = catchAsyncError(async (req, res, next) => {
	const product = await Product.findByIdAndUpdate(
		req.params.productId,
		req.body
	).exec();

	res
		.status(200)
		.json({ success: true, message: 'Product Updated Successfully!', product });
});

/* -----------  ADMIN PRODUCT DELETE  -----------*/
exports.productDelete = catchAsyncError(async (req, res, next) => {
	const product = await req.params.productId;
	try {
		const deletedProduct = await Product.findByIdAndDelete(product);
		if (!deletedProduct)
			return next(new ErrorHandler('Product not Found', 404));
		res.status(200).json({
			status: true,
			message: 'Product Deleted Successfull',
			deletedProduct,
		});
	} catch (error) {
		res.status(500).json({
			status: false,
			message: 'Internal server issue',
		});
	}
});

/* -----------  ADMIN PRODUCT IMAGES  -----------*/
exports.productImage = catchAsyncError(async (req, res, next) => {
	const product = await Product.findById(req.params.id).exec();

	if (!product) {
		return next(new ErrorHandler('Product not found', 404));
	}
	const file = req.files.image;
	if (!file) {
		return next(new ErrorHandler('NO File uploaded', 500));
	}
	const modifiedName = `productImage-url-${Date.now()}${path.extname(
		file.name
	)}`;

	// Delete the existing file if it exists
	if (product.productImageUrl && product.productImageUrl.fileId) {
		try {
			await imageKit.deleteFile(product.productImageUrl.fileId);
		} catch (error) {
			console.error('Error deleting existing file:', error);
		}
	}

	// Upload new file to ImageKit
	try {
		const { fileId, url } = await imageKit.upload({
			file: file.data,
			fileName: modifiedName,
		});

		product.productImageUrl = { fileId, url };
		await product.save();

		res.status(200).json({
			success: true,
			message: 'Profile Picture Updated Successfully!',
		});
	} catch (error) {
		console.error('Error uploading to ImageKit:', error);
		return res.status(500).json({ message: 'Error uploading file' });
	}
});

/* -----------  ADMIN PRODUCT FILTER  -----------*/
exports.productFilter = catchAsyncError(async (req, res, next) => {
	const {
		page = 1,
		limit = 10,
		priceRange,
		quantity,
		startDate,
		endDate,
	} = req.query;
	const query = {};
	// Filtering by Query values
	if (priceRange) {
		const [minPrice, maxPrice] = priceRange.split('-').map(Number);
		query.price = { $gte: minPrice, $lte: maxPrice };
	}
	if (quantity) {
		query.quantity = { $gte: Number(quantity) };
	}
	if (startDate && endDate) {
		query.manufactured = { $gte: new Date(startDate), $lte: new Date(endDate) };
	}

	// Pagination
	const skip = (page - 1) * limit;
	const products = await Product.find(query).skip(skip).limit(Number(limit));

	const totalProducts = await Product.countDocuments(query);
	const totalPages = Math.ceil(totalProducts / limit);

	res.status(200).json({
		success: true,
		data: products,
		pagination: {
			totalProducts,
			totalPages,
			currentPage: Number(page),
			limit: Number(limit),
		},
	});
});

/* -----------  ADMIN PRODUCT Many  -----------*/
exports.productsCreateMany = catchAsyncError(async (req, res, next) => {
	const admin = await Admin.findById(req.id).exec();
	if (!admin) {
		return next(new ErrorHandler('Admin not found', 404));
	}
	// Ensure req.body is an array of products
	const productsData = Array.isArray(req.body) ? req.body : [req.body];

	// Insert many products at once
	const products = await Product.insertMany(productsWithAdmin);

	// Add the newly created product IDs to the admin's products array
	admin.products.push(...products.map(product => product._id));

	// Map through the productsData and add the admin reference to each product
	const productsWithAdmin = productsData.map(productData => ({
		...productData,
		admins: admin._id,
	}));

	await admin.save();

	res.status(201).json({ success: true, products });
});

exports.productSearch = catchAsyncError(async (req, res, next) => {
	const { name, minPrice, maxPrice, minQuantity, maxQuantity, status } =
		req.query;

	// Assuming req.id is the ID of the currently logged-in admin
	const adminId = req.id;

	// Build the search query
	let query = { admins: adminId };

	if (name) {
		query.productName = { $regex: name, $options: 'i' }; // Case-insensitive search
	}
	if (minPrice) {
		query.price = { ...query.price, $gte: Number(minPrice) };
	}
	if (maxPrice) {
		query.price = { ...query.price, $lte: Number(maxPrice) };
	}
	if (minQuantity) {
		query.quantity = { ...query.quantity, $gte: Number(minQuantity) };
	}
	if (maxQuantity) {
		query.quantity = { ...query.quantity, $lte: Number(maxQuantity) };
	}
	if (status) {
		query.status = status;
	}

	try {
		const products = await Product.find(query)
			.populate({
				path: 'admins',
				match: { _id: adminId },
			})
			.exec();
		res.status(200).json({ success: true, products });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
});
exports.productCreateFull = catchAsyncError(async (req, res, next) => {
	const admin = await Admin.findById(req.id).exec();
	const product = await new Product(req.body).save();
	product.admin = admin._id;

	// Handle image upload if available
	if (req.files && req.files.image) {
		const file = req.files.image;
		const modifiedName = `productImage-url-${Date.now()}${path.extname(
			file.name
		)}`;
		// Delete the existing file if it exists (optional)
		if (product.productImageUrl && product.productImageUrl.fileId) {
			try {
				await imageKit.deleteFile(product.productImageUrl.fileId);
			} catch (error) {
				console.error('Error deleting existing file:', error);
			}
		}
		try {
			const { fileId, url } = await imageKit.upload({
				file: file.data,
				fileName: modifiedName,
			});
			product.productImageUrl = { fileId, url };
		} catch (error) {
			console.error('Error uploading to ImageKit:', error);
			return next(new ErrorHandler('Error uploading file', 500));
		}
	}

	admin.products.push(product._id);
	await Promise.all([product.save(), admin.save()]);
	res.status(201).json({
		success: true,
		message: 'Product Added Successfully',
		product,
	});
});
