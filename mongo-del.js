const fs = require('fs')

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://dan:dan123@ds127115.mlab.com:27115/tar'
const connection = MongoClient.connect

date = (str) => {
	let addMinute = 0;
	let addSeconds = 0;
	if(str) {
		let arr = str.split(' ')
		addMinute = arr[0]
		addSeconds = arr[1]
	}


	const opts = {
	  // year: 'numeric',
	  // month: 'numeric',
	  // day: 'numeric',
	  hour: 'numeric',
	  minute: 'numeric',
	  second: 'numeric',
	  hour12: false,
	}

	let now = new Date()
		addMinute ? now.setMinutes(now.getMinutes() + addMinute) : ''
		addSeconds ? now.setSeconds(now.getSeconds() + addSeconds) : ''

	let stamp = now.getTime()
		now = new Intl.DateTimeFormat('en-US', opts).format(now)


	return { time: now.toString(), stamp: stamp.toString() }
}

cb = (err, client) => {
	const db = client.db().collection('files');
	if(err) {
		console.log(err)
	}

	remove = (arr) => {
		arr.map((item) => {
			let path = item.path
			if(fs.existsSync(path)) {
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
			$lt : date().stamp,
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

module.exports = {
	mongo: connect,
	date : date
}