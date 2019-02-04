// head -10 bar.txt
// tar -tvf 1.tar.gz | head -5 1.txt
// ls -lh

const util = require('util');
const fs = require('fs');
const { exec } = require('child_process');

const stat = util.promisify(fs.readdir);



module.exports = stat
