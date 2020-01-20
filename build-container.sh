#!/bin/bash

# Check .envs
loc=$PWD/WebApp/

for envs in ".env" ".env.development" ".env.production"; do
  if ! test -f ${loc}${envs}; then echo "ERROR: Missing file ${loc}${envs}, cannot build the images."; exit; fi
done

#variables
VERSION=$(sed -n -e '/REACT_APP_VERSION/ s/.*\=v *//p' $PWD/WebApp/.env)
MANIFEST=""

# build images for all architectures
echo "######################## BUIDING VERSION ${VERSION} ########################"
mkdir -p build-container/build build-container/node_modules

docker run -it --rm --name tasui-builder -v "$PWD":/tasui -v "$PWD/build-container/node_modules":/tasui/WebApp/node_modules -v "$PWD/build-container/build":/tasui/WebApp/build -w /tasui/WebApp node:13.6 sh -c "npm install && npm run build"

declare -A dockarr=([amd64]=nginx:stable-alpine [arm32]=arm32v7/nginx:latest [arm64]=arm64v8/nginx:alpine [i386]=i386/nginx:alpine)
for d in "${!dockarr[@]}"
do
  TEMPNAME=" iotreboot/tasui-$d:${VERSION}"
  printf "%s\n \n%s\n" "FROM ${dockarr[$d]} " "COPY build-container/build /usr/share/nginx/html" > dockerfile
  docker build --squash -f dockerfile -t ${TEMPNAME} .
  MANIFEST="${MANIFEST}${TEMPNAME}"
done

# Home Assistant addon version
jq ".version = \"$VERSION\"" ~/TasUI/TasUI_HA_addon/config.json>config.json

echo "######################## BUILD PROCESS COMPLETED ########################"
echo "Do you wish to upload new TasUI images to Docker Hub?"
select yn in "Yes" "No"; do
    case $yn in
        Yes ) break;;
        No ) echo "Images ready to deploy."; exit;;
    esac
done

# push new images to Docker Hub
for arch in "amd64" "arm32" "arm64" "i386"; do docker push iotreboot/tasui-$arch:${VERSION}; done

# Create manifest for multiarch image
docker manifest create -a iotreboot/tasui:latest${MANIFEST}
docker manifest push --purge iotreboot/tasui:latest
echo "######################## PUSH PROCESS COMPLETED ########################"

# cleaning
echo "Do you wish to purge TasUI images locally?"
select yn in "Yes" "No"; do
    case $yn in
        Yes ) 
          for i in ${MANIFEST}; do 
            docker rmi $i
	  done; break;;
        No ) break;;
    esac
done

echo "Do you wish to purge unused FROM images locally?"
select yn in "Yes" "No"; do
    case $yn in
        Yes ) 
          for d in "${!dockarr[@]}"; do 
            docker rmi ${dockarr[$d]}; 
          done; break;;
        No ) break;;
    esac
done
rm -rf dockerfile config.json
echo "######################## SCRIPT COMPLETE ########################"
