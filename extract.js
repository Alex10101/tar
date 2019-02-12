const { exec } = require('child_process');
const fs = require('fs');

const dir = './files';
const tmp = './tmp'
const cd = `cd ${dir} && exec`

extract = (path, cb) => {
	clean = (path) => {
	  if (fs.existsSync(path)) {
	    fs.readdirSync(path).map((file) => {
	      let next = path + "/" + file;
	      if (fs.lstatSync(next).isDirectory()) {
	        clean(next);
	      } else {
	        fs.unlinkSync(next);
	      }
	    });

	    if(path === tmp) return
	    fs.rmdirSync(path);
	  }
	};

	clean(tmp)

	exec(`${cd} tar -xzvf  ${path} -C ../tmp --keep-old-files `, cb)
}

module.exports = extract
