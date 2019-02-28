const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const expressValidator = require('express-validator');
const helmet = require('helmet');
const mongoose = require('mongoose');

const fileController = require('./controllers/fileController');
const validate = require('./services/methods');

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
// .env module for WebStorm didn't work. resolve this later.
mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/Tar');
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log(
      '%s MongoDB connection error. Please make sure MongoDB is running.'
  );
  process.exit();
});

app.use(helmet());
app.use(express.urlencoded({limit: '1kb', extended: true}));
app.use(express.json({limit: '1kb'}));

app.use(expressValidator());
app.use(fileUpload({
  limits: {fileSize: 5000 * 1024 * 1024},
  useTempFiles: true,
  tempFileDir: '/tmp',
  parseNested: true,
  abortOnLimit: true,
}));

app.get('/', validate.index, fileController.index);
app.post('/', validate.upload, fileController.upload);
app.get('/tar/', validate.read, fileController.read);

app.use(function set404(req, res) {
  res.redirect('/');
});

app.use(function globErrorHandler(err, req, res) {
  res.status(500).send(err);
});

app.listen(3000);
