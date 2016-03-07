#--- Common Vars ---
CURRENT_DIR := $(shell pwd)
ARDEFACT_WEB := $(CURRENT_DIR)/ardefact_web
ARDEFACT_API := $(CURRENT_DIR)/ardefact_api

STATIC_ROOT=$(ARDEFACT_WEB)/ardefact-web
BUILD_DIR=$(CURRENT_DIR)/build

#--- Exec tools Vars ---
A_EXEC_NPM := $(shell which npm)
A_EXEC_JSHINT := $(shell which jshint)
A_EXEC_NODE := $(shell which node)
A_EXEC_BUNYAN := $(shell which bunyan)

#--- helper scripts ---
PP = $(CURRENT_DIR)/makefileEcho.sh

GLOBAL_EXPORT = export PP=$(CURRENT_DIR)/makefileEcho.sh;\
	export A_STATIC_ROOT=$(STATIC_ROOT);\
	export A_EXEC_BUNYAN=$(A_EXEC_BUNYAN);\
	export A_STATIC_BUILD_CONTENT_ROOT=$(BUILD_DIR)/static;\
	export A_EXEC_PREPROCESS_STATIC=$(ARDEFACT_API)/ardefact-api/preProcessStaticContent.js;\
	export A_EXEC_NPM=$(A_EXEC_NPM);\
	export A_EXEC_NODE=$(A_EXEC_NODE);\
	export A_EXEC_JSHINT=$(A_EXEC_JSHINT);\
	export A_EXEC_BOWER=$(ARDEFACT_API)/ardefact-api/node_modules/bower/bin/bower

#--- targets ---

.PHONY: install

install: update build

update:
	@$(PP) "Retrieving/updating required git repos"
	./install.sh

rebuild: clean build

build:
	@$(PP) "Making ardefact....  May God help us."
	$(GLOBAL_EXPORT); cd $(ARDEFACT_API); make build
	$(GLOBAL_EXPORT); cd $(ARDEFACT_WEB); make build

clean:
	@$(PP) "Cleaning everything.."
	rm -rf $(BUILD_DIR)
	rm -rf ./tmp
	@$(GLOBAL_EXPORT); cd $(ARDEFACT_WEB); make clean
	@$(GLOBAL_EXPORT); cd $(ARDEFACT_API); make clean

deploy_dev: build jshint
	@$(PP) "Deploying debug version of server"
	$(GLOBAL_EXPORT); cd $(ARDEFACT_API)/ardefact-api; ./start_debug.sh ${ARGS} | $(A_EXEC_BUNYAN)
deploy_prod: build jshint
	@$(PP) "Deploying production version of server"
	$(GLOBAL_EXPORT); cd $(ARDEFACT_API)/ardefact-api; ./start_prod.sh ${ARGS}

test: jshint
jshint:
	@$(PP) "Running JSHINT on everything!"
	$(GLOBAL_EXPORT); cd $(ARDEFACT_API); make jshint;
	$(GLOBAL_EXPORT); cd $(ARDEFACT_WEB); make jshint;

