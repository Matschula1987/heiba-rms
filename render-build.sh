#!/bin/bash
yarn install
yarn build
mkdir -p /opt/render/project/src
cp -r .next node_modules package.json yarn.lock next.config.js public /opt/render/project/src/
