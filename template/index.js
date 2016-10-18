
var Hogan = require('hogan.js');

//
// hogan templates
//

var templates = module.exports;
templates.body = new Hogan.Template(function(c,p,i){var _=this;_.b(i=i||"");_.b("//");_.b("\n" + i);_.b("// Mocha generated tests");_.b("\n" + i);_.b("//");_.b("\n" + i);_.b("\n" + i);if(_.s(_.f("modules",c,p,1),c,p,0,44,85,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("var ");_.b(_.v(_.f("name",c,p,0)));_.b(" = require('");_.b(_.v(_.f("path",c,p,0)));_.b("');");_.b("\n");});c.pop();}_.b("\n" + i);_.b("describe(\"");_.b(_.v(_.d("feature.name",c,p,0)));_.b("\", function() {");_.b("\n" + i);_.b("\n" + i);_.b("  describe(\"");_.b(_.t(_.d("feature.desc",c,p,0)));_.b("\", function() {");_.b("\n" + i);if(_.s(_.f("scenarios",c,p,1),c,p,0,210,371,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("\n" + i);_.b("    describe(\"");_.b(_.t(_.f("name",c,p,0)));_.b("\", function() {");_.b("\n" + i);if(_.s(_.f("steps",c,p,1),c,p,0,270,347,"{{ }}")){_.rs(c,p,function(c,p,_){_.b("\n" + i);_.b("      it(\"");_.b(_.t(_.f("name",c,p,0)));_.b("\", function(");_.b(_.v(_.f("args",c,p,0)));_.b(") {");_.b("\n" + i);_.b(_.t(_.f("body",c,p,0)));_.b("\n" + i);_.b("      });");_.b("\n");});c.pop();}_.b("\n" + i);_.b("    });");_.b("\n");});c.pop();}_.b("\n" + i);_.b("  });");_.b("\n" + i);_.b("\n" + i);_.b("});");return _.fl();;});


