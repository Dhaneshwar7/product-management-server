const jwt = require('jsonwebtoken');
const ErrorHandler = require('../utils/ErrorHandlers');
const { catchAsyncError } = require('./catchAsyncError');

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
	const { token } = req.cookies;

	if (!token) {
		return next(new ErrorHandler('Please Login to access this resource', 401));
	}

	const { id } = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
	req.id = id;

	next();
});
