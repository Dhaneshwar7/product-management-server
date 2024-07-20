require('dotenv').config();
const mongoose = require('mongoose');

exports.databaseConnect = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URL);
		console.log('Database connection successful!');
	} catch (err) {
		console.error('Error connecting to database:', err.message);
	}
};
