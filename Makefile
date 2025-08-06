USER_NAME := $(shell id -un)
USER_ID := $(shell id -u)
GROUP_ID := $(shell id -g)
USER_GROUP = $(USER_ID):$(GROUP_ID)

export USER_ID
export GROUP_ID

start-e2e:
	cd ./E2E && docker-compose up -d
build-e2e:
	cd ./E2E && docker-compose build --no-cache
stop-e2e:
	cd ./E2E && docker-compose down
daily:
	make start-e2e && make cypress-install && make install && make activate && make cypress-run
delete-image:
	docker image rm dockware/play
delete-volumes:
	docker volume rm e2e_shopware_intelligence_db_volume && docker volume rm e2e_shopware_intelligence_shop_volume
install:
	docker exec -t shopware.test bash -c "./bin/console plugin:refresh && ./bin/console plugin:install MappIntelligence"
activate:
	docker exec -t shopware.test bash -c "./bin/console plugin:activate MappIntelligence"
prepare:
	docker exec -t mapp_e2e_shopware_cypress bash -c "cypress run --spec '/cypress/e2e/00_preparations.cy.js,/cypress/e2e/01_install-plugin.cy.js'"
ready:
	@if ping -c 1 shopware.test | grep "127.0.0.1" > /dev/null; then \
		echo "shopware.test resolves locally. Proceeding..."; \
		make install && make activate && make cypress-install && make prepare; \
	else \
		echo "Warning: shopware.test does not resolve to 127.0.0.1. Please check your /etc/hosts configuration."; \
	fi
get-version:
	@docker exec -t shopware.test php -r "require './vendor/composer/InstalledVersions.php';echo(Composer\InstalledVersions::getVersion('shopware/core'));"

exec-cypress:
	docker exec -it mapp_e2e_shopware_cypress bash
exec-shopware:
	docker exec -it shopware.test bash

build-js:
	docker exec -t shopware.test bash -c "./bin/build-storefront.sh"

cypress-install:
	docker exec -t mapp_e2e_shopware_cypress bash -c "cd /cypress && npm i"
cypress-run:
	docker exec -t mapp_e2e_shopware_cypress bash -c "cypress run"
cypress-run-no-prepare:
	docker exec -t mapp_e2e_shopware_cypress bash -c "cypress run --spec '/cypress/e2e/**/*.cy.js,!cypress/e2e/00_preparations.cy.js'"
cypress-local:
	cd ./E2E && if [ ! -d "./node_modules" ];then npm install;fi && docker-compose up -d && npm run open

zip:
	mkdir MappIntelligence && cp -r ./src ./MappIntelligence/src && cp ./composer.json ./MappIntelligence/composer.json && cp CHANGELOG.md ./MappIntelligence/CHANGELOG.md && cp ./LICENSE ./MappIntelligence/LICENSE && zip -r MappShopware.zip ./MappIntelligence && rm -rf ./MappIntelligence
