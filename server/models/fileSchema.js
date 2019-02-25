const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  title: String,
  filename: String,
  description: String,
  expire: Date,
  timestamp: Number,
});

const File = mongoose.model('files', fileSchema);

module.exports = File;
