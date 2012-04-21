
URL = https://raw.github.com/mojombo/jekyll/master/features
REPORTER = spec
TESTS = test/api.js

all: template generate-features test

template:
	@echo "... Build the template ...\n"
	@node node_modules/hogan/bin/hulk body.mustache \
		| sed 's/{}/module.exports/' \
		| cat template/head.js - template/tail.js \
		> template/index.js

generate:
	@echo "... Build the test files, requesting some of jekyll features ...\n"

	node examples/stdout.js > test/stdout.js
	node examples/request.js $(URL)/permalinks.feature > test/permalinks.js
	node examples/request.js $(URL)/create_sites.feature > test/create_sites.js
	node examples/request.js $(URL)/markdown.feature > test/markdown.js

generate-features:
	@echo "... Build the tests from test/features/*.feature ...\n"
	cat test/features/api.feature \
		| node examples/stdin ../test/steps/api.js \
		> test/api.js

test:
	@# --ignore-leaks cause there's a tiny leak for variable "e" in
	@# gherkin/lib/lexer/en.js:610
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--ignore-leaks \
		$(TESTS)

docs-head:
	cat docs/theme/index.html | head -26 \
		| sed 's/orderedlist\/minimal/mklabs\/mocha-gherkin/g' \
		| perl -pe 's/<title>(.+)<\/title>/<title>Gherkin syntax &rarr; Mocha BDD specs<\/title>/g' \
		| perl -pe 's/<h1>(.+)<\/h1>/<h1>Gherkin syntax &rarr; Mocha BDD specs<\/h1>/g' \
		| perl -pe 's/<p>(.+)<\/p>/<p>Pipe a feature, get a mocha...<\/p>/' \
		> docs/head.html

docs-tail:
	cat docs/theme/index.html | tail -8 \
		| sed '2s/orderedlist/mklabs/' \
		| sed 's/Steve Smith/mklabs/' \
		> docs/tail.html

docs: docs-head docs-tail
	make test REPORTER=doc \
		| cat docs/head.html - docs/tail.html \
		| sed 's/stylesheets/theme\/stylesheets/' \
		> docs/index.html

readme:
	make test REPORTER=markdown \
		| cat docs/readme.md - \
		> readme.md

man: readme
	cat readme.md | node node_modules/.bin/ronn > man/mocha-gherkin.1

.PHONY: template test generate

