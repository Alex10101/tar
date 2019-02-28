const fs = require('fs');
const es = require('event-stream');
const zlib = require('zlib');

readtar = (path, argSkip, argTo) => {
  let from = 0;
  const pass = argSkip || 0;
  const to = argTo || 8;

  const stream = fs
      .createReadStream(path)
      .pipe(zlib.createGunzip())
      .pipe(es.split(/\n/))
      .pipe(es.map(esmap = (data, cb) => {
        cb(null, decorate(data));
      }));

  function decorate(data) {
    if (from === to) {
      stream.destroy();
      return;
    }
    from++;
    if (from > pass) {
      return data.replace(/\u0000/gi, '');
    }
  }

  return stream;
};

module.exports = readtar;
