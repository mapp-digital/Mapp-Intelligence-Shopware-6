#!/bin/bash

# add -v 6.2 or -v 6.3 to test a specific version, otherwise the script will checkout the latest version of the dev repo
# add -j to activate Jenkins mode - 2 port bindings (8080 and 8005) will be deleted from docker-compose.yml
# add -k if you don't want to delete the instance afterwards

argversion="latest"
jenkins=0
keep=0

USER_ID=$(id -u)
GROUP_ID=$(id -g)
USER_GROUP_ID="${USER_ID}:${GROUP_ID}"

log_on_cmd()
{
  printf "#########################################\n"
  echo "### $1"
  printf "#########################################\n"
}

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
	  log_on_cmd "Jenkins mode activated"
	  jenkins=1
	  ;;
	k)
	  log_on_cmd "Keep-mode: instance will not be deleted"
	  keep=1
	  ;;
  esac
done

if [ "$keep" -eq "0" ]; then
    log_on_cmd "Checking if Shopware6 testfolder exists..."
    if [[ -d "./shopware-test" ]]
        then
            log_on_cmd "It does, now deleting..."
            cd ./shopware-test/ && ./psh.phar docker:start
            docker exec "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "rm -R -f ./dev-ops/docker/_volumes"
            ./psh.phar docker:stop
            cd .. && chown -R 1000 ./shopware-test/ && rm -R -f ./shopware-test/
            if [[ -d "./shopware-test" ]]
                then
                    log_on_cmd "Could not remove test directory"
                    exit 1
            fi
        else
            log_on_cmd "Folder not found!"
    fi
fi

log_on_cmd "Checking if test-results exists..."
if [[ -d "./test-results" ]]
    then
        log_on_cmd "It does!"
    else
        log_on_cmd "It does not, now creating..."
        mkdir ./test-results
fi

log_on_cmd "Cloning latest Shopware6 repo..."
git clone https://github.com/shopware/development.git shopware-test

# if -v option was set, value is used here
if [ "$argversion" == "latest" ]
    then
        log_on_cmd "@@@Version: latest"
    else
        cd ./shopware-test || exit 1
        pattern="v$argversion.*"
        version=$(git describe --tags $(git rev-list --tags="${pattern}" --max-count=1))
        log_on_cmd "@@@Version: $version"
        git checkout tags/"${version}" && cd ..
fi

#Jenkins mode logic
if [ "$jenkins" -eq "1" ]; then
    log_on_cmd "looking for docker-compose.override.yml file..."
    if [[ -f "./shopware-test/dev-ops/docker/docker-compose.override.yml" ]]
    then
        log_on_cmd "File found - editing docker-compose.xml file now..."
        sed '/__DEVPORT__:__DEVPORT__/d' ./shopware-test/dev-ops/docker/docker-compose.override.yml > ./changed.yml
        sed '/8005:8005/d' ./changed.yml > ./shopware-test/dev-ops/docker/docker-compose.override.yml
        rm ./changed.yml
        log_on_cmd "File changed!"
    else
        log_on_cmd "dev-ops/docker/docker-compose.override.yml file not found"
        exit 1
    fi
fi

log_on_cmd "Copy plugin into Shopware..."
mkdir ./shopware-test/custom/plugins/MappIntelligence
cp ./composer.json ./shopware-test/custom/plugins/MappIntelligence
cp ./CHANGELOG.md ./shopware-test/custom/plugins/MappIntelligence
cp -r ./src ./shopware-test/custom/plugins/MappIntelligence

log_on_cmd "Copy test-data plugin into Shopware"
cp -r ./helper/test-data-plugin/SwagPlatformDemoData ./shopware-test/custom/plugins/

log_on_cmd "Installing Shopware6 Docker container..."
cd shopware-test && ./psh.phar docker:start

if [ "$keep" -eq "0" ]; then
    log_on_cmd "Clear composer cache inside app container..."
    docker exec "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "rm -R -f /.composer/cache/files"
fi

log_on_cmd "Installing Shopware6 inside Docker container..."
docker exec -u "${USER_GROUP_ID}" "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "./psh.phar install"

log_on_cmd "Install Cypress dependency 'xvfb' in Shopware6 app docker container..."
docker exec "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "apt-get update -y"
docker exec "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "apt-get install -y xvfb"

log_on_cmd "npm install Cypress in Shopware6 docker container"
docker exec -u "${USER_GROUP_ID}" "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "cd /app/custom/plugins/MappIntelligence/src/Resources/app/storefront/test/e2e/ && npm i"

log_on_cmd  "Install cypress"
docker exec -u "${USER_GROUP_ID}" "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "cd /app/custom/plugins/MappIntelligence/src/Resources/app/storefront/test/e2e/ && node_modules/.bin/cypress install"

log_on_cmd "Give public.pem and private.pem to application"
docker exec "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "cd /app/config/jwt/ && chown application public.pem && chown application private.pem"

log_on_cmd "Install and activate MappIntelligence Plugin via console"
docker exec -u "${USER_GROUP_ID}" "$(docker ps -aqf 'name=shopware-test_app_server_1')" bash -c "./bin/console plugin:install MappIntelligence"
docker exec -u "${USER_GROUP_ID}" "$(docker ps -aqf 'name=shopware-test_app_server_1')" bash -c "./bin/console plugin:activate MappIntelligence"

log_on_cmd "Install and activate demo data Plugin via console"
docker exec -u "${USER_GROUP_ID}" "$(docker ps -aqf 'name=shopware-test_app_server_1')" bash -c "./bin/console plugin:install SwagPlatformDemoData"
docker exec -u "${USER_GROUP_ID}" "$(docker ps -aqf 'name=shopware-test_app_server_1')" bash -c "./bin/console plugin:activate SwagPlatformDemoData"

log_on_cmd "Run the e2e tests"
docker exec -u "${USER_GROUP_ID}" "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "cd /app/custom/plugins/MappIntelligence/src/Resources/app/storefront/test/e2e/ && node_modules/.bin/cypress run"

log_on_cmd "Copy test results..."
cp -r ./custom/plugins/MappIntelligence/src/Resources/app/storefront/test/app/build/artifacts/e2e/*.xml ./../test-results/
if [[ -d "./custom/plugins/MappIntelligence/src/Resources/app/storefront/test/app/build/artifacts/e2e/screenshots" ]]
    then
        cp -r ./custom/plugins/MappIntelligence/src/Resources/app/storefront/test/app/build/artifacts/e2e/screenshots ./../test-results/
fi

if [ "$keep" -eq "0" ]; then
    log_on_cmd "Delete Mysql volumes from within docker..."
    docker exec "$(docker ps -aqf 'name=shopware-test_app_server_1')" /bin/bash -c "rm -R -f ./dev-ops/docker/_volumes"
fi


log_on_cmd "Stop docker container"
./psh.phar docker:stop

if [ "$keep" -eq "0" ]; then
    log_on_cmd "Delete test folder"
    cd .. && rm -R -f ./shopware-test
fi

