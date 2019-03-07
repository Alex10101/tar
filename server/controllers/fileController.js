const fs = require('fs');
const pt = require('path');
const File = require('../models/fileSchema');
const zlib = require('zlib');
const ts = require('stream');

const home = pt.join(__dirname, '..');
const public = pt.join(home, 'public');
const filesDir = pt.join(public, 'files');

exports.index = (req, res) => {
  const data = res.locals.data;

  File.find(data.searchBy)
      .skip(data.skip)
      .limit(data.limit)
      .exec((err, data) => {
        if (err) throw err;
        res.send(data);
      });
};


exports.upload = (req, res) => {
  const data = res.locals.data;
  const path = pt.join(filesDir, data.filename);

  fs.exists(path, (err) => {
    if (err) {
      res.send({
        err: `File ${data.filename} exist`,
        stats: fs.statSync(path),
      });
    } else {
      post();
    }
  });

  function post() {
    function insert() {
      const file = new File({
        title: data.title || undefined,
        filename: data.filename,
        description: data.description || undefined,
        expire: data.expired || undefined,
        timestamp: new Date(data.expired).getTime() || undefined,
      });

      file.save(file);
      req.files.file.mv(path, (err) => {
        if (err) throw err;
        res.send({
          msg: {
            uploaded: data.filename,
            inserted: file,
          },
        });
      });
    }

    File.find({title: data.title}).exec((err, data) => {
      if (data.length > 0) {
        res.send({
          err: 'title exist',
          at_files: data,
        });
        return;
      }
      insert();
    });
  }
};

exports.read = (req, res) => {
  const data = res.locals.data;
  res.writeHead(200, {
    'Transfer-Encoding': 'chunked',
    'Content-Type': 'text/plain',
  });

  let i = 1;

  const liner = new ts.Transform( {objectMode: true} );
  liner._transform = function(chunk, encoding, done) {

    if(chunk) {
      let arr;
      if (this._lastLineData) arr = this._lastLineData + arr;
      arr = chunk.toString().split(/\n/); 
      map = (line) => {
        if(i > data.limit + 1){
          console.log('die')
          stream.destroy()
          this.end();
          return;
        } else {
          this.push('line ' + i + ' ' + line.replace(/\u0000/g,'') + '\n')
          i++
        }
      }     
      arr.map((line) => {
        map(line)
        return
      });
      done();
    }

  liner._flush = function(done) {
      if (this._lastLineData) this.push(this._lastLineData);
      this._lastLineData = null;
      done();
  };
};

  const stream = new fs.createReadStream(pt.join(filesDir, data.path))
      .pipe(zlib.createGunzip())
      .pipe(liner)
      .pipe(res)

  stream.on('end', function() {
    res.end();
  });

  res.on('close', function() {
    console.log('Close');
    stream.destroy();
  });
};
