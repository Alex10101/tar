const app = require('express');
const router = app.Router();
const fs = require('fs');
const pt = require('path');

const readtar = require('../fs/readtar.js');

require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const url = process.env.DB_URI;
const mongo = (cb) => MongoClient.connect(url, {useNewUrlParser: true}, cb);

const home = pt.join(__dirname, '..', '..');
const public = pt.join(home, 'public');
const filesDir = pt.join(public, 'files');

get = (req, name, Null) => {
  return req.body[name] || req.query[name] || Null;
};

router.get('/', (req, res) => {
  const skip = Number(get(req, 'skip', 0));
  const limit = Number(get(req, 'limit', 10));
  const searchBy = get(req, 'search_by', {});

  mongo((err, client) => {
    if (err) throw err;
    const db = client.db();
    db.collection('files').find(searchBy)
        .skip(skip)
        .limit(limit).toArray((err, data) => {
          if (err) throw err;
          res.send(data);
          client.close();
          return;
        });
  });
});

router.get('/tar', (req, res) => {
  const path = get(req, 'path');
  const skip = Number(get(req, 'skip'));
  const to = Number(get(req, 'to'));

  if (path) {
    readtar(pt.join(filesDir, path), skip, to).then((data, err) => {
      if (err) throw err;
      if (data.errno) {
        res.send(data);
        return;
      }

      res.send({
        lines: data,
      });
    });
  }
});

router.post('/', (req, res) => {
  const file = req.files;
  if (!file) {
    res.status(405).send({err: 'Can\'t find pinned file'});
    return;
  }

  const data = JSON.parse(req.body.data);
  let filename = data.specify || file.file.name;
  const spec = data.specify;
  if (spec) { // to save extension
    const i = spec.indexOf('.');
    if (i > -1) {
      const head = spec.substr(0, i);
      const tail = file.file.name.substr(file.file.name.indexOf('.'));
      filename = head + tail;
    }
  }

  const path = pt.join(filesDir, filename);

  function post() {
    mongo((err, client) => {
      if (err) throw err;
      const db = client.db().collection('files');

      function insert() {
        const item = {
          title: data.title || undefined,
          filename: filename,
          description: data.description || undefined,
          expire: data.expired || undefined,
          timestamp: new Date(data.expired).getTime() || undefined,
        };

        db.insertOne(item);
        req.files.file.mv(path, (err) => {
          if (err) throw err;
          res.send({
            msg: {
              uploaded: filename,
              inserted: item,
            },
          });
          client.close();
        });
      }

      db.find({title: data.title}).toArray((err, data) => {
        if (data.length > 0) {
          res.send({
            err: 'title exist',
            at_files: data,
          });
          return;
        }
        insert();
        client.close();
        return;
      });
    });
    return;
  }
  fs.exists(path, (err) => {
    if (err) {
      res.send({
        err: `File ${filename} exist`,
        stats: fs.statSync(path),
      });
    } else {
      post();
    }
  });
});

router.use(function(req, res, next) {
  res.redirect('/');
});

module.exports = router;
