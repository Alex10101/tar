const app = require('express')();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const routes = require('./app/routes/fs.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({
	createParentPath : true,
	limits: { fileSize: 3000 * 1024 * 1024 },
	useTempFiles : true
}));
app.use(routes);

app.listen(3000);