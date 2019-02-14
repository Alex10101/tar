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
const { mongo, ObjectId } = require('../fs/mongo-fs-del.js');

const home  = pt.join(__dirname, '..', '..');
const public = pt.join(home, 'public');
const files = pt.join(public, 'files');
const temp = pt.join(public, 'tmp');

router.get('/', (req, res) => {
	let b = req.body
	let q = req.query
	let skip = Number(b.skip || q.skip || 0);
	let limit = Number(b.limit || q.limit || 10);
	let search_by = (b.search_by || q.search_by || {})
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
		    res.send({ err : error })
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
				res.send({ 
					msg : { 
						uploaded : filename,
						inserted : JSON.stringify(item)
					}
				})

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

 	res.send({
 		err : `Name ${filename} exist`,
 		stats : JSON.stringify(fs.statSync(files + filename))
 	}) 
});

router.put('/', (req, res) => {
	let id = req.body.id
	let put = req.body.put
	try {
		JSON.parse(put)
	} catch(err) {
		res.send({
			err : err,
			item : req.body
		})
		return
	}
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
		{ 
			_id : new ObjectId(id)
		}, 

		{
			// $set: put & $set : { put }
			// inserts { put: { title: '123' } }
			//     instead of { title: '123' }
			$set: JSON.parse(req.body.put) 
		}, 

		{ 
			returnNewDocument: true 
		}, 

		(err, data) => {
			if(err) throw err
			res.send({
				msg : 'updated',
				data : data.value
			})	
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
		res.send({ err : r + ' not found' })
		return
	}
	res.send({ err : req.body.path + ' is not defined'})
})

router.use(function(req, res, next) {
  res.redirect('/')
});

module.exports = router