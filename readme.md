
# mocha-gherkin

**Pipe a feature... Get a mocha**

---

*Gherkin syntax &rarr; Mocha BDD specs*

## Streaming

The parser is a readable / writable stream, so you can any stream
connected to a valid feature to a `new Parser`, and pipe it to a given
destination.

```js
var Parser = require('mocha-gherkin');
fs.createReadStream('local.feature').pipe(new Parser).pipe(process.stdout);
r``

## Api

# TOC
   - [API](#api)
     - [As a user of mocha-gherkin I want to be able to use a streaming api So that I can pipe anything to it and pipe the result to any destination](#api-as-a-user-of-mocha-gherkin-i-want-to-be-able-to-use-a-streaming-api-so-that-i-can-pipe-anything-to-it-and-pipe-the-result-to-any-destination)
       - [Reading a file](#api-as-a-user-of-mocha-gherkin-i-want-to-be-able-to-use-a-streaming-api-so-that-i-can-pipe-anything-to-it-and-pipe-the-result-to-any-destination-reading-a-file)
       - [Requesting a file](#api-as-a-user-of-mocha-gherkin-i-want-to-be-able-to-use-a-streaming-api-so-that-i-can-pipe-anything-to-it-and-pipe-the-result-to-any-destination-requesting-a-file)
<a name="" />
 
<a name="api" />
# API
<a name="api-as-a-user-of-mocha-gherkin-i-want-to-be-able-to-use-a-streaming-api-so-that-i-can-pipe-anything-to-it-and-pipe-the-result-to-any-destination" />
## As a user of mocha-gherkin I want to be able to use a streaming api So that I can pipe anything to it and pipe the result to any destination
<a name="api-as-a-user-of-mocha-gherkin-i-want-to-be-able-to-use-a-streaming-api-so-that-i-can-pipe-anything-to-it-and-pipe-the-result-to-any-destination-reading-a-file" />
### Reading a file
Given I am in the 'examples' directory.

```js
this.base = process.cwd();
process.chdir(path.resolve('examples'));
done();
```

When I read the 'basics.feature' file.

```js
this.file = fs.createReadStream('basics.feature');
this.file.pause();
done();
```

And I pipe it through a 'new Parser'.

```js
var self = this;
this.output = '';
this.parser = this.file.pipe(new Parser)
  .on('data', function(c) { self.output += c })
  .on('close', done);

this.file.resume();
```

<a name="api-as-a-user-of-mocha-gherkin-i-want-to-be-able-to-use-a-streaming-api-so-that-i-can-pipe-anything-to-it-and-pipe-the-result-to-any-destination-requesting-a-file" />
### Requesting a file
Given I fetch some remote feature using request.

```js
```

When I request 'https://raw.github.com/mojombo/jekyll/master/features/markdown.feature'.

```js
this.file = request('https://raw.github.com/mojombo/jekyll/master/features/markdown.feature');
done();
```

And I pipe it through a 'new Parser'.

```js
var self = this;
this.output = '';
this.parser = this.file.pipe(new Parser)
  .on('data', function(c) { self.output += c })
  .on('close', done);

this.file.resume();
```

Then I should see the content of 'test/fixtures/remote.js'.

```js
process.chdir(this.base);
var output = this.output;
fs.readFile('test/fixtures/remote.js', 'utf8', function(err, body) {
  if(err) return done(err);
  assert.equal(body.trim(), output.trim());
  done();
});
```

