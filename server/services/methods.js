const Joi = require('joi');
const schemas = require('./schemas');

get = (req, name, Null) => {
  return req.body[name] || req.query[name] || Null;
};

exports.index = (req, res, next) => {
  const data = {
    skip: get(req, 'skip', '0'),
    limit: get(req, 'limit', '10'),
    search_by: JSON.parse(get(req, 'search_by', '{}')),
  };

  Joi.validate(data, schemas.index)
      .catch((err) => {
        res.status(422).send({ 
          data: data,  
          err : err.details[0].message.replace(/["]/ig, '')
        });
        return;
      })
      .then((pass) => {
        if (pass) {
          data['skip'] = Number(data.skip);
          data['limit'] = Number(data.limit);

          res.locals.data = data;
          next();
        }
      });
};

exports.upload = (req, res, next) => {
  if (!req.files.file) {
    res.send({err: 'no file'});
    return;
  }

  let data = req.body.data;

  if (Buffer.byteLength(data) > 300) {
    res.send({err: 'data is more than 300kb'});
    return;
  }

  data = JSON.parse(data);

  const name = req.files.file.name;
  data['filename'] = data.specify || name;
  const spc = data.specify;

  if (spc) { // to save extension
    const i = spc.indexOf('.');
    if (i > -1) {
      const head = spc.substr(0, i);
      const tail = name.substr(name.indexOf('.'));
      data['filename'] = head + tail;
      delete data.specify
    }
  }
  Joi.validate(data, schemas.upload)
    .catch((err) => {
      res.status(422).send({ 
        data: data,  
        err : err.details[0].message.replace(/["]/ig, '')
      });
      return;
    })
  .then((pass) => {
    if(pass) {
      res.locals.data = data;
      next();
    }
  })
};

exports.read = (req, res, next) => {
  const data = {
    skip: get(req, 'skip', '0'),
    limit: get(req, 'limit', '10'),
    path: get(req, 'path', undefined),
  };

  if (!data.path) {
    res.send({err: 'path is not defined'});
    return;
  }

  Joi.validate(data, schemas.read, (
    (err, data) => {
      if (err) {
        res.send(err);
        return;
      }

      data['skip'] = Number(data.skip);
      data['limit'] = Number(data.limit);

      res.locals.data = data;
      next();
    }));
};
