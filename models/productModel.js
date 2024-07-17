const mongoose = require('mongoose');

const productModel = mongoose.Schema(
	{
		admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'admin' }],
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
            required: [true, 'Manufactured Date is Required'],
        },
		manufactured: {
			type: Date,
			required: [true, 'Manufactured Date is Required'],
		},
		category: {
			type: String,
			required: [true, 'Category is Required'],
		},
		images: [String],
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

const Product = mongoose.model('Product', productModel);
module.exports = Product;
