const fs = require('fs');
const zlib = require('zlib');
const ts = require('stream');
const liner = new ts.Transform( {objectMode: true} );
const pt = require('path');





// function requestCompleted(){
//   liveRequests--;
//   if(streamPaused && liveRequests < maxLiveRequests){
//     streamPaused = false;
//     requestClient.emit("resumeStream");
//   }
// }
//
// requestClient._write = function (data, enc, next){
//   makeRequest(data, requestCompleted);
//   liveRequests++;
//
//   if(liveRequests >= maxLiveRequests){
//     streamPaused = true;
//     requestClient.once("resumeStream", function resume(){
//       next();
//     });
//   }
//   else {
//     next();
//   }
// };


// var liveRequests = 0;
// var maxLiveRequests = 10;
// var streamPaused = false;

readtar = (path, argSkip, argLimit) => {
  liner._transform = function(chunk, encoding, done) {
    // stream.pause()
    // liveRequests++;
    // if(liveRequests > maxLiveRequests) {
    //   streamPaused = true;
    //   console.log('paused');
    // }
    // await !streamPaused;
    let data = chunk.toString();
    if (this._lastLineData) data = this._lastLineData + data;

    const lines = data.split(/\n/);
    this._lastLineData = lines.splice(lines.length-1, 1)[0];

    lines.forEach(send);
    // if(liveRequests < maxLiveRequests) {
    //   streamPaused = false;
    // }
    done();
    // stream.resume()
  };

  liner._flush = function(done) {
    if (this._lastLineData) this.push(this._lastLineData);
    this._lastLineData = null;
    done();
  };

  let i = 1;
  const skip = argSkip || 0;
  const limit = argLimit || 10;

  const stream = fs.createReadStream(path, {flags: 'r'})
      .pipe(zlib.createGunzip())
      .pipe(liner);

  function send(line) {
    stream.pause();
    if(i === limit) {
      console.log('destroy')
      stream.destroy();
    }
    if (i === 1) {
      line = line.substr(line.lastIndexOf('\u0000') + 1);
    }
    process.send(` Line ${i}, ${line} \n`);
    i++;
    stream.resume();
  };
};

process.on('message', (msg) => {
  const skip = msg.skip || undefined;
  const limit = msg.limit || undefined;
  readtar(pt.join(__dirname, '../public/files/', msg.path), skip, limit);
});
