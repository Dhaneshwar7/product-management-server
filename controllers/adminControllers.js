const { catchAsyncError } = require('../middlewares/catchAsyncError');
const Admin = require('../models/adminModel');
const ErrorHandler = require('../utils/ErrorHandlers');
const { sendtoken } = require('../utils/SendToken');
const { sendmail } = require('../utils/nodemailer');
const path = require('path');
const imageKit = require('../utils/imageKit').uploadImagekit();

exports.homepage = catchAsyncError((req, res, next) => {
	res.json({ message: 'This is HomePage' });
});

/* -----------CHECKS CURRENT ADMIN  -----------*/
exports.currentAdmin = catchAsyncError(async (req, res, next) => {
	try {
		const currentAdmin = await Admin.findById(req.id).exec();
		if (!currentAdmin) {
			const error = new ErrorHandler('Admin not Logged In !!');
			error.statusCode = 401;
			return next(error);
		}
		res.json({ currentAdmin });
	} catch (error) {
		console.log(error);
	}
});

/* -----------  ADMIN SIGN_UP  -----------*/
exports.adminSignUp = catchAsyncError(async (req, res, next) => {
	const { email } = req.body;
	const existingAdmin = await Admin.findOne({ $or: [{ email }] });
	if (existingAdmin) {
		const error = new ErrorHandler(
			'Already Registered with this Email Address !'
		);
		error.statusCode = 400;
		return next(error);
	}
	const admin = new Admin(req.body);
	await admin.save();
	const message = 'Account Created Successfully !';
	sendtoken(admin, 200, res, message);
});
/* -----------  ADMIN SIGN_IN  -----------*/
exports.adminSignIn = catchAsyncError(async (req, res, next) => {
	const { email, password } = req.body;
	const admin = await Admin.findOne({ email }).select('+password').exec();
	if (!admin) {
		const error = new ErrorHandler('Wrong Credentials ! Try again');
		error.statusCode = 800;
		return next(error);
	}
	const isMatch = admin.comparepassword(req.body.password);
	if (!isMatch) {
		const error = new ErrorHandler('Wrong Credentials ! Try again');
		error.statusCode = 800;
		return next(error);
	}
	const message = 'Sign In Successfully !';
	sendtoken(admin, 200, res, message);
});

/* -----------  ADMIN SIGN_OUT  -----------*/
exports.adminSignOut = catchAsyncError(async (req, res, next) => {
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

/* -----------  ADMIN UPDATE_DETAILS  -----------*/
exports.adminUpdate = catchAsyncError(async (req, res, next) => {
	await Admin.findByIdAndUpdate(req.params.id, req.body).exec();
	res
		.status(200)
		.json({ success: true, message: 'Admin Updated Successfully!' });
});

/* -----------  ADMIN SEND_LINK_MAIL  -----------*/
exports.adminSendLinkMail = catchAsyncError(async (req, res, next) => {
	const admin = await Admin.findOne({ email: req.body.email }).exec();
	if (!admin) {
		return next(
			new ErrorHandler('User not found with this Email Address', 404)
		);
	}
	const url = `${req.protocol}://${req.get('host')}/admin/forget-link/${
		admin._id
	}`;
	sendmail(req, res, next, url);
	admin.resetpasswordToken = '1';
	await admin.save();
	res.json({ admin, url });
});

/* -----------  ADMIN FORGET_LINK  -----------*/
exports.adminForgetLink = catchAsyncError(async (req, res, next) => {
	const admin = await Admin.findById(req.params.id).exec();
	if (!admin) {
		return next(
			new ErrorHandler('User not found with this Email Address', 404)
		);
	}
	if (admin.resetpasswordToken == '1') {
		admin.resetpasswordToken = '0';
		admin.password = req.body.password;
		await admin.save();
	} else {
		return next(new ErrorHandler('Invalid forget link ! try again', 500));
	}
	res.status(200).json({ message: 'Password Changed Successfully' });
});

/* -----------  ADMIN RESET_LINK  -----------*/
exports.adminResetPassword = catchAsyncError(async (req, res, next) => {
	const admin = await Admin.findById(req.id).exec();
	admin.password = req.body.password;
	await admin.save();
	sendtoken(admin, 201, res);
});

/* -----------  ADMIN AVATAR  -----------*/
exports.adminAvatar = catchAsyncError(async (req, res, next) => {
	const admin = await Admin.findById(req.params.id).exec();

	const file = req.files.avatar;
	const modifiedName = `admin-${Date.now()}${path.extname(file.name)}`;

	if (admin.avatar.fileId !== '') {
		await imageKit.deleteFile(admin.avatar.fileId);
	}

	const { fileId, url } = await imageKit.upload({
		file: file.data,
		fileName: modifiedName,
	});

	admin.avatar = { fileId, url };
	await admin.save();

	res
		.status(200)
		.json({ success: true, message: 'Profile Picture Updated Successfully!' });
});

/* -----------  ADMIN DELETE  -----------*/
exports.deleteAdmin = catchAsyncError(async (req, res, next) => {
	const deletingAdminId = req.params.adminId;
	try {
		const deletedAdmin = await Admin.findByIdAndDelete(deletingAdminId);
		if (!deletedAdmin) return next(new ErrorHandler('Admin Not Found', 404));
		res.status(200).json({
			status: true,
			message: 'Admin Account Delete Successfully',
			deletedAdmin,
		});
	} catch (error) {
		res.status(500).json({
			status: false,
			message: 'Internal server issue',
		});
	}
});
