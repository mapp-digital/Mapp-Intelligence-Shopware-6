#!/bin/bash

# add -v 6.2 or -v 6.3 to test a specific version, otherwise the script will checkout the latest version of the dev repo
# add -j to activate Jenkins mode - 2 port bindings (8080 and 8005) will be deleted from docker-compose.yml
# add -k if you don't want to delete the instance afterwards

argversion="latest"
jenkins=0
keep=0

while getopts ":v:j:k" opt; do
  case $opt in
    v)
      echo "Version set to: $OPTARG" >&2
	  argversion="$OPTARG"
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
    :)
      echo "Option -$OPTARG requires an argument." >&2
      exit 1
      ;;
    j)
	  echo "Jenkins mode activated"
	  jenkins=1
	  ;;
	k)
	  echo "Keep-mode: instance will not be deleted"
	  keep=1
	  ;;
  esac
done

if [ "$keep" -eq "0" ]; then
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

# if -v option was set, value is used here
if [ "$argversion" == "latest" ]
    then
        echo "@@@Version: latest"
    else
        cd ./shopware-test
        pattern=v$argversion.*
        version=$(git describe --tags $(git rev-list --tags=$pattern --max-count=1))
        echo "@@@Version: $version"
        git checkout tags/$version && cd ..
fi

#Jenkins mode logic
if [ "$jenkins" -eq "1" ]; then
    echo "looking for docker-compose.override.yml file..."
    if [[ -f "./shopware-test/dev-ops/docker/docker-compose.override.yml" ]]
    then
        echo "File found - editing docker-compose.xml file now..."
        sed '/__DEVPORT__:__DEVPORT__/d' ./shopware-test/dev-ops/docker/docker-compose.override.yml > ./changed.yml
        sed '/8005:8005/d' ./changed.yml > ./shopware-test/dev-ops/docker/docker-compose.override.yml
        rm ./changed.yml
        echo "File changed!"
    else
        echo "dev-ops/docker/docker-compose.override.yml file not found"
        exit 1
    fi
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

if [ "$keep" -eq "0" ]; then
    echo "Clear composer cache inside app container..."
    docker exec "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "rm -R -f /.composer/cache/files"
fi

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
cp -r ./custom/plugins/MappIntelligence/src/Resources/app/storefront/test/app/build/artifacts/e2e/*.xml ./../test-results/
if [[ -d "./custom/plugins/MappIntelligence/src/Resources/app/storefront/test/app/build/artifacts/e2e/screenshots" ]]
    then
        cp -r ./custom/plugins/MappIntelligence/src/Resources/app/storefront/test/app/build/artifacts/e2e/screenshots ./../test-results/
fi

if [ "$keep" -eq "0" ]; then
    echo "Delete Mysql volumes from within docker..."
    docker exec "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "rm -R -f ./dev-ops/docker/_volumes"
fi


echo "Stop docker container"
./psh.phar docker:stop

if [ "$keep" -eq "0" ]; then
    echo "Delete test folder"
    cd .. && rm -R -f ./shopware-test
fi

