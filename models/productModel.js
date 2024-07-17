const mongoose = require('mongoose');

const productModel = mongoose.Schema(
	{
		admins: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
		productName: {
			type: String,
			required: [true, 'Product Name is Required'],
			minLength: [3, 'Product Name should be minimum of 3 characters'],
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
		},
		productImageUrl: {
			type: Object,
			default: {
				fileId: '',
				url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2804&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
			},
		},
		rating: {
			type: Number,
			min: 1,
			max: 5,
		},
		reviews: [
			{
				reviewerName: String,
				reviewText: String,
				rating: {
					type: Number,
					min: 1,
					max: 5,
				},
				date: Date,
			},
		],
		status: {
			type: String,
			enum: ['Available', 'Out of Stock', 'Discontinued'],
			required: [true, 'Status is Required'],
		},
	},
	{ timestamps: true }
);

const Product = mongoose.model('product', productModel);
module.exports = Product;
