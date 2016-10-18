
var fs = require('fs');
var hbs = require('handlebars');
var path = require('path');

module.exports = hbs.compile(fs.readFileSync(path.join(__dirname, 'body.mustache'), 'utf8'));
