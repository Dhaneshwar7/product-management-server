const { catchAsyncError } = require('../middlewares/catchAsyncError');
const Admin = require('../models/adminModel');
const ErrorHandler = require('../utils/ErrorHandlers');
const path = require('path');
const Product = require('../models/productModel');
const imageKit = require('../utils/imageKit').uploadImagekit();

/* -----------  Default Render all PRODUCT VIEWALL  -----------*/
exports.renderAllProducts = catchAsyncError(async (req, res, next) => {
	const  products  = await Product.find()
	// console.log(products);
	res.status(200).json({ success: true, products });
});
/* -----------  ADMIN PRODUCT CREATE  -----------*/
exports.productCreate = catchAsyncError(async (req, res, next) => {
	const admin = await Admin.findById(req.id).exec();
	const product = await new Product(req.body);
	product.admin = admin._id;
	admin.products.push(product._id);
	await product.save();
	await admin.save();
	res.status(201).json({ success: true, product });
});


/* -----------  ADMIN PRODUCT VIEWALL  -----------*/
exports.productViewAll = catchAsyncError(async (req, res, next) => {
	const { products } = await Admin.findById(req.id).populate('products').exec();
	res.status(200).json({ success: true, products });
});

/* -----------  ADMIN VIEW ONEPRODUCT  -----------*/
exports.productView = catchAsyncError(async (req, res, next) => {
	const product = await Product.findById(req.params.productId).exec();
	if (!product) {
		return next(new ErrorHandler('Product not found', 404));
	}
	res.status(200).json({ success: true, product });
});

/* -----------  ADMIN PRODUCT UPDATE  -----------*/
exports.productUpdate = catchAsyncError(async (req, res, next) => {
	const product = await Product.findByIdAndUpdate(
		req.params.productId,
		req.body
	).exec();

	res
		.status(200)
		.json({ success: true, message: 'Product Updated Successfully!', product });
});

/* -----------  ADMIN PRODUCT DELETE  -----------*/
exports.productDelete = catchAsyncError(async (req, res, next) => {
	const product = await req.params.productId;
	try {
		console.log(product);
		const deletedProduct = await Product.findByIdAndDelete(product);
		if (!deletedProduct)
			return next(new ErrorHandler('Product not Found', 404));
		res.status(200).json({
			status: true,
			message: 'Product Deleted Successfull',
			deletedProduct,
		});
	} catch (error) {
		res.status(500).json({
			status: false,
			message: 'Internal server issue',
		});
	}
});

/* -----------  ADMIN PRODUCT IMAGES  -----------*/
exports.productImage = catchAsyncError(async (req, res, next) => {
	const product = await Product.findById(req.params.id).exec();

	if (!product) {
		return next(new ErrorHandler('Product not found', 404));
	}
	const file = req.files.image;
	if (!file) {
		return next(new ErrorHandler('NO File uploaded', 500));
	}
	const modifiedName = `productImage-url-${Date.now()}${path.extname(
		file.name
	)}`;

	// Delete the existing file if it exists
	if (product.productImageUrl && product.productImageUrl.fileId) {
		try {
			await imageKit.deleteFile(product.productImageUrl.fileId);
		} catch (error) {
			console.error('Error deleting existing file:', error);
		}
	}

	// Upload new file to ImageKit
	try {
		const { fileId, url } = await imageKit.upload({
			file: file.data,
			fileName: modifiedName,
		});

		product.productImageUrl = { fileId, url };
		await product.save();

		res.status(200).json({
			success: true,
			message: 'Profile Picture Updated Successfully!',
		});
	} catch (error) {
		console.error('Error uploading to ImageKit:', error);
		return res.status(500).json({ message: 'Error uploading file' });
	}
});

