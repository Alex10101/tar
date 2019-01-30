const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');

const pug = require('pug');
const page = pug.compileFile('./views/index.pug');

const path = __dirname + '/files/';

app.use(express.static('files'))
app.use(express.static('views'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());

let items = fs.readdir('files')

app.get('/', (req, res) => {
	res.send(page({
	items : items
}))
})

app.post('/files', (req, res) => {
	if(!req.files) {
		res.redirect('/')
	}
	if(!fs.existsSync(path + req.files.file.name)) {
		req.files.file.mv(path + req.files.file.name)
 	}

 	res.redirect('/')
})


app.use(function(req, res, next) {
  res.redirect('/')
});

app.listen(3000)