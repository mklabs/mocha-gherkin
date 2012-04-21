
var sandbox = module.exports;

var mapping = sandbox.mapping = [];

sandbox.Given = function(reg, fn) {
  mapping.push({ type: 'Given', reg: reg, fn: fn });
};

sandbox.When = function(reg, fn) {
  mapping.push({ type: 'When', reg: reg, fn: fn });
};

sandbox.Then = function(reg, fn) {
  mapping.push({ type: 'Then', reg: reg, fn: fn });
};

sandbox.And = function(reg, fn) {
  mapping.push({ type: 'And', reg: reg, fn: fn });
};

sandbox.match = function(name) {
  return this.mapping.filter(function(m) {
    return m.reg.test(name);
  })[0];
};

