const express = require('express')
const app = express();
const fileUpload = require('express-fileupload');
const routes = require('./app/routes/fs.js');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
	// createParentPath : true,
	limits: { fileSize: 5000 * 1024 * 1024 },
	useTempFiles : true,
	tempFileDir : '/tmp/'
}));
app.use(routes);

app.listen(3000);