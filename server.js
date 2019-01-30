const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const upload = multer({
  dest: './files' // this saves your file into a directory called "uploads"
}); 

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('./'));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/', upload.single('file'), (req, res) => {
  res.redirect('/');
});

app.listen(3000);