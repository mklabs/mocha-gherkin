
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

