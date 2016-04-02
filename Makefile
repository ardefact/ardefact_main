.PHONY: install update rebuild build clean deploy_dev deploy_prod test jshint

install: update build

reinstall: clean update build

update:
	@$(PP) "Retrieving/updating required git repos"
	git pull --rebase

rebuild: clean build

build:
	@$(PP) "Making ardefact....  May God help us."
	@cd $(ARDEFACT_API); make build
	@cd $(ARDEFACT_WEB); make build

clean:
	@$(PP) "Cleaning everything.."
	rm -rf $(BUILD_DIR)
	rm -rf ./tmp
	cd $(ARDEFACT_WEB); make clean
	cd $(ARDEFACT_API); make clean

nuke: clean
	rm -rf ./.am
	rm -rf node_modules

deploy_dev: build
	@$(PP) "Deploying debug version of server"
	cd $(ARDEFACT_API)/ardefact-api; ./start_debug.sh  --static $(ARDEFACT_WEB_BUILD_DIR) $(ARDEFACT_CLI_ARGS) | $(ARDEFACT_EXEC_BUNYAN)

deploy_prod: build
	@$(PP) "Deploying production version of server"
	cd $(ARDEFACT_API)/ardefact-api; ./start_prod.sh ${ARGS}

test: jshint
jshint:
	@$(PP) "Running JSHINT on everything!"
	$(ARDEFACT_EXEC_JSHINT) .
	cd $(ARDEFACT_API); make jshint;
	cd $(ARDEFACT_WEB); make jshint;

nothing:
	@$(PP) "Just chilling"

