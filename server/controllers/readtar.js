const fs = require('fs');
const zlib = require('zlib');
const ts = require('stream');
const liner = new ts.Transform( {objectMode: true} );
const pt = require('path');
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter;
emitter.setMaxListeners(1000)

readtar = (path, argSkip, argLimit) => {
  liner._transform = function(chunk, encoding, done) {
    let data = chunk.toString();
    if (this._lastLineData) data = this._lastLineData + data;

    const lines = data.split(/(\r?\n)/);
    this._lastLineData = lines.splice(lines.length-1, 1)[0];

    lines.forEach(this.push.bind(this));
    done();
  };

  liner._flush = function(done) {
    if (this._lastLineData) this.push(this._lastLineData);
    this._lastLineData = null;
    done();
  };

  let i = 1;
  const skip = argSkip || 0;
  const limit = argLimit || 10;

  const stream = fs.createReadStream(path, {flags: 'r'})
      .on('unpipe', (data) => {
        console.log('piped');
      })
      .pipe(zlib.createGunzip())
      .pipe(liner);

  stream.on('data', (line) => {
    // console.log('data', i);
    // stream.pause();
    if (i === 1) {
      line = line.substr(line.lastIndexOf('\u0000') + 1);
    }
    if (i === limit + 1) {
      console.log('close');
      stream.destroy();
      process.exit();
      return;
    }
    if (line === '\n') {
      process.send(line);
      emitter.removeListener('message', process.send, stream);
      return;
    }
    process.send(` Line ${i}, ${line} `);
    emitter.removeListener('message', process.send, stream);
    i++;
  });
};

process.on('message', (msg) => {
  const skip = msg.skip || undefined;
  const limit = msg.limit || undefined;
  readtar(pt.join(__dirname, '../public/files/', msg.path), skip, limit);
});
