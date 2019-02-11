const app = require('express')();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());

const extract = require('./extract.js');
const readline = require('./readline.js')
const mongo = require('./mongo-del.js');
const path = './files/';

app.get('/', (req, res) => {
	mongo(function(err, client) {
	  if (err) throw err;
	  var db = client.db();
	  db.collection("files").find({}).toArray(function(err, data) {
	    if (err) throw err;
	    res.send(data)
	    client.close();
	  });
	})
});

app.get('/tmp', (req, res) => {
	if(req.body.path) {
		let p = req.body.path
		if(p.indexOf('.') > 1) {
			readline('./tmp' + p).then((data) => {
				res.send(data)
			})
			return
		}
		fs.readdir('./tmp' + p, (err, data) => {
			res.send(data)
		})
		return
	}
	fs.readdir('./tmp', (err, data) => {
		res.send(data)
	})
})

app.get('/extract', (req, res) => {
	extract(req.body.path, (error, stdout, stderr) => {
		  if (error) {
		    console.log(error)
		    return;
		  }
		  res.redirect('/tmp')
		}
	)
})

app.post('/', (req, res) => {
	if(typeof req.files == 'undefined') {
		res.status(405).send("Cant't read file in req.file")
		return
	}
	let filename = req.files.file.name;

	if(!fs.existsSync(path + filename)) {
		mongo((err, client) => {
			let db = client.db().collection('files')
			let b = req.body
			let exp = b.expire
			let item = {
				title: b.title || undefined,
				filename : filename,
				description: b.description || undefined,
				expire : exp || undefined,
				timestamp : new Date(exp).getTime() || undefined
			}
			db.insertOne(item)
			client.close()
		})

		req.files.file.mv(path + filename)
		res.send(`${filename} uploaded`)
 	}

 	res.send(`Name ${filename} exist`)
});


app.use(function(req, res, next) {
  res.redirect('/')
});

app.listen(3000);