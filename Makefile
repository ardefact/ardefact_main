#--- Common Vars ---
CURRENT_DIR := $(shell pwd)
ARDEFACT_WEB := $(CURRENT_DIR)/ardefact_web
ARDEFACT_API := $(CURRENT_DIR)/ardefact_api
#--- Exec tools Vars ---
A_EXEC_NPM_DEFAULT := $(shell which npm)
A_EXEC_JSHINT_DEFAULT := $(shell which jshint)

PP = $(CURRENT_DIR)/makefileEcho.sh

GLOBAL_EXPORT = export PP=$(PP); export A_EXEC_NPM=$(A_EXEC_NPM_DEFAULT); export A_EXEC_JSHINT=$(A_EXEC_JSHINT_DEFAULT)

SUBDIRS := $(ARDEFACT_WEB)


.PHONY: subdirs $(SUBDIRS)

subdirs: $(SUBDIRS)

$(SUBDIRS):
	@echo $(SUBDIRS)
	$(MAKE) -C $@

build: install

install:
	@$(PP) "Making ardefact....  May God help us."
	$(GLOBAL_EXPORT); cd $(ARDEFACT_API); make install
	$(GLOBAL_EXPORT); export "A_EXEC_BOWER=$(ARDEFACT_API)/ardefact-api/node_modules/bower/bin/bower"; cd $(ARDEFACT_WEB); make bower

clean:
	@$(PP) "Cleaning everything.."
	@$(GLOBAL_EXPORT); cd $(ARDEFACT_WEB); make clean
	@$(GLOBAL_EXPORT); cd $(ARDEFACT_API); make clean

deploy_dev: build
	@$(PP) "Deploying debug version of server"
	cd $(ARDEFACT_API)/ardefact-api; ./start_debug.sh ${ARGS} | bunyan
deploy_prod: build
	@$(PP) "Deploying production version of server"
	cd $(ARDEFACT_API)/ardefact-api; ./start_prod.sh ${ARGS}

jshint:
	@$(PP) "Running JSHINT on everything!"
	$(GLOBAL_EXPORT); cd $(ARDEFACT_API); make jshint;
	$(GLOBAL_EXPORT); cd $(ARDEFACT_WEB); make jshint;

