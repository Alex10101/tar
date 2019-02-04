const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const app = express();

// app.use(express.static('files'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());

const fs = require('./fs.js');
const path = './files/'

app.get('/', (req, res) => {
	fs(path).then((data) => {
		res.send({
			items : data
		})
	})
})

app.get('/:file', (req, res) => {
	fs(path + req.file).then((data) => {
		res.send({
			items : data
		})
	})
})

app.post('/files', (req, res) => {
	if(!req.files) {
		res.redirect('/');
	}

	if(!fs.existsSync(path + req.files.file.name)) {
		req.files.file.mv(path + req.files.file.name);
 	}

 	res.redirect('/');
})


// app.use(function(req, res, next) {
//   res.redirect('/')
// });

app.listen(3000)