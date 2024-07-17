const exp = require('constants');
const { catchAsyncError } = require('../middlewares/catchAsyncError');
const Admin = require('../models/adminModel');
const ErrorHandler = require('../utils/ErrorHandlers');
const { sendtoken } = require('../utils/SendToken');
const { sendmail } = require('../utils/nodemailer');
const path = require('path');
const Product = require('../models/productModel');
const imageKit = require('../utils/imageKit').uploadImagekit();

/* ------------ Product Controllers ---------- */

/* -----------  ADMIN PRODUCT CREATE  -----------*/
exports.productCreate = catchAsyncError(async (req, res, next) => {
	const admin = await Admin.findById(req.id).exec();
	const product = await new Product(req.body);
	product.admins = admin._id;
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
	const file = req.files.productImg;
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
exports.productFilter = catchAsyncError(async (req, res, next) => {})