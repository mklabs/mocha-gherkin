
var fs = require('fs'),
  path = require('path'),
  util = require('util'),
  vm = require('vm'),
  stream = require('stream'),
  Lexer = require('gherkin').Lexer('en'),
  template = require('../template'),
  sandbox = require('./sandbox');

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

function Parser(opts) {
  opts = opts || {};
  this.readable = this.writable = true;

  this.steps = [];
  this.features = [];
  this.scenarios = [];

  this.stepsDefinition = opts.step || '';
  this.sandbox = opts.sandbox || sandbox;
  this.sandbox.console = console;

  this.missing = opts.missing;

  this.modules = opts.modules || [];

  this.chunks = [];

  this.lexer = new Lexer(this);
  this.template = template;

  stream.Stream.call(this);

  this.init();
}

util.inherits(Parser, stream.Stream);

Parser.prototype.init = function(feature) {
  var steps = this.stepsDefinition;
  if(!steps) return;
  vm.runInNewContext(steps, this.sandbox);
};


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

Parser.prototype.destroy = function() {};

//
// Mocha output
//
// - feature      -> top-level describe()
// - scenario(s)  -> inner describe(), might have one or more
// - step(s)      -> it()

Parser.prototype.mocha = function() {
  var steps = this.steps;

  var data = {};
  data.modules = this.modules;
  data.feature = this.features[0];
  data.feature.desc = data.feature.desc.replace(/\n/g, ' ');
  data.scenarios = this.scenarios.map(function(scenario, i, arr) {
    var ln = scenario.line,
      last = i === arr.length - 1,
      next = arr[i + 1] ? arr[i + 1].line : 0;

    scenario.steps = steps.filter(function(step) {
      if(last) return step.line > ln;
      return step.line > ln && step.line < next;
    });

    return scenario;
  });


  if(this.missing) {
    // add missing step here
    return this.scenarios.map(function(scenario) {
      var steps = scenario.steps;
      return steps.map(function(step) {
        // clean step type from name
        var name = step.name.replace(new RegExp('^' + step.step), '');

        // cleanup name for some specific stuff like escaping "/"
        name = name.replace(/([^\\])\//g, '$1\\\/');

        // step fn handler
        var fn = step.step.trim() + '($reg, function() {\n'.replace('$reg', new RegExp(name));
        fn += '  // add code for your definition here, regexp captured paramaters can be used\n';
        fn += '  // in the function body with simple placeholders like $1, $2, ...\n';
        fn += '});\n';
        return fn;
      }).join('\n');
    }).join('');
  }

  return this.template(data);
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

  var data = { step: keyword, name: keyword + name, line: line, args: '' };
  name = data.name = data.name.replace(/"/g, "'");

  var match = this.sandbox.match(name);

  if(!match) return this.steps.push(data);

  // a step is macthing
  var src = match.fn + '',
    args = (name.match(match.reg) || []).slice(1);

  // remove first / last line of our toString'd fn
  src = src.split(/\r\n|\n/g);
  src = src.slice(1, src.length - 1).map(function(l) {
    return l ? '      ' + l : l;
  }).join('\n');

  data.body = src.replace(/\$([\d]+)/g, function(m, index) {
    return args[parseInt(index, 10) - 1];
  });

  data.args = 'done';
  this.steps.push(data);
};

Parser.prototype.tag = function(tag, line) {
  this.emit('tag', tag, line);
};