/* -----------  ADMIN PRODUCT FILTER  -----------*/
exports.productFilter = catchAsyncError(async (req, res, next) => {
	const {
		page = 1,
		limit = 10,
		productName,
		priceRange,
		quantity,
		startDate,
		endDate,
	} = req.query;

	const adminId = req.id;

	if (!adminId) {
		return res.status(400).json({
			success: false,
			message: 'Admin ID not found in request',
		});
	}

	const query = { admin: adminId };

	if (productName) {
		query.productName = { $regex: productName, $options: 'i' };
	}
	if (priceRange) {
		const [minPrice, maxPrice] = priceRange.split('-').map(Number);
		query.price = { $gte: minPrice, $lte: maxPrice };
	}
	if (quantity) {
		query.quantity = { $gte: Number(quantity) };
	}
	if (startDate && endDate) {
		query.manufactured = {
			$gte: new Date(startDate),
			$lte: new Date(endDate),
		};
	}

	try {
		const skip = (page - 1) * limit;
		const products = await Product.find(query)
			.skip(skip)
			.limit(Number(limit))
			.lean()
			.exec();

		const totalProducts = await Product.countDocuments(query);
		const totalPages = Math.ceil(totalProducts / limit);

		res.status(200).json({
			success: true,
			products: products,
			pagination: {
				currentPage: Number(page),
				limit: Number(limit),
				totalPages,
				totalProducts,
			},
		});
	} catch (error) {
		console.error('Error fetching products:', error);
		res.status(500).json({
			success: false,
			message: 'An error occurred while fetching products',
		});
	}
});
exports.productSearch = catchAsyncError(async (req, res, next) => {
	const { searchText, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
	const adminId = req.id;
	// Initial query to filter products by the logged-in admin
	const query = { admin: adminId };
	if (searchText) {
		const searchRegex = new RegExp(searchText, 'i');
		query.$or = [{ productName: searchRegex }, { category: searchRegex }];
	}
	if (minPrice) {
		query.price = { ...query.price, $gte: Number(minPrice) };
	}
	if (maxPrice) {
		query.price = { ...query.price, $lte: Number(maxPrice) };
	}
	// Pagination logic
	const skip = (page - 1) * limit;
	try {
		const products = await Product.find(query)
			.skip(skip)
			.limit(Number(limit))
			.lean()
			.exec();
		const totalProducts = await Product.countDocuments(query);
		const totalPages = Math.ceil(totalProducts / limit);
		if (products.length === 0) {
			const error = new ErrorHandler('No products found with this Name');
			error.statusCode = 400;
			return next(error);
		}
		res.status(200).json({
			success: true,
			products,
			pagination: {
				currentPage: Number(page),
				limit: Number(limit),
				totalPages,
				totalProducts,
			},
		});
	} catch (error) {
		console.error('Error during product search:', error);
		return next(new ErrorHandler('Server Error', 500));
	}
});

exports.productCreateFull = catchAsyncError(async (req, res, next) => {
	const admin = await Admin.findById(req.id).exec();
	const product = await new Product(req.body).save();
	product.admin = admin._id;

	// Handle image upload if available
	if (req.files && req.files.image) {
		const file = req.files.image;
		const modifiedName = `productImage-url-${Date.now()}${path.extname(
			file.name
		)}`;
		// Delete the existing file if it exists (optional)
		if (product.productImageUrl && product.productImageUrl.fileId) {
			try {
				await imageKit.deleteFile(product.productImageUrl.fileId);
			} catch (error) {
				console.error('Error deleting existing file:', error);
			}
		}
		try {
			const { fileId, url } = await imageKit.upload({
				file: file.data,
				fileName: modifiedName,
			});
			product.productImageUrl = { fileId, url };
		} catch (error) {
			console.error('Error uploading to ImageKit:', error);
			return next(new ErrorHandler('Error uploading file', 500));
		}
	}

	admin.products.push(product._id);
	await Promise.all([product.save(), admin.save()]);
	res.status(201).json({
		success: true,
		message: 'Product Added Successfully',
		product,
	});
});

/* -----------  ADMIN PRODUCT Many  -----------*/
/* -----------  ADMIN PRODUCT Many  -----------*/
exports.productsCreateMany = catchAsyncError(async (req, res, next) => {
	const admin = await Admin.findById(req.id).exec();
	if (!admin) {
		return next(new ErrorHandler('Admin not found', 404));
	}

	// Ensure req.body is an array of products
	const productsData = Array.isArray(req.body) ? req.body : [req.body];

	// Map through the productsData and add the admin reference to each product
	const productsWithAdmin = productsData.map(productData => ({
		...productData,
		admin: admin._id, // Change this line to ensure it matches the schema
	}));

	// Insert many products at once
	const products = await Product.insertMany(productsWithAdmin);

	// Add the newly created product IDs to the admin's products array
	admin.products.push(...products.map(product => product._id));

	await admin.save();

	res.status(201).json({ success: true, products });
});
