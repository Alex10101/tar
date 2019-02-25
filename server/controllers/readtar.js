const readline = require('readline');
const fs = require('fs');
const zlib = require('zlib');

readtar = (path, argSkip, argTo) => {
  if (argSkip && argTo) {
    if (argSkip > argTo) {
      throw new Error('argSkip > argTo');
    }
  } else if (argSkip && !argTo) {
    if (argSkip > 10) {
      throw new Error('skip > 10 & !argTo');
    }
  }

  const stream = fs.createReadStream(path);
  const lineReader = readline.createInterface({
    input: stream.pipe(zlib.createGunzip()),
  });

  const promise = new Promise((res, rej) => {
    stream.on('error', (err) => {
      res(err);
    });
    lineReader.on('close', () => {
      for (i = 0; i < arr.length; i++) {
        if (arr[i].indexOf('\u0000') > -1) {
          const pattern = /\u0000/gi;
          arr[i] = arr[i].replace(pattern, '');
        }
      }

      res(arr);
    });
  });

  let from = 0;
  const pass = argSkip || 0;
  const to = argTo || 10;
  const arr = [];

  lineReader.on('line', (line) => {
    if (from === to) {
      lineReader.close();
      return;
    }
    from++;
    if (from > pass) {
      arr.push(line);
    }
  });

  return promise;
};

module.exports = readtar;
