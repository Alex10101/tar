const fs = require('fs');
const pt = require('path');
const File = require('../models/fileSchema');
const zlib = require('zlib');
const ts = require('stream');
const timer = require('./timer')

const filesDir = pt.join(__dirname, '..', 'public', 'files');

timer.push()

exports.index = (req, res) => {
  const data = res.locals.data;
  File.find(data.search_by)
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
        title: data.title,
        filename: data.filename,
        description: data.description,
        expire: data.expire,
        timestamp: new Date(data.expire).getTime(),
      });

      file.save(file);
      req.files.file.mv(path, (err) => {
        if (err) throw err;
        timer.push(file.expire)
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
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked'
  });

  let i = 1;

  if(data.skip > 0) {
    data.limit = data.skip + data.limit
  }

  const liner = new ts.Transform( {objectMode: true} );
  liner._transform = function(chunk, encoding, done) {
    if(chunk) {
      let arr = [];
      if (this._lastLineData) {
        console.log(this._lastLineData)
        arr.push(this._lastLineData)
      };
      arr = chunk.toString().split(/\n/);
      map = (line) => {
          if(i >= data.skip) {
            this.push(`Line ${i} ${line.replace(/\u0000/g,'')} \n`)
            return
          }
          this.push('')
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
