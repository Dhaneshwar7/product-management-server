const { catchAsyncError } = require('../middlewares/catchAsyncError');
const Product = require('../models/productModel');
const User = require('../models/userSchema');
const ErrorHandler = require('../utils/ErrorHandlers');
const path = require('path');

/* -----------  Review creating Details   -----------*/
exports.createReview = catchAsyncError(async (req, res, next) => {
	const { rating, review } = req.body;
	const productId = req.params.productId;
	const userId = req.id;
	const product = await Product.findById(productId);
	if (!product) {
		return next(new ErrorHandler('Product not Found', 404));
	}
	const user = await User.findById(userId);
	if (!user) {
		return next(new ErrorHandler('User Not Found', 404));
	}
	const existingReview = await product.reviews.find(
		review => review.user.toString() === userId.toString()
	);
	if (existingReview) {
		return next(new ErrorHandler('Your Review is alredy don for this product'));
	}
	const newReview = {
		product: productId,
		user: userId,
		name: user.firstname,
		rating: Number(rating),
		review,
	};
	product.reviews = [...product.reviews, newReview];
	product.numberOfReviews = product.reviews.length;
	product.rating =
		product.reviews.reduce((acc, item) => item.rating + acc, 0) /
		product.reviews.length;

	await product.save();
	res.status(201).json({
		success: true,
		message: 'Review added successfully!',
	});
});