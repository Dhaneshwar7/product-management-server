const { catchAsyncError } = require('../middlewares/catchAsyncError');
const User = require('../models/userSchema');
const ErrorHandler = require('../utils/ErrorHandlers');
const { sendtoken } = require('../utils/SendToken');
const { sendmail } = require('../utils/nodemailer');
const path = require('path');
const imageKit = require('../utils/imageKit').uploadImagekit();

exports.homepage = catchAsyncError((req, res, next) => {
	res.json({ message: 'This is User HomePage' });
});

exports.currentUser = catchAsyncError(async (req, res, next) => {
	try {
		const currentUser = await User.findById(req.id).exec();
		if (!currentUser) {
			const error = new ErrorHandler('User Not Logged In !!');
			error.statusCode = 401;
			return next(error);
		}
		res.json({ currentUser });
	} catch (error) {
		console.log(error);
	}
});

exports.userSignUp = catchAsyncError(async (req, res, next) => {
	const { email } = req.body;
	const existingUser = await User.findOne({ $or: [{ email }] });
	if (existingUser) {
		const error = new ErrorHandler(
			'Already Registered with this Email Address !'
		);
		error.statusCode = 400;
		return next(error);
	}
	const user = new User(req.body);
	await user.save();
	const message = 'Account Created Successfully !';
	sendtoken(user, 200, res, message);
});
/* -----------  USER SIGN_IN  -----------*/
exports.userSignIn = catchAsyncError(async (req, res, next) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email }).select('+password').exec();
	if (!user) {
		const error = new ErrorHandler('Wrong Credentials ! Try again');
		error.statusCode = 800;
		return next(error);
	}
	const isMatch = user.comparepassword(req.body.password);
	if (!isMatch) {
		const error = new ErrorHandler('Wrong Credentials ! Try again');
		error.statusCode = 800;
		return next(error);
	}
	const message = 'Sign In Successfully !';
	sendtoken(user, 200, res, message);
});

/* -----------  USER SIGN_OUT  -----------*/
exports.userSignOut = catchAsyncError(async (req, res, next) => {
	const options = {
		expires: new Date(0),
		httpOnly: true,
		secure: true,
		sameSite: 'none',
	};
	res
		.status(200)
		.cookie('token', '', options)
		.json({ success: true, message: 'Logout Successfully' });
});

/* -----------  USER UPDATE_DETAILS  -----------*/
exports.userUpdate = catchAsyncError(async (req, res, next) => {
	await User.findByIdAndUpdate(req.params.id, req.body).exec();
	res
		.status(200)
		.json({ success: true, message: 'User Updated Successfully!' });
});

/* -----------  USER SEND_LINK_MAIL  -----------*/
exports.userSendLinkMail = catchAsyncError(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email }).exec();

	if (!user) {
		return next(
			new ErrorHandler('User not found with this Email Address', 404)
		);
	}

	const url = `${req.protocol}://${req.get('host')}/user/forget-link/${
		user._id
	}`;

	sendmail(req, res, next, url);
	user.resetpasswordToken = '1';
	await user.save();

	res.json({ user, url });
});

/* -----------  USER FORGET_LINK  -----------*/
exports.userForgetLink = catchAsyncError(async (req, res, next) => {
	const user = await User.findById(req.params.id).exec();

	if (!user) {
		return next(
			new ErrorHandler('User not found with this Email Address', 404)
		);
	}

	if (user.resetpasswordToken == '1') {
		user.resetpasswordToken = '0';
		user.password = req.body.password;
		await user.save();
	} else {
		return next(new ErrorHandler('Invalid forget link ! try again', 500));
	}

	res.status(200).json({ message: 'Password Changed Successfully' });
});

/* -----------  USER RESET_LINK  -----------*/
exports.userResetPassword = catchAsyncError(async (req, res, next) => {
	const user = await User.findById(req.id).exec();
	user.password = req.body.password;
	await user.save();
	sendtoken(user, 201, res);
});

/* -----------  USER AVATAR  -----------*/
exports.userAvatar = catchAsyncError(async (req, res, next) => {
	const user = await User.findById(req.params.id).exec();

	const file = req.files.avatar;
	const modifiedName = `user-${Date.now()}${path.extname(file.name)}`;

	if (user.avatar.fileId !== '') {
		await imageKit.deleteFile(user.avatar.fileId);
	}

	const { fileId, url } = await imageKit.upload({
		file: file.data,
		fileName: modifiedName,
	});

	user.avatar = { fileId, url };
	await user.save();

	res
		.status(200)
		.json({ success: true, message: 'Profile Picture Updated Successfully!' });
});

/* -----------  USER DELETE  -----------*/
exports.deleteUser = catchAsyncError(async (req, res, next) => {
	const deletingUserId = req.params.userId;
	try {
		const deletedUser = await User.findByIdAndDelete(deletingUserId);
		if (!deletedUser) return next(new ErrorHandler('User Not Found', 404));
		res.status(200).json({
			status: true,
			message: 'User Account Delete Successfully',
			deletedUser,
		});
	} catch (error) {
		res.status(500).json({
			status: false,
			message: 'Internal server issue',
		});
	}
});
