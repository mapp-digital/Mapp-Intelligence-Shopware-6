USER_NAME := $(shell id -un)
USER_ID := $(shell id -u)
GROUP_ID := $(shell id -g)
USER_GROUP = $(USER_ID):$(GROUP_ID)
VERSION := $(shell jq -r .version composer.json)

export USER_ID
export GROUP_ID

start-e2e:
	cd ./E2E && docker compose up -d
build-e2e:
	cd ./E2E && docker compose build --no-cache
stop-e2e:
	cd ./E2E && docker compose down
daily:
	make start-e2e && make wait-shopware && make install && make activate && make seed && make cypress-run
# dockware prints "... IS READY" once Apache, MySQL and Shopware are up; bin/console does not exist before that
wait-shopware:
	@for i in $$(seq 1 150); do \
		if docker logs shopware.test 2>&1 | grep -q "IS READY"; then echo "Shopware is ready"; exit 0; fi; \
		sleep 2; \
	done; \
	echo "Shopware did not get ready within 5 minutes"; docker logs --tail 30 shopware.test; exit 1
delete-image:
	docker image rm dockware/shopware
delete-volumes:
	docker volume rm mapp_e2e_shopware_shopware_intelligence_db_volume && docker volume rm mapp_e2e_shopware_shopware_intelligence_shop_volume
install:
	docker exec -t shopware.test bash -c "./bin/console plugin:refresh && ./bin/console plugin:install MappIntelligence"
activate:
	docker exec -t shopware.test bash -c "./bin/console plugin:activate MappIntelligence"
prepare:
	make seed && docker exec -t mapp_e2e_shopware_cypress bash -c "cypress run --browser chrome --spec '/cypress/e2e/01_install-plugin.cy.js'"
ready:
	@if ping -c 1 shopware.test | grep "127.0.0.1" > /dev/null; then \
		echo "shopware.test resolves locally. Proceeding..."; \
		make install && make activate && make prepare; \
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

# test data (storefront URL, coupon, landing page, categories, products, customers), can run again on the same shop
seed:
	docker exec -t mapp_e2e_shopware_cypress node /cypress/seed/seed.js
cypress-run:
	docker exec -t mapp_e2e_shopware_cypress bash -c "cypress run --browser chrome --spec '/cypress/e2e/**/*.cy.js'"
cypress-local:
	cd ./E2E && if [ ! -d "./node_modules" ];then npm install;fi && docker compose up -d && npm run open

zip:
	mkdir MappIntelligence && cp -r ./src ./MappIntelligence/src && cp ./composer.json ./MappIntelligence/composer.json && cp CHANGELOG.md ./MappIntelligence/CHANGELOG.md && cp ./LICENSE ./MappIntelligence/LICENSE && zip -r MappIntelligence_for_Shopware6_$(VERSION).zip ./MappIntelligence && rm -rf ./MappIntelligence
