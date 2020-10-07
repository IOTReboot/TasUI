#!/bin/bash

GIT_BRANCH=`git rev-parse --abbrev-ref HEAD`

case "$GIT_BRANCH" in
    "master") NODE_ENV=production npm run build && gsutil -m rsync -R -d build gs://tasui.shantur.com ;;

    "development") NODE_ENV=development npm run build && gsutil -m rsync -R -d build gs://tasui-dev.shantur.com ;;

    "next-release") NODE_ENV=staging npm run build && gsutil -m rsync -R -d build gs://tasui-next.shantur.com ;;

    "*") echo "Branch $GIT_BRANCH publishing isn't setup" && exit 1 ;;
esac