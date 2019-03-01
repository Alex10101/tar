const fs = require('fs');
const es = require('event-stream');
const zlib = require('zlib');

readtar = (path, argSkip, argTo) => {
  let from = 0;
  const pass = argSkip || 0;
  const to = (argTo || 50) - 1;
  let call = 0;


  const stream = fs.createReadStream(path, {flags: 'r'})
      .pipe(zlib.createGunzip())
      .pipe(es.split(/(\r?\n)/))
      .pipe(es.mapSync( (line) => decorate(line)));


  function decorate(data) {
    call++;
    if(data === '\n') {
      return data;
    }
    if (from === to) {
      stream.destroy();
      console.log('destroyed on line', from, ' call:', call);
      return 0;
    }
    from++;
    if (from > pass) {
      return 'line : ' + from + ' data : ' + data.replace(/\u0000/gi, '');
    }
  }

  return stream;
};

module.exports = readtar;
