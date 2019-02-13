const fs = require('fs')

require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const url = process.env.DB_URI
const connection = MongoClient.connect

cb = (err, client) => {
	if(err) {
		throw err
	}
	const db = client.db().collection('files');

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
			$lt : new Date().getTime(),
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
