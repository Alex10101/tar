const fs = require('fs');
const pt = require('path');
const File = require('../models/fileSchema');
const zlib = require('zlib');
const ts = require('stream');
const queue = require('./queue')

const home = pt.join(__dirname, '..');
const public = pt.join(home, 'public');
const filesDir = pt.join(public, 'files');

queue.push()

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
        expire: data.expire || undefined,
        timestamp: new Date(data.expire).getTime() || undefined,
      });

      file.save(file);
      console.log('file.save(file);')
      req.files.file.mv(path, (err) => {
        if (err) throw err;
        queue.push(file.expire)
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
    'Transfer-Encoding': 'chunked'
  });

  let i = 1;

  const liner = new ts.Transform( {objectMode: true} );
  liner._transform = function(chunk, encoding, done) {
    if(chunk) {
      let arr;
      if (this._lastLineData) {
        console.log(this._lastLineData)
        arr.push(this._lastLineData)
      };
      arr = chunk.toString().split(/\n/);
      map = (line) => {
          if(i) {
            this.push('Line ' + i + ' ' + line.replace(/\u0000/g,'') + '\n')
          }
      }     
      arr.map((line) => {
        map(line)
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

  liner.on('data', (line) => {
    if(i === data.limit){
      console.log('stream.destroy')
      liner.end();
      stream.destroy();
    }
    i++
  })

  stream.pipe(res)

  stream.on('end', function() {
    console.log('res.end')
    liner.end();
    res.end();
  });

  res.on('close', function() {
    console.log('Close');
    stream.destroy();
  });
};
