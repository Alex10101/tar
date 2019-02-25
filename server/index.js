const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const mongoose = require('mongoose');

const fileController = require('./controllers/fileController');

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
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(fileUpload({
  limits: {fileSize: 5000 * 1024 * 1024},
  useTempFiles: true,
  tempFileDir: '/tmp',
}));

app.get('/', fileController.index);
app.post('/', fileController.upload);
app.get('/tar', fileController.read);

app.use(function(req, res, next) {
  res.redirect('/');
});

app.listen(3000);
