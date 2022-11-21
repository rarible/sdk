#!/bin/sh
set -e

yarn run build-ethereum-provider
yarn run build-ethereum-test-common
yarn run build-ethereum-ethers
yarn run build-ethereum-web3
yarn run build-ethereum-biconomy-middleware
yarn run build-ethereum-sdk

yarn run build-imx-wallet
yarn run build-imx-sdk

yarn run build-solana-common
yarn run build-solana-wallet
yarn run build-solana-sdk

yarn run build-sdk-wallet
yarn run build-sdk-transaction
yarn run build-sdk
yarn run build-sdk-transaction-backend

yarn run build-connector
yarn run build-connector-iframe
yarn run build-connector-fcl
yarn run build-connector-beacon
yarn run build-connector-mew
yarn run build-connector-portis
yarn run build-connector-fortmatic
yarn run build-connector-torus
yarn run build-connector-walletlink
yarn run build-connector-walletconnect
yarn run build-connector-helper
yarn run build-connector-phantom
yarn run build-connector-solflare
yarn run build-connector-imx
yarn run build-sdk-examples

