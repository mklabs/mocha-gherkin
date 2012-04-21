
var fs = require('fs'),
  path = require('path');

var Parser = require('../');

var steps = process.argv.slice(2)[0];

var parser = new Parser({
  steps: steps ? fs.readFileSync(path.join(__dirname, steps), 'utf8') : null
});

process.openStdin()
  .pipe(parser)
  .pipe(process.stdout);

