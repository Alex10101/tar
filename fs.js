const { exec } = require('child_process');
let cd = 'cd ./files && exec '

read = (path, callback) => {
	if(path == '/favicon.ico') return
	if(path === undefined) path = '';
	path = path.slice(1)

	if(path.indexOf('.tar') > -1) {
		let p = path
		let tar = p.indexOf('.tar')

		if(p.substr(tar).indexOf('/') > -1) {
			let head = p.substr(0, tar)
			let tail = p.substr(tar)
				tail  = tail.indexOf('/') + head.length

				head = p.substr(0, tail)
				tail = p.substr(tail + 1)
				// console.log(head, tail)

			// if file or folder in tar
			return exec(`${cd} tar -tvf ${head} | head -10 ${tail}`, callback)

		}
		// if tar
		return exec(`${cd} tar -tvf ${path}`, callback)

	}
	if(path.indexOf('.', [1]) > -1) {
		// if file
		return exec(`${cd} head -10 ${path}`, callback)

	}
	// if folder
	return exec(`${cd}  ls -lh ${path}`, callback)

	
}

// read(
// 	// '/1'
// 	// '/1.txt'
// 	// '/1.tar.gz'
// 	'/1.tar.gz/1.txt'
// 	,
// 	(err, stdout, stderr) => {
// 		console.log(`${stdout}`)
// 		console.log(`${stderr}`)
// 	}
// )

module.exports = read