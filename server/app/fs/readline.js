readline = (path, arg_from, arg_to) => {

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

	let from = Number(arg_from) || 0
	let to = Number(arg_to) || 100
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