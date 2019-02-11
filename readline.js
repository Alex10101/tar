readline = (path, count) => {

	const stream = require('fs').createReadStream(path)
	const rl = require('readline').createInterface({
	  input: stream
	});


	let from = 0
	let to = count || 100
	let arr = []

	rl.on('line', function (line) {
		if(from === to) {
			return
		}
		from++
		arr.push(line)
	  // console.log('Line ' + from + " console.log():", line);
	});

	return new Promise((res, rej) => {
		rl.on('close', () => {
			res(arr)
		})
	})
	
}

// readline('./tmp/1/1.txt').then((arr) => console.log(arr))
module.exports = readline