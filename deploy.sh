#!/bin/sh

#CI=false NODE_OPTIONS="--max-old-space-size=4096" GENERATE_SOURCEMAP=false npm run build
#serve -s build
CI=false NODE_OPTIONS="--max-old-space-size=8192" npm run start
