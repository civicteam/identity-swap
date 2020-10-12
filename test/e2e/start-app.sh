#!/usr/bin/env bash
set -e

cd ../..
set -a
source ./.env.test >/dev/null 2>&1
set +a
env
true | ( CI=true yarn react-scripts start ) 2>&1 | cat
