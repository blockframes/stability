#!/usr/bin/env bash

# Basics from: https://kvz.io/blog/2013/11/21/bash-best-practices/
set -o errexit
set -o pipefail
set -o nounset
# set -o xtrace

# Set magic variables for current file & dir
__dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
__file="${__dir}/$(basename "${BASH_SOURCE[0]}")"
__base="$(basename ${__file} .sh)"
__root="$(cd "$(dirname "${__dir}")" && pwd)" # <-- change this as it depends on your app

# MONGO_INITDB_ROOT_USERNAME: root
# MONGO_INITDB_ROOT_PASSWORD: example

docker run --name mongo-stability \
		-p 127.0.0.1:27017:27017 \
		-e MONGO_INITDB_ROOT_USERNAME=root \
		-e MONGO_INITDB_ROOT_PASSWORD=helloworld \
		-d mongo:4.2

# docker run --name mongo-stability --port 0.0.0.0:27017:27017  -d mongo:4.2
