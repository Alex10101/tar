const app = require('express')();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());

const read = require('./fs.js');
const { mongo, date } = require('./mongo-del.js')
const path = './files/'

app.get('*', (req, res) => {
	read(req.url, (error, stdout, stderr) => {
	  if (error) {
	    res.send({
	    	err : error.toString()
	    })
	    return
	  }

	  let wrap = (text) => `
	  <div style="white-space: pre-line" > 
	  	${text} 
	  </div>`;

	  res.send(wrap(stdout))
	})
})

app.post('/', (req, res) => {
	let filename = req.files.file.name;
	if(typeof req.files == 'undefined') {
		console.log(req.files)
		res.status(405).send("Cant't read file in req.file")
		return;
	}

	if(!fs.existsSync(path + filename)) {
		mongo((err, client) => {
			let db = client.db().collection('files');
			let exp = date(req.body.expires_from)
			let item = {
				name : filename,
				exp_date : exp.time || "Null",
				timestamp : exp.stamp || "Null"
			}
			db.insertOne(item)
			client.close();
		})

		req.files.file.mv(path + filename);
		res.send(`${filename} uploaded`)
 	}

 	res.send(`Name ${filename} exist`)
})


app.use(function(req, res, next) {
  res.redirect('/')
});

app.listen(3000)