const fs = require('fs');
const es = require('event-stream');
const zlib = require('zlib');
const pt = require('path');

readtar = (path, argSkip, argTo) => {
  let from = 0;
  const pass = argSkip || 0;
  const to = (argTo || 50);
  let call = 0;
  let ps = es.pause()

  const stream = fs.createReadStream(path, {flags: 'r'})
      .pipe(zlib.createGunzip())
      .pipe(es.split(/\n/))
      .pipe(es.mapSync( (line) => {     
        decorate(line);
      }))
      // .pipe(es.wait(function (err, body) {
      //   if(!body) {
      //     console.log()
      //   }
      // }))


  function decorate(data) {
    call++;

    if (from > pass) {
      process.send({
        'data' : 'line : ' + from + ' data : ' + data.replace(/\u0000/gi, '') + '\n',
        'line' : from,
      });
    }

    stream.on('end', () => {
      process.send('end')
    })

    if (from > to) {
      stream.end();
      console.log('destroyed on line', from);
      // process.exit();
      return;
    }
    from++;
  }

  return stream;
};

process.on('message', (msg) => {
  const skip = msg.skip || undefined;
  const limit = msg.limit || undefined;
  readtar(pt.join(__dirname, '../public/files/', msg.path), skip, limit);
});