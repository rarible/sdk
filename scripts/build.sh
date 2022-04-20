set -ex
yarn run build-sdk-wallet
yarn run build-sdk-transaction
yarn run build-sdk
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
yarn run build-connector-phantom
yarn run build-connector-helper

cd packages/transaction-backend
yarn install
yarn build 