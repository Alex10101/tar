const fs = require('fs')

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://dan:dan123@ds127115.mlab.com:27115/tar'
const connection = MongoClient.connect

cb = (err, client) => {
	const db = client.db().collection('files');
	if(err) {
		console.log(err)
	}

	remove = (arr) => {
		arr.map((item) => {
			let path = item.path
			if(fs.existsSync('./files/' + path)) {
				fs.unlink(path, (err) => {
				  if (err) throw err
				  console.log('deleted from fs : ', item.path);
				})
			}
			db.deleteOne(item)
			console.log('deleted from db : ', item);
		})
	}

	let find = {
		timestamp : {
			$lt : new Date().getMinutes(),
			$ne: "Null"
		}
	}


	db.find(find).toArray(function(err, items) {
		remove(items);
		client.close();
	});
} 



connect = (callback) => {
	MongoClient.connect(url, { useNewUrlParser: true }, callback);
}

connect(cb)

module.exports = connect
