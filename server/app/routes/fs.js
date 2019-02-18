const app = require('express');
const router = app.Router();
const fs = require('fs');
const pt  = require('path');

const extract = require('../fs/extract.js');
const readline = require('../fs/readline.js');
const readtar = require('../fs/readtar.js');
const { mongo, ObjectId } = require('../fs/mongo-fs-del.js');

const home  = pt.join(__dirname, '..', '..');
const public = pt.join(home, 'public');
const filesDir = pt.join(public, 'files');
const temp = pt.join(public, 'tmp');

router.get('/', (req, res) => {
	let get = (name, Null) => req.body[name] || req.query[name] || Null;
	let skip = Number(get('skip', 0));
	let limit = Number(get('limit', 10));
	let search_by = get('search_by', {});
	mongo((err, client) => {
	  if (err) throw err;
	  let db = client.db();
	  db.collection("files").find(search_by).skip(skip).limit(limit).toArray((err, data) => {
	    if (err) throw err;
	    res.send(data);
	    client.close();
	    return
	  });
	})
});

router.get('/tar', (req, res) => {
	let get = (name) => req.body[name] || req.query[name] || null;
	let path = get('path');
	let skip = Number(get('skip'));
	let to   = Number(get('to'));
	if(path) {		
		readtar(pt.join(filesDir, path), skip, to).then((data, err) => {
			if(err) throw err;
			if(data.errno) {
				res.send(data);
				return
			}

			res.send({
				lines : data
			})
		})
	}
})

router.get('/tmp', (req, res) => {
	let get = (name) => req.body[name] || req.query[name] || null;
	let path = get('path');
	let from = get('from');
	let to   = get('to');
	if(path) {		
		if(path.indexOf('.') > 1) {
			readline(temp + path, from, to).then((data, err) => {
				if(err) throw err;
				if(data.errno) {
					res.send(data);
					return
				}
				res.send({
					lines : data
				})
			})
			return
		} 

		fs.readdir(temp + path, (err, data) => {
			res.send({
				dir: data
			})
		})
		return
	}

	fs.readdir(temp, (err, data) => {
		if(err) console.log(err);
		res.send({
			tmp_folder : data
		})
	})
})

router.put('/extract', (req, res) => {
	extract(req.body.path, (error, stdout, stderr) => {
		  if (error) {
		    res.send({ err : error })
		    return
		  }
		  res.redirect('/tmp');
		}
	)
})

router.post('/', (req, res) => {
	let file = req.files;
	if(!file) {
		res.status(405).send({ err : "Can't find pinned file" })
		return
	}

	let data = JSON.parse(req.body.data);
	let filename = data.specify || file.file.name;

	let spec = data.specify;
	if(spec) {
		let i = spec.indexOf('.');
		if(i > -1) {
			let head = spec.substr(0, i);
			let tail = file.file.name.substr(file.file.name.indexOf('.'));
			filename = head + tail;
		}
	}

	let path = pt.join(filesDir, filename);

	function post() {
		mongo((err, client) => {
			let db = client.db().collection('files');

			function insert() {
				let item = {
					title: data.title || undefined,
					filename : filename,
					description: data.description || undefined,
					expire : data.expired || undefined,
					timestamp : new Date(data.expired).getTime() || undefined
				}

				db.insertOne(item);
				req.files.file.mv(path, (err) => {
					if(err) throw err;
					res.send({ 
						msg : { 
							uploaded : filename,
							inserted : item
							}
					})
					client.close();
				})
			}

		 	db.find({title: data.title}).toArray((err, data) => {
			    if(data.length > 0) {
			    	res.send({
			    		err : 'title exist',
			    		at_files: data
			    	})
			    	return
			    }
			    insert();
			    client.close();
			    return    
			});
		});
		return
	}
	fs.exists(path, (err) => {
		if(err) {
 			res.send({
		 		err : `File ${filename} exist`,
		 		stats : fs.statSync(path)
		 	})
		} else {
			post();
		}
	})
});

router.put('/', (req, res) => {
	let id = req.body.id;
	let put = JSON.parse(req.body.put);

	if(!id && !put) {
		res.send({
			err: 'Wrong data',
			msg : req.body
		})
		return
	}

	mongo((err, client) => {
		let db = client.db().collection('files');
		db.findOneAndUpdate(
		{ _id : new ObjectId(id) }, 
		{ $set: put }, 
		{ returnNewDocument: true }, 
		(err, data) => {
			if(err) throw err
			res.send({
				msg : 'updated',
				data : data
			})	
		})	
	})

})

router.delete('/', (req, res) => {

	db = () => {
		mongo((err, client) => {
			let db = client.db().collection('files');
			db.deleteOne({ _id : new ObjectId(req.body.id) }, (err, data) => {
				if(err) throw err
			})
			client.close();
		})
	}

	files = () => {
		let name = req.body.path;
		let path = pt.join(filesDir, name);
		if(fs.existsSync(path)) {
			fs.unlink(path, (err) => {
				if(err) throw err
			})
		}	
	}

	if(req.body.id) {
		db()
	} else if(req.body.path) {
		files()
	} else if(!req.body.id && !req.body.path) {
		res.send({ err : 'req.body.path or req.body.id is not specified' })
	}	
	res.status(500).send({})
})

router.use(function(req, res, next) {
  res.redirect('/');
});

module.exports = router