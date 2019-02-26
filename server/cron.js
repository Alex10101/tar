const fs = require('fs');
const mongoose = require('mongoose');
const File = require('./models/fileSchema');

mongoose.set('useNewUrlParser', true);
mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/Tar');
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log(
      '%s MongoDB connection error. Please make sure MongoDB is running.'
  );
  process.exit();
});

const pt = require('path');
const home = pt.join(__dirname);
const public = pt.join(home, 'public');
const filesDir = pt.join(public, 'files');


const remove = (arr) => {
  arr.map((item) => {
    const path = pt.join(filesDir, item.filename);
    if (fs.existsSync(path)) {
      fs.unlink(path, (err) => {
        if (err) throw err;
        console.log('deleted from fs : ', item.filename);
      });
    }
    File.remove(item);
    console.log('deleted from db : ', item);
  });
};

const find = {
  timestamp: {
    $lt: new Date().getTime(),
    $ne: undefined,
  },
};

File.find(find).exec(function(err, items) {
  if (err) throw err;
  remove(items);
});

