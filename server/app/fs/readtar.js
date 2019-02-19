const readline = require('readline');
const fs       = require('fs');
const zlib     = require('zlib');

readtar = (path, arg_skip, arg_to) => {
	if(arg_skip && arg_to) {
		if(arg_skip > arg_to) {
			throw new Error('arg_skip > arg_to')
		}
	} else if(arg_skip && !arg_to) {
		if(arg_skip > 10) {
			throw new Error('skip > 10 & !arg_to')
		}
	}

	const stream = fs.createReadStream(path)
	let lineReader = readline.createInterface({
	  input: stream.pipe(zlib.createGunzip())
	});

	let promise = new Promise((res, rej) => {
		stream.on('error', (err) => {
			res(err)
		})
		lineReader.on('close', () => {
			for(i = 0; i < arr.length; i++) {
				if(arr[i].indexOf('\u0000') > -1) {
					let pattern = /\u0000/gi;
					arr[i] = arr[i].replace(pattern, ' ');
				}
			}

			res(arr)
		})
	})

	let from = 0;
	let pass = arg_skip || 0;
	let to = arg_to || 10;
	let arr = [];
	
	lineReader.on('line', (line) => {
		if(from === to) {
			lineReader.close()
			return
		}
	  	from++
	  	if(from > pass) {
		  	arr.push(line)
	  	}
	});

	return promise
}

// let pt = '../../public/files/file.tar.gz'
// readtar(pt).then((err, er) => {
// 	console.log(err)
// })

module.exports = readtar