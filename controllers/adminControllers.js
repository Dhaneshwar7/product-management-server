const { catchAsyncError } = require('../middlewares/catchAsyncError');
const ErrorHandler = require('../utils/ErrorHandlers');
const { sendtoken } = require('../utils/SendToken');
const { sendmail } = require('../utils/nodemailer');
const path = require('path');
const imageKit = require('../utils/imageKit').uploadImagekit();

exports.homepage = catchAsyncError((req, res, next) => {
	res.send(` <div style="width: 100vw;height: 100vh; display: flex; align-items: center; justify-content: center;">
            <h1 class="ok"  style="font-size: 68px; font-weight: 800; text-align: center;padding: 5vw; color: green;">Product Management Server Ready<br> ! Thank you 🙏</h1>
        </div>`);
});
