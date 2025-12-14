#!/bin/sh

CI=false npm run build
serve -s build
