USER_NAME := $(shell id -un)
USER_ID := $(shell id -u)
GROUP_ID := $(shell id -g)
USER_GROUP = $(USER_ID):$(GROUP_ID)



export USER_ID
export GROUP_ID

start-e2e:
	cd ./E2E && docker-compose up
build-e2e:
	cd ./E2E && docker-compose build --no-cache
stop-e2e:
	cd ./E2E && docker-compose down

exec-cypress:
	docker exec -it  mapp_e2e_shopware_cypress bash
exec-shopware:
	docker exec -it shopware.test bash

cypress-run:
	docker exec -t mapp_e2e_shopware_cypress bash -c "cypress run"
cypress-local:
	cd ./E2E && if [ ! -d "./node_modules" ];then npm install;fi && docker-compose up -d && npm run test
