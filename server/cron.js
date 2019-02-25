const fs = require('fs');

require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const url = process.env.DB_URI;

const pt = require('path');
const home = pt.join(__dirname);
const public = pt.join(home, 'public');
const filesDir = pt.join(public, 'files');

cb = (err, client) => {
  if (err) throw err;
  const db = client.db().collection('files');

  const remove = (arr) => {
    arr.map((item) => {
      const path = pt.join(filesDir, item.filename);
      if (fs.existsSync(path)) {
        fs.unlink(path, (err) => {
          if (err) throw err;
          console.log('deleted from fs : ', item.filename);
        });
      }
      db.deleteOne(item);
      console.log('deleted from db : ', item);
    });
  };

  const find = {
    timestamp: {
      $lt: new Date().getTime(),
      $ne: 'Null',
    },
  };

  db.find(find).toArray(function(err, items) {
    remove(items);
    client.close();
  });
};


connect = (callback) => {
  MongoClient.connect(url, {useNewUrlParser: true}, callback);
};

connect(cb);
