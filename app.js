const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const connectDatabase = require('./models/database');
const logger = require('morgan');
const cors = require('cors');

//Database connection
connectDatabase.databaseConnect();

//Express FileUpload
const fileupload = require('express-fileupload');
app.use(fileupload());

//CORS setup
const allowedOrigins = [
	'http://localhost:5173',
	'https://bazar-ashen.vercel.app',
];
const corsOptions = {
	origin: function (origin, callback) {
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
};
app.use(cors(corsOptions));


//logger
app.use(logger('tiny'));

//bodyParser for ejs page 

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Express-Session, Cookie-parse
const cookieparser = require('cookie-parser');
const session = require('express-session');
app.use(
	session({
		resave: true,
		saveUninitialized: true,
		secret: process.env.EXPRESS_SESSION_SECRET,
	})
);
app.use(cookieparser());

//Routes
app.use('/', require('./routes/adminRoutes'));
app.use('/admin/product', require('./routes/productRoutes'));

//Error Handling
const ErroHandler = require('./utils/ErrorHandlers');
const { generatedErrors } = require('./middlewares/auth');
app.use(generatedErrors);


app.all('*', (req, res, next) => {
	next(new ErroHandler(`Requested URL NOT FOUND ${req.url}`, 404));
});

app.listen(
	process.env.PORT,
	console.log(
		`Product-Mangagement SERVER IS RUNNING on Port ${process.env.PORT}`
	)
);
if (process.env.NODE_ENV === 'production') {
	// Use the production API endpoint
	console.log('Running in production environment');
} else {
	// Use the development API endpoint
	console.log('Running in development environment');
}
module.exports = app;
