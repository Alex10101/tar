const fs = require('fs')

let foo

fs.readdir('./files', (cb, files) => {
	foo = files
})

let file = 'server.js'

fs.stat(file, (err, stat) => {
    console.log(stat.size / 1000000.0 + ".Mb")
})