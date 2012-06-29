PLOVR_JAR=plovr-4b3caf2b7d84.jar
CLOSURE_LINTER=closure-linter
TARGETS=webglmaps.js

.PHONY: all
all: webglmaps.js lint

.PHONY: serve
serve: $(PLOVR_JAR)
	java -jar $(PLOVR_JAR) serve webglmaps.json

webglmaps.js: \
	$(shell find src -name \*.js) \
	externs/webgl_extra.js \
	$(PLOVR_JAR)
	java -jar $(PLOVR_JAR) build webglmaps.json > $@

.PHONY: lint
lint: $(CLOSURE_LINTER)
	$(CLOSURE_LINTER)/closure_linter/gjslint.py --strict $(shell find externs src -name \*.js)

.PHONY: clean
clean:
	rm -f $(TARGETS)

.PHONY: update
update: update-closure-compiler update-closure-library update-closure-linter

.PHONY: update-closure-compiler
update-closure-compiler:
	wget -O - http://closure-compiler.googlecode.com/files/compiler-latest.tar.gz | tar -Oxzf - compiler.jar > $(COMPILER_JAR)

.PHONY: update-closure-linter
update-closure-linter: $(CLOSURE_LINTER)
	( cd $(CLOSURE_LINTER) && svn update )

$(CLOSURE_LINTER):
	if [ -e ../closure-linter ]; then ln -s ../closure-linter $@ ; else svn checkout http://closure-linter.googlecode.com/svn/trunk/ $@ ; fi

$(PLOVR_JAR):
	curl http://plovr.googlecode.com/files/$(PLOVR_JAR) > $@
