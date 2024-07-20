const express = require('express');
const app = express();
const connectDatabase = require('./models/database');
const logger = require('morgan');
const cors = require('cors');

const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

//Database connection
connectDatabase.databaseConnect();

//Express FileUpload
const fileupload = require('express-fileupload');
app.use(fileupload());

//cor setup
app.use(
	cors({
		credentials: true,
		origin: 'http://localhost:5173',
		methods: ['GET', 'POST, PUT', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})
);

// cors({ origin: '*' });

//logger
app.use(logger('tiny'));

//bodyParser

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Express-Session, Cookie-parse
const cookieparser = require('cookie-parser');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
app.use(
	session({
		cookie: { maxAge: 86400000 },
		store: new MemoryStore({
			checkPeriod: 86400000, // prune expired entries every 24h	
		}),
		resave: false,
		secret: process.env.EXPRESS_SESSION_SECRET,
	})
);
// app.use(
// 	session({
// 		resave: true,
// 		saveUninitialized: true,
// 		secret: process.env.EXPRESS_SESSION_SECRET,
// 		cookie: { secure: true, sameSite: 'lax' },
// 	})
// );

app.use(cookieparser());

//Routes
app.use('/', require('./routes/adminRoutes'));
app.use('/admin/product', require('./routes/productRoutes'));

//Error Handling
const ErroHandler = require('./utils/ErrorHandlers');
const { generatedErrors } = require('./middlewares/auth');

app.all('*', (req, res, next) => {
	next(new ErroHandler(`Requested URL NOT FOUND ${req.url}`, 404));
});

app.listen(
	process.env.PORT,
	console.log(
		`Product-Mangagement SERVER IS RUNNING on Port ${process.env.PORT}`
	)
);

module.exports = app;
