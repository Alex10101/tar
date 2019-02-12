readline = (path, count) => {

	const stream = require('fs').createReadStream(path)
	const rl = require('readline').createInterface({
	  input: stream
	});

	let promise = new Promise((res, rej) => {
		stream.on('error', (err) => {
			res(err)
		})
		rl.on('close', () => {
			res(arr)
		})
	})

	let from = 0
	let to = count || 100
	let arr = []

	rl.on('line', function (line) {
		if(from === to) {
			return
		}
		from++
		arr.push(line)
	});
	return promise	
}

module.exports = readline