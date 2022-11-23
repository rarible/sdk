#!/bin/sh
set -e

yarn run build-ethereum-provider &&
yarn run build-ethereum-ethers &
yarn run build-ethereum-web3 &
yarn run build-ethereum-test-common &
yarn run build-ethereum-biconomy-middleware
yarn run build-ethereum-sdk
