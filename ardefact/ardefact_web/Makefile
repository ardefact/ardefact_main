.PHONY: ALL clean build bower copyToTmpFolder jshint

currentDir := $(shell pwd)
staticRoot := $(currentDir)/ardefact-web
bowerDir := $(staticRoot)/bower_components


ALL: bower

clean:
	@$(PP) "Cleaning static content"
	rm -rf $(bowerDir)

build: bower

bower:
	@$(PP) "Running bower"
	cd $(staticRoot); $(ARDEFACT_EXEC_BOWER) install -p; cd bower_components/data.min; $(ARDEFACT_EXEC_NPM) install; make bundle; make minify;

jshint:
	@$(PP) "Running JSHINT on static content"
	cd $(staticRoot); $(ARDEFACT_EXEC_JSHINT) .
