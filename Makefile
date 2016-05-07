.PHONY: install update rebuild build clean deploy_dev deploy_prod test jshint

install: update build

reinstall: clean update build

update:
	@$(PP) "Retrieving/updating required git repos"
	git pull --rebase

rebuild: clean build

install_mongodb:
	sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
	echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
	sudo apt-get update
	sudo apt-get install -y mongodb-org
	sudo apt-get install -y mongodb-org=3.2.6 mongodb-org-server=3.2.6 mongodb-org-shell=3.2.6 mongodb-org-mongos=3.2.6 mongodb-org-tools=3.2.6
	echo "mongodb-org hold" | sudo dpkg --set-selections
	echo "mongodb-org-server hold" | sudo dpkg --set-selections
	echo "mongodb-org-shell hold" | sudo dpkg --set-selections
	echo "mongodb-org-mongos hold" | sudo dpkg --set-selections
	echo "mongodb-org-tools hold" | sudo dpkg --set-selections

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
	cd $(ARDEFACT_API)/ardefact-api; ./start_debug.sh  "--static=$(ARDEFACT_WEB)/ardefact-web" "--webroot=$(ARDEFACT_WEB_URL_ROOT)" "--tmpdir=$(BUILD_DIR)" "$(ARDEFACT_CLI_ARGS)" | $(ARDEFACT_EXEC_BUNYAN)

deploy_prod: build
	@$(PP) "Deploying production version of server"
	cd $(ARDEFACT_API)/ardefact-api; ./start_prod.sh "--static=$(ARDEFACT_WEB)/ardefact-web" "--webroot=$(ARDEFACT_WEB_URL_ROOT)" "--tmpdir=$(BUILD_DIR)" "$(ARDEFACT_CLI_ARGS)"

test: jshint
jshint:
	@$(PP) "Running JSHINT on everything!"
	$(ARDEFACT_EXEC_JSHINT) .
	cd $(ARDEFACT_API); make jshint;
	cd $(ARDEFACT_WEB); make jshint;

count_lines:
	@$(PP) "Counting number of lines in JS sources"
	find . | grep -v node_module | grep -v bower_component | grep -v .git | grep -v build | grep -v "r.js" | grep js | xargs cat | wc -l
	@$(PP) "Counting number of lines in HTML and CSS sources"
	find . | grep -v node_module | grep -v bower_component | grep -v .git | grep -v build | grep -v "r.js" | grep "html\\|css" | xargs cat | wc -l

