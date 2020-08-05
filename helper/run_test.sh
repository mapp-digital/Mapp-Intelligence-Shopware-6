#!/bin/bash

echo "Checking if Shopware6 testfolder exists..."
if [[ -d "./shopware-test" ]]
    then
        echo "It does, now deleting..."
        cd ./shopware-test/ && ./psh.phar docker:start
        docker exec "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "rm -R -f ./dev-ops/docker/_volumes"
        ./psh.phar docker:stop
        cd .. && chown -R 1000 ./shopware-test/ && rm -R -f ./shopware-test/
        if [[ -d "./shopware-test" ]]
            then
                echo "Could not remove test directory"
                exit 1
        fi
    else
        echo "Folder not found!"
fi

echo "Checking if test-results exists..."
if [[ -d "./test-results" ]]
    then
        echo "It does!"
    else
        echo "It does not, now creating..."
        mkdir ./test-results
fi

echo "Cloning latest Shopware6 repo..."
git clone https://github.com/shopware/development.git shopware-test

# 1st argument supposed to be repo tag till 2nd number, like 6.2, 6.3 etc.
if [ -z "$1" ]
    then
        echo "@@@Version: latest"
    else
        cd ./shopware-test
        pattern=v$1.*
        version=$(git describe --tags $(git rev-list --tags=$pattern --max-count=1))
        echo "@@@Version: $version"
        git checkout tags/$version && cd ..
fi


echo "Copy plugin into Shopware..."
mkdir ./shopware-test/custom/plugins/MappIntelligence
cp ./composer.json ./shopware-test/custom/plugins/MappIntelligence
cp ./CHANGELOG.md ./shopware-test/custom/plugins/MappIntelligence
cp -r ./src ./shopware-test/custom/plugins/MappIntelligence

echo "Copy test-data plugin into Shopware"
cp -r ./helper/test-data-plugin/SwagPlatformDemoData ./shopware-test/custom/plugins/

echo "Installing Shopware6 Docker container..."
cd shopware-test && ./psh.phar docker:start

echo "Installing Shopware6 inside Docker container..."
docker exec -u 1000:1000 "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "./psh.phar install"

echo "Install Cypress dependency 'xvfb' in Shopware6 app docker container..."
docker exec "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "apt-get update -y"
docker exec "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "apt-get install -y xvfb"

echo "npm install Cypress in Shopware6 docker container"
docker exec -u 1000:1000 "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "cd /app/custom/plugins/MappIntelligence/src/Resources/app/storefront/test/e2e/ && npm i"

echo  "Install cypress"
docker exec -u 1000:1000 "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "cd /app/custom/plugins/MappIntelligence/src/Resources/app/storefront/test/e2e/ && node_modules/.bin/cypress install"

echo "Give public.pem and private.pem to application"
docker exec "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "cd /app/config/jwt/ && chown application public.pem && chown application private.pem"

echo "Install and activate MappIntelligence Plugin via console"
docker exec -u 1000:1000 "$(docker ps -aqf 'name=shopware-test_app_server_1')" bash -c "./bin/console plugin:install MappIntelligence"
docker exec -u 1000:1000 "$(docker ps -aqf 'name=shopware-test_app_server_1')" bash -c "./bin/console plugin:activate MappIntelligence"

echo "Install and activate demo data Plugin via console"
docker exec -u 1000:1000 "$(docker ps -aqf 'name=shopware-test_app_server_1')" bash -c "./bin/console plugin:install SwagPlatformDemoData"
docker exec -u 1000:1000 "$(docker ps -aqf 'name=shopware-test_app_server_1')" bash -c "./bin/console plugin:activate SwagPlatformDemoData"

echo "Run the e2e tests"
docker exec -u 1000:1000 "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "cd /app/custom/plugins/MappIntelligence/src/Resources/app/storefront/test/e2e/ && node_modules/.bin/cypress run"

echo "Copy test results..."
cp -r ./*.xml ./../test-results/
if [[ -d "./screenshots" ]]
    then
        cp -r ./screenshots ./../test-results/
fi

echo "Delete Mysql volumes from within docker..."
docker exec "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "rm -R -f ./dev-ops/docker/_volumes"

echo "Stop docker container"
./psh.phar docker:stop

echo "Delete test folder"
cd .. && rm -R -f ./shopware-test

