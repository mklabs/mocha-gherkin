
# mocha-gherkin

*A little tool to generate Mocha BDD specs from Gherkin features*

## Installation

    npm i mklabs/mocha-gherkin --save-dev

## Description

You might now [cucumber](http://cukes.info/). There is now a robust JavaScript
based cucumber implementation \o/ with
[cucumber-js](https://github.com/cucumber/cucumber-js). This tool is not a
replacement or even trying to compete with cucumber-js. If you want a real and
valid cucumber implementation, search no more and head over the [cucumber-js
readme](https://github.com/cucumber/cucumber-js#readme). A really neat project,
worth watching which will get better and better.

Mocha is another tool I recently found , and I do like it. A lot. I felt like I
needed and I could do a little tool to generate my mocha BDD tests stub.

It's not a test framework. It's not a cucumber-js replacement. It's not
wrapping mocha to run the test, or defining any kind of report or mocha plugin.

This tool simply take a feature file, written in Gherkin syntax, as input, and
output the matching Mocha BDD tests for this feature file. It has some notion
of step definition (kinda) and can output you the missing step definition as
well.


## mocha-gherkin(1)

    Usage: cat some.feature | ./node_modules/.bin/mocha-gherkin

    Options:

      -v, --version     Output package version
      -h, --help        Output this help text
      -s, --step        Path to a step definition (kinda)
      -m, --missing     Will output missing step definition
                        instead of default generated test

## Usage

```sh
$ cat file.feature | mocha-gherkin > test.js
```

with some step (like):

```sh
$ cat file.feature | mocha-gherkin -s ./steps/step-definition.js > test.js
```


## API

The parser is a readable / writable stream, so you can pipe any stream
connected to a valid feature like:

```feature
Feature: Example feature
  As a very lazy programmer
  I want to write some feature file
  So that I can quickly make my mocha

  Scenario: Reading the tests
    Given I am in the test directory
    When I read the index.js file
    Then I should see "new Parser" somewhere
```

to a `new Parser`, and pipe it to a given destination.

    var Parser = require('mocha-gherkin');
    fs.createReadStream('local.feature')
      .pipe(new Parser)
      .pipe(process.stdout);

You'll get matching Mocha BDD style specs:

```js
describe("Example feature", function() {

  describe("As a very lazy programmer I want to write some feature file So that I can quickly make my mocha", function() {

    describe("Reading the tests", function() {

      it("Given I am in the test directory", function() {

      });

      it("When I read the index.js file", function() {

      });

      it("Then I should see 'new Parser' somewhere", function() {

      });

    });

  });

});
```

## Steps definition (kinda)

You can fill in the body of `it()` handlers with some kind of step
definitions (definitely not valid cucumber step definitions.. but kind of)

```js
var parser = new Parser({
  step: fs.readFileSync('./steps.js', 'utf8')
});
```

The `step.js` file is a JavaScript file running in a new [vm][] context,
with `Given`, `When`, `Then` and `And` function available. Each one
takes two argument, a regexp to match and a callback to read and use as
a body function for mocha `describe()` and `it()`.

Captured parameters are available as `$1`, `$2` and so on, these
placeholders get replaced by their relevant values from
feature description.

```js
Given(/I am in the "(.*)" directory/, function(done) {
  this.base = process.cwd();
  process.chdir(path.resolve('$1'));
  done();
});

When(/I read the "(.*)" file/, function(done) {
  this.file = fs.createReadStream('$1');
  this.file.pause();
  done();
});

And(/I pipe it through a "(.*)"/, function(done) {
  var self = this;
  this.output = '';
  this.parser = this.file.pipe($1)
    .on('data', function(c) { self.output += c })
    .on('close', done);

  this.file.resume();
});

Then(/I should see the content of "(.*)"/, function(done) {
  process.chdir(this.base);
  var output = this.output;
  fs.readFile('$1', 'utf8', function(err, body) {
    if(err) return done(err);
    assert.equal(body.trim(), output.trim());
    done();
  });
});
```

### Step snippets

When `--missing` option is set, the output won't return the usual generated
step but rather return you snippets for any step missing. It's handy to quicly
generate the matching step file for a given feature file. Example:

```sh
$ cat example.feature | mocha-gherkin --missing
```

Should output:

```js
Given(/I am in the test directory/, function() {
  // add code for your definition here, regexp captured paramaters can be used
  // in the function body with simple placeholders like $1, $2, ...
});

When(/I read the index.js file/, function() {
  // add code for your definition here, regexp captured paramaters can be used
  // in the function body with simple placeholders like $1, $2, ...
});

Then(/I should see 'new Parser' somewhere/, function() {
  // add code for your definition here, regexp captured paramaters can be used
  // in the function body with simple placeholders like $1, $2, ...
});
```

[Gherkin syntax]: https://github.com/cucumber/cucumber/wiki/Gherkin
[Mocha]: https://github.com/visionmedia/mocha
[vm]: http://nodejs.org/api/vm.html#vm_vm_runinnewcontext_code_sandbox_filename

