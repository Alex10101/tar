const fs = require('fs');
const zlib = require('zlib');
const ts = require('stream');
const liner = new ts.Transform( {objectMode: true} );

readtar = (data) => {
  const stream = fs.createReadStream(data.path, {flags: 'r'});

  liner._transform = function(chunk, encoding, done) {
    stream.pause();
    let data = chunk.toString();
    if (this._lastLineData) data = this._lastLineData + data;

    const lines = data.split(/\n/);
    this._lastLineData = lines.splice(lines.length-1, 1)[0];

    lines.forEach(this.push.bind(this));
    stream.resume();
    done();
  };

  liner._flush = function(done) {
    if (this._lastLineData) this.push(this._lastLineData);
    this._lastLineData = null;
    done();
  };

  return stream
      .pipe(zlib.createGunzip())
      .pipe(liner);
};

module.exports = readtar;
