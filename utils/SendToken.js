exports.sendtoken = (admin, statusCode, res, message) => {
	const token = admin.getjwttoken();

	const options = {
		expires: new Date(
			Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
		secure: true,
		sameSite: 'none',
	};

	res
		.status(statusCode)
		.cookie('token', token, options)
		.json({ success: true, id: admin._id, token, message });
};
