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


exports.productViewAll = catchAsyncError(async (req, res, next) => {});


exports.productView = catchAsyncError(async (req, res, next) => {});
exports.productUpdate = catchAsyncError(async (req, res, next) => {});
exports.productDelete = catchAsyncError(async (req, res, next) => {});
exports.productImage = catchAsyncError(async (req, res, next) => {});

