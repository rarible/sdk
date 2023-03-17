#!/bin/sh
set -e

yarn run build-connector
yarn run build-connector-beacon
yarn run build-connector-fcl
yarn run build-connector-mattel
yarn run build-connector-helper
yarn run build-connector-iframe &
yarn run build-connector-mew &
yarn run build-connector-portis &
yarn run build-connector-fortmatic &
yarn run build-connector-torus &
yarn run build-connector-walletlink &
yarn run build-connector-walletconnect &
yarn run build-connector-phantom &
yarn run build-connector-solflare &
yarn run build-connector-imx
wait
