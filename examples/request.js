
var request = require('request');

var Parser = require('../');

var url = process.argv.slice(2)[0];

if(!url) process.exit(1);

request(url)
  .pipe(new Parser)
  .pipe(process.stdout);
