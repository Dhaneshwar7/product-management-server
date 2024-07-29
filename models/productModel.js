const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
	{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'product',
			required: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'user',
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		rating: {
			type: Number,
			min: 1,
			max: 5,
		},
		review: {
			type: String,
			minLength: [3, 'Review should be at least 3 characters long'],
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ _id: false }
);
const productModel = mongoose.Schema(
	{
		admin: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
		productName: {
			type: String,
			required: [true, 'Product Name is Required'],
			// minLength: [3, 'Product Name should be minimum of 3 characters'],
		},
		price: {
			type: Number,
			required: [true, 'Price is Required'],
		},
		quantity: {
			type: Number,
			required: [true, 'Quantity is Required'],
		},
		description: {
			type: String,
			minLength: [5, 'Description must not be exceed of 5 Words'],
			maxLength: [50, 'Description must be atleast of 40 Words'],
		},
		manufactured: {
			type: Date,
		},
		category: {
			type: String,
			default: 'None',
		},
		status: {
			type: String,
			enum: ['Available', 'Out of Stock', 'Discontinued'],
			required: [true, 'Status is Required'],
		},
		productImageUrl: {
			type: Object,
			default: {
				fileId: '',
				url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2804&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
			},
		},
		numberOfReviews: {
			type: Number,
			default: 0,
		},
		rating: {
			type: Number,
			default: 0,
		},

		reviews: [reviewSchema],
	},
	{ timestamps: true }
);

const Product = mongoose.model('product', productModel);
module.exports = Product;
