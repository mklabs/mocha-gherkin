
URL = https://raw.github.com/mojombo/jekyll/master/features
REPORTER = spec
TESTS = test/api.js test/request.js

all: template generate-features test docs readme

template:
	@echo "... Build the template ...\n"
	@cd template && node ../node_modules/hogan/bin/hulk body.mustache \
		| sed 's/{}/module.exports/' \
		| cat head.js - tail.js \
		> index.js

generate:
	@echo "... Build the test files, requesting some of jekyll features ...\n"

	node examples/stdout.js > test/stdout.js
	node examples/request.js $(URL)/permalinks.feature > examples/permalinks.js
	node examples/request.js $(URL)/create_sites.feature > examples/create_sites.js
	node examples/request.js $(URL)/markdown.feature > examples/markdown.js

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

readme:
	@echo "... Generating the readme ...\n"
	@make test REPORTER=markdown \
		| cat docs/readme.md - \
		> readme.md

doc:
	@echo "... Generating the readme ...\n"
	@node node_modules/.bin/marked --gfm docs/readme.md \
		| sed 's/#\s(.*)//'	\
		> docs/readme.html

	@make test REPORTER=doc >> docs/readme.html


docs: doc
	@echo "... Generating the docs, from readme ...\n"
	cat docs/readme.html \
		| cat docs/head.html - docs/tail.html \
		> docs/index.html

man: readme
	@echo "... Generating manpage, from readme ...\n"
	@cat readme.md | sed 's/&rarr;/->/' | cat man/head.md - \
		| node node_modules/.bin/ronn \
		> man/mocha-gherkin.1

.PHONY: template test generate docs readme

