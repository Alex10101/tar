const app = require('express')();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const routes = require('./app/routes/fs.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());
app.use(routes);

app.listen(3000);