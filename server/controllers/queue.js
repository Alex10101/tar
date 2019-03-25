const fs = require('fs');
const File = require('./../models/fileSchema');
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
    File.deleteOne(item, (err, data) => {
      if(err) throw err
      console.log('deleted from db :', data)
    });
  });
};

removeExpired = () => {
  const find = {
    timestamp: {
      $lt: new Date().getTime()
    },
  };

  File.find(find).exec(function(err, items) {
    if (err) throw err;
    console.log('Removed :', items)
    remove(items);
  });
}

getNextToExpire = () => {
  let nextStamp = new Promise((res, rej) => {
    File.find()
      .sort({ timestamp: 1 })
      .limit(1)
      .exec(function(err, item) {
        if (err) throw err;
        console.log('Next :', item[0])
        if(!item[0].timestamp) {
          remove(item);
          push()
          return;
        }
        res(item[0].timestamp)
      });
  })

  return nextStamp;
}


let timer = 0
let queue = () => {}

async function push(newdate) {
  if(newdate) {
    newdate = newdate.getTime()
    let newtimer = newdate - new Date().getTime()
    if(newtimer < timer) {
      clearTimeout(queue)
      timer = newtimer
      queue = setTimeout(() => removeExpired(), newtimer)
      console.log('Next timeout in', new Date(time).getHours(), ':', new Date(time).getMinutes())
      return
    }
  }

  if(!newdate) {
    removeExpired()
    const time = await getNextToExpire()
         timer = time - new Date().getTime()
    queue = setTimeout(() => removeExpired(), timer) 
    console.log('Next timeout in', new Date(time).getHours(), ':', new Date(time).getMinutes())
  }
}


exports.push = push