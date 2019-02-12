const app = require('express')();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());

// Executes tar -xzvf  ${path} -C ../tmp --keep-old-files
const extract = require('./extract.js');

// Just readline.createInterface.
const readline = require('./readline.js');

// This is the file for cron.
// Removes expired files and exports database.
const mongo = require('./mongo-fs-del.js');


const path = './files/';
const temp = './tmp';

app.get('/', (req, res) => {
	mongo(function(err, client) {
	  if (err) throw err;
	  let db = client.db();
	  db.collection("files").find({}).toArray(function(err, data) {
	    if (err) throw err;
	    res.send(data)
	    client.close();
	    return
	  });
	})
});

app.get('/tmp', (req, res) => {
	if(req.body.path) {
		let p = req.body.path
		if(p.indexOf('.') > 1) {
			readline(temp + p).then((data, err) => {
				if(err) {
					res.send('Temp directory is empty')
					return
				}
				res.send(data)
			})
			return
		} else {
			console.log(data)
			res.send(data)
			return
		}
		fs.readdir(temp + p, (err, data) => {
			res.send(data)
		})
		return
	}
	fs.readdir(temp, (err, data) => {
		res.send(data)
	})
})

app.get('/extract', (req, res) => {
	extract(req.body.path, (error, stdout, stderr) => {
		  if (error) {
		    res.send(error)
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
	let filename = req.body.filename || req.files.file.name;

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
			db.find(item).toArray(function(err, data) {
			    if (err) throw err;
			    if(data) {
			    	res.send(data)
			    	client.close();
			    	return
			    }
			});
			db.insertOne(item)
			req.files.file.mv(path + filename)
			let n = String.fromCharCode(13, 10)
			res.send(`
				${filename} uploaded 
				
				item inserted ${JSON.stringify(item)}
			`)

			client.close()
		})
		return		
 	}

 	res.send(`Name ${filename} exist 

 	 Stats : ${JSON.stringify(fs.statSync(path + filename))}
 	`)
});

app.put('/', (req, res) => {
	try {
	   	JSON.parse(req.body.change_from)
		JSON.parse(req.body.change_to)
	} catch (e) {
	    res.send(e)
	    return
	}

	let from = JSON.parse(req.body.change_from)
	let to = JSON.parse(req.body.change_to)
	let by = req.body.search_by
	let search_by = from
	if(by) {
		search_by = { [by] : from[by] }
	}

	if(from && to) {
		mongo((err, client) => { 
			if(err) throw err
			let db = client.db().collection('files')
			db.find(search_by).toArray((err, data) => {
				update = (file, data) {
					
				}
				if(err) throw err
				if(data.length < 1) {
					res.send(`
						Can't find in database :
						${JSON.stringify(from)}
					`)
					return
				} else if(data.length > 1) {
					let i = req.body.specify || undefined
					if(i) {
						res.send(data[i])
						return
					} else {
						res.send(`
							Please specify the target at req.body.specify :

							${JSON.stringify(data)}
						`)
						return
					}
				} else {
					if(by) {
						db.update({}, { $set: { dateField: new Date(2011, 0, 1)}}, false, true);
					}
					// db.update({condField: 'condValue'}, { $set: { dateField: new Date(2011, 0, 1)}}, false, true);
					res.send(data)
					return
				}
				console.log(data)
				res.send(data)
							
			})

		})
		return
	}
	res.send(`Can't read the data :
		change_from : ${from}

		change_to : ${to}
	`)
})

app.delete('/', (req, res) => {
	if(req.body.path) {
		let r = req.body.path
		let p = path + req.body.path
		if(fs.existsSync(p)) {
			fs.unlink(p, (err) => {
				if(err) throw err
				res.send(r + ' deleted')
			})
			return
		}
		res.send(r + ' not found')
		return
	}
	res.send(req.body.path + ' is not defined')
})

app.use(function(req, res, next) {
  res.redirect('/')
});

app.listen(3000);