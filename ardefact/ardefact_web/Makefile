.PHONY: ALL clean build bower minify copyToTmpFolder jshint

currentDir := $(shell pwd)
staticRoot := $(currentDir)/ardefact-web
bowerDir := $(staticRoot)/bower_components


ALL: bower

clean:
	@$(PP) "Cleaning static content"
	rm -rf $(bowerDir)

build: bower minify

bower:
	@$(PP) "Running bower"
	cd $(staticRoot); $(ARDEFACT_EXEC_BOWER) install -p; cd bower_components/data.min; $(ARDEFACT_EXEC_NPM) install; make bundle; make minify;

minify: bower copyToTmpFolder
	@$(PP) "Minifying static content"
	$(ARDEFACT_EXEC_NODE) $(ARDEFACT_EXEC_PREPROCESS_STATIC) --static "$(ARDEFACT_WEB)/ardefact-web" --output "$(ARDEFACT_WEB_BUILD_DIR)" | $(ARDEFACT_EXEC_BUNYAN)

copyToTmpFolder:
	@$(PP) "Copying files to static root"
	mkdir -p $(ARDEFACT_WEB_BUILD_DIR)
	cp -R $(staticRoot) $(ARDEFACT_WEB_BUILD_DIR)


jshint:
	@$(PP) "Running JSHINT on static content"
	cd $(staticRoot); $(ARDEFACT_EXEC_JSHINT) .
