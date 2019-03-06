const fs = require('fs');
const pt = require('path');
const readtar = require('./readtar.js');
const File = require('../models/fileSchema');

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
  let data = res.locals.data;

  res.writeHead(200, {
    'Transfer-Encoding': 'chunked',
    'Content-Type': 'text/plain',
  });

  data = {
    path: pt.join(filesDir, data.path),
    from: data.skip || undefined,
    to: data.limit || 10,
  };
  let i = 1;

  const stream = readtar(data, res)
      .on('error', (err) => {
        console.log(err);
        res.end();
      })
      .on('data', (line) => {
        if (i === data.to + 1) {
          // console.log('close');
          res.end('\n');
          stream.unpipe();
          return;
        }
        res.write('Line' + i + line.toString() + '\n');
        i++;
      });

  res.on('close', function() {
    stream.unpipe();
    console.log('Close');
  });
};
