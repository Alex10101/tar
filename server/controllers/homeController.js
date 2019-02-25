const File = require('../models/fileSchema');

get = (req, name, Null) => {
  return req.body[name] || req.query[name] || Null;
};


