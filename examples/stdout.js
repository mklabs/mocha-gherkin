
var fs = require('fs'),
  path = require('path'),
  Parser = require('..');

var args = process.argv.slice(2);

// some test

var feature = args[0] || 'basics.feature';

fs.createReadStream(path.join(__dirname, feature))
  .pipe(new Parser).on('close', console.log.bind(console))
  .pipe(process.stdout);


