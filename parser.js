
var fs = require('fs'),
  path = require('path'),
  util = require('util'),
  stream = require('stream'),
  Lexer = require('gherkin').Lexer('en'),
  templates = require('./template');

//
// Basic gherkin feature -> mocha bdd test suite
//
//    fs.createReadStream(something).pipe(new Parser).pipe(process.stdout);
//
// Basic gherkin to mocha mapping:
//
// - feature      -> top-level describe()
// - scenario(s)  -> inner describe(), might have one or more
// - step(s)      -> it()
//

module.exports = Parser;

function Parser() {
  this.readable = this.writable = true;

  this.indent = '';

  this.steps = [];
  this.features = [];
  this.scenarios = [];

  this.chunks = [];

  this.lexer = new Lexer(this);
  this.template = templates.body;

  stream.Stream.call(this);
}

util.inherits(Parser, stream.Stream);

Parser.prototype.parse = function(feature) {
  this.lexer.scan(feature);
};

//
// Stream api
//

Parser.prototype.write = function(chunk) {
  // collect all the data before streaming out.
  // should probably be done better by pausing / resuming as necessary
  this.chunks = this.chunks.concat(chunk);
};

Parser.prototype.end = function() {
  var feature = this.chunks.join('');
  this.parse(feature);
  this.emit('data', this.mocha());
  this.emit('close');
};

//
// Mocha output
//
// - feature      -> top-level describe()
// - scenario(s)  -> inner describe(), might have one or more
// - step(s)      -> it()

Parser.prototype.mocha = function() {
  var steps = this.steps;

  var data = {};
  data.feature = this.features[0];
  data.feature.desc = data.feature.desc.replace(/\n/g, ' ');
  data.scenarios = this.scenarios.map(function(scenario, i, arr) {
    var ln = scenario.line,
      last = i === arr.length - 1;
      next = arr[i + 1] ? arr[i + 1].line : 0;

    scenario.steps = steps.filter(function(step) {
      if(last) return step.line > ln;
      return step.line > ln && step.line < next;
    });

    return scenario;
  });

  return this.template.render(data);
};

//
// Gherkin parser api
//

Parser.prototype.background = function(keyword, name, desc, line) {
  this.emit('background', name, desc, line);
};

Parser.prototype.comment = function(comment, line) {
  this.emit('comment', comment, line);
};

Parser.prototype.doc_string = function(cotentType, string, line) {
  this.emit('doc_string', contentType, string, line);
};

Parser.prototype.eof = function() {
  this.emit('eof');
};

Parser.prototype.feature = function(keyword, name, desc, line) {
  this.emit('feature', name, desc, line);

  desc = desc.replace(/"/g, "'");
  this.features.push({ name: name, desc: desc, line: line });
};

Parser.prototype.row = function(cells, line) {
  // console.log('row>>', arguments);
};

Parser.prototype.scenario = function(keyword, name, desc, line) {
  this.emit('scenario', name, desc, line);

  desc = desc.replace(/"/g, "'");
  this.scenarios.push({ name: name, desc: desc, line: line });
};

Parser.prototype.step = function(keyword, name, line) {
  this.emit('step', keyword, name, line);
  this.emit(keyword, name, line);

  name = name.replace(/"/g, "'");
  this.steps.push({ step: keyword, name: keyword + name, line: line });
};

Parser.prototype.tag = function(tag, line) {
  this.emit('tag', tag, line);
};
