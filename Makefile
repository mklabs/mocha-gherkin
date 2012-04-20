.PHONY: template test

url = https://raw.github.com/mojombo/jekyll/master/features

all: template generate test

template:
	@echo "... Build the template ...\n"
	@node node_modules/hogan/bin/hulk body.mustache \
		| sed 's/{}/module.exports/' \
		| cat template/head.js - template/tail.js \
		> template/index.js

generate:
	@echo "... Build the test files, requesting some of jekyll features ...\n"

	node examples/stdout.js >> test/stdout.js
	node examples/request.js $(url)/permalinks.feature >> test/permalinks.js
	node examples/request.js $(url)/create_sites.feature >> test/create_sites.js
	node examples/request.js $(url)/markdown.feature >> test/markdown.js

test:
	@echo "... Build the test files, requesting some of jekyll features ...\n"
	node node_modules/.bin/mocha

