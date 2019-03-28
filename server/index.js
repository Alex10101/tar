const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const mongoose = require('mongoose');

const fileController = require('./controllers/fileController');
const validate = require('./services/methods');

mongoose.connect(
  'mongodb://localhost:27017/Tar',
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }
);

app.use(helmet());
app.use(express.json({limit: '1kb'}));
app.use(express.urlencoded({limit: '1kb', extended: true}));

app.use(fileUpload({
  limits: {fileSize: 5000 * 1024 * 1024},
  useTempFiles: true,
  tempFileDir: '/tmp',
  parseNested: true,
  abortOnLimit: true,
}));

app.get('/', validate.index, fileController.index);
app.post('/', validate.upload, fileController.upload);
app.get('/read', validate.read, fileController.read);

app.use(function set404(req, res) {
  res.redirect('/');
});

app.use(function globErrorHandler(err, req, res) {
  res.status(500).send(err);
});

app.listen(3000);

process.on('unhandledRejection', (reason, p) => {
  throw reason;
});
process.on('uncaughtException', (error) => {
  console.log(error)
});
