.PHONY: clean
currentDir := $(shell pwd)

.PHONY: ALL build install clean jshint

build: install

install:
	@$(PP) "Installing server"
	cd $(currentDir)/ardefact-api; $(ARDEFACT_EXEC_NPM) install

clean:
	@$(PP) "Cleaning server"
	rm -rf $(currentDir)/ardefact-api/node_modules

jshint:
	@$(PP) "Running JSHINT on the server"
	cd ardefact-api; $(ARDEFACT_EXEC_JSHINT) .
