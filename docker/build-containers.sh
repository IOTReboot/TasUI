#!/bin/bash

#variables
VERSION=0.0.1
MANIFEST=""
cd ..

# Check .envs
loc=WebApp/

for envs in ".env" ".env.development" ".env.production"; do
  if test -f ${loc}${envs}; then
    echo "File ${envs} is present in ${loc}."
  else
    echo "Missing file ${loc}${envs}. Can't build the images."; exit
  fi
done

# QEMU static for muitliarch
for arch in "arm" "aarch64" "i386"; do
  wget https://github.com/multiarch/qemu-user-static/releases/download/v4.0.0-2/qemu-${arch}-static -O qemu-${arch}-static
done
chmod +x qemu-*-static

# build images for all architectures
mkdir -p build-container/build
mkdir -p build-container/node_modules

docker run -it --rm --name tasui-builder -v "$PWD":/tasui -v "$PWD/build-container/node_modules":/tasui/WebApp/node_modules -v "$PWD/build-container/build":/tasui/WebApp/build -w /tasui/WebApp node:13.6 sh -c "npm install && npm run build"

docker build -f docker/Dockerfile_arm32 -t iotreboot/tasui-arm32:${VERSION} .
for arch in "amd64" "arm32" "arm64" "i386"; do
  TEMPNAME=" iotreboot/tasui-$arch:${VERSION}"
  docker build -f docker/Dockerfile_$arch -t ${TEMPNAME} .
  MANIFEST="${MANIFEST}${TEMPNAME}"
done

echo "########################"
echo "Build process completed."
echo "########################"
echo "Do you wish to upload new images? (y/n) "
select yn in "Yes" "No"; do
    case $yn in
        Yes ) echo "Publishing latest images."; break;;
        No ) echo "Images ready to deploy."; rm -rf qemu-*-static; exit;;
    esac
done

# push new images to Docker Hub
for arch in "amd64" "arm32" "arm64" "i386"; do docker push iotreboot/tasui-$arch:${VERSION}; done

# Create manifest for multiarch image
docker manifest create -a iotreboot/tasui:latest${MANIFEST}
docker manifest push --purge iotreboot/tasui:latest

# cleaning
rm -rf qemu-*-static
echo "#######################"
echo "Push process completed."
echo "#######################"
