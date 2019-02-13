const app = require('express');
const router = app.Router();
const fs = require('fs');
const pt  = require('path');

// Executes tar -xzvf  ${path} -C ../tmp --keep-old-files
const extract = require('../fs/extract.js');

// Just readline.createInterface.
const readline = require('../fs/readline.js');

// This is the file for cron.
// Removes expired files and exports database.
const mongo = require('../fs/mongo-fs-del.js');

const home  = pt.join(__dirname, '..', '..');
const public = pt.join(home, 'public');
const files = pt.join(public, 'files');
const temp = pt.join(public, 'tmp');

router.get('/', (req, res) => {
	let skip = Number(req.body.skip || req.query.skip || 0);
	let limit = Number(req.body.limit || req.query.limit || 10);
	mongo((err, client) => {
	  if (err) throw err;
	  let db = client.db();
	  db.collection("files").find().skip(skip).limit(limit).toArray(function(err, data) {
	    if (err) throw err;
	    res.send(data);
	    client.close();
	    return
	  });
	})
});


router.get('/tmp', (req, res) => {
	let p = req.body.path || req.query.path || null
	if(p) {		
		if(p.indexOf('.') > 1) {
			readline(temp + p).then((data, err) => {
				if(err) throw err
				if(data.errno) {
					res.send(data)
					return
				}
				res.send(data)
			})
			return
		} 

		fs.readdir(temp + p, (err, data) => {
			res.send(data)
		})
		return
	}

	fs.readdir(temp, (err, data) => {
		if(err) console.log(err)
		res.send(data)
	})
})

router.get('/extract', (req, res) => {
	extract(req.body.path, (error, stdout, stderr) => {
		  if (error) {
		    res.send(error)
		    return;
		  }
		  res.redirect('/tmp')
		}
	)
})

router.post('/', (req, res) => {
	let file = req.files
	if(!file) {
		res.status(405).send({ err : "Can't find pinned file" })
		return
	}
	let filename = req.body.filename || file.file.name;

	if(!fs.existsSync(files + filename)) {
		mongo((err, client) => {
			let db = client.db().collection('files');

			function insert() {
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
				req.files.file.mv(files + '/' + filename)
				let n = String.fromCharCode(13, 10)
				res.send(`
					${filename} uploaded 
					
					item inserted ${JSON.stringify(item)}
				`)

				client.close()
			}

		 	db.find({title: req.body.title}).toArray((err, data) => {
			    if(data.length > 0) {
			    	res.send({
			    		err : 'title exist',
			    		at_files: data
			    	})
			    	return
			    }
			    insert()
			    return 			    
			});
		})
		return		
 	}

 	res.send(`Name ${filename} exist 

 	 Stats : ${JSON.stringify(fs.statSync(files + filename))}
 	`)
});

router.put('/', (req, res) => {
	try {
	   	JSON.parse(req.body.change_from)
		JSON.parse(req.body.change_to)
	} catch (err) {
    	res.send({
			message : "Can't read the data",
			change_from : req.body.change_from || "Null",
			change_to : req.body.change_to || "Null"
		})
	    return
	}

	let from = JSON.parse(req.body.change_from)
	let to = JSON.parse(req.body.change_to)
	let by = to.search_by
	let search_by = from

	if(by) {
		search_by = {}
		by.map((item) => {
			search_by[item] = from[item]
		})		
	}

	mongo((err, client) => { 
		if(err) throw err
		let db = client.db().collection('files')
		db.find(search_by).toArray((err, data) => {
			update = (file, data) => {
				
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
					//change 1
					res.send(data[i])
					return
				} else {
					res.send({
						message : "Please specify the target at req.body.specify : ",
						data : JSON.stringify(data)
					})
					return
				}
			} else {
				if(by) {
					// change 2
					db.update({}, { $set: { dateField: new Date(2011, 0, 1)}}, false, true);
				}
				// db.update({condField: 'condValue'}, { $set: { dateField: new Date(2011, 0, 1)}}, false, true);
				res.send(data)
				return
			}
			console.log(data)
			// change 3
			res.send(data)
						
		})

	})
})

router.delete('/', (req, res) => {
	if(req.body.path) {
		let r = req.body.path
		let p = files + req.body.path
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

router.use(function(req, res, next) {
  res.redirect('/')
});

module.exports = router