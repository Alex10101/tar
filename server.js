const app = require('express')();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());

const { exec } = require('child_process');
const read = require('./fs.js');

app.get('*', (req, res) => {
	read(req.url, (error, stdout, stderr) => {
	  if (error) {
	    res.send({
	    	err : error.toString()
	    })
	    return
	  }
	  // console.log(`${stdout}`);
	  res.send({
		items : stdout
	  })
	})
})

app.post('/', (req, res) => {
	if(typeof req.body === 'undefined') {
		return;
	}

	if(!fs.existsSync(path + req.body.file.name)) {
		req.body.file.mv(path + req.body.file.name);
 	}

 	res.redirect('/');
})


// app.use(function(req, res, next) {
//   res.redirect('/')
// });

app.listen(3000)