const fs = require('fs');
const pt = require('path');
// const readtar = require('./readtar.js');
const File = require('../models/fileSchema');
const { fork } = require('child_process')

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

  res.writeHead(200, {
    'Transfer-Encoding': 'chunked',
    'Content-Type': 'text/plain',
  });

  const data = res.locals.data;

  const options = {
    stdio: ['ipc']
  }

  const forked = fork('./controllers/readtar.js', [], options);
  
  forked.send({
    path: data.path,
    skip: data.skip,
    limit: data.limit,
  });

  handleMessage = (msg) => {
    if(msg === 'end') {
      res.end();
      forked.kill();
      return;
    }
    res.write(msg.data);
    if(msg.line === data.limit) {
      res.end();
      forked.kill();
      return;
    }
  };

  close = () => {
    res.end('\n');
  };
  forked.on('close', close);
  res.on('close', function() {
    console.log('Close');
    forked.kill();
  });

  forked.on('message', handleMessage);

  // const stream = readtar(pt.join(filesDir, data.path), data.skip, data.limit)
  //     .on('error', (err) => {
  //       console.log(err);
  //       res.send('err');
  //     })
  //     .on('data', (data) => {
  //       res.write(data)
  //     })
  //     .on('close', () => {
  //       res.end('\n')
  //     })

  // res.on('close', function() {
  //   stream.destroy();
  //   console.log('Close received!');
  // });
};
