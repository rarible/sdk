#!/bin/sh
set -e
start=$(date +%s)
scripts_dir="$(dirname "$0")"

yarn run build-sdk-common
. $scripts_dir/build-ethereum.sh &
. $scripts_dir/build-imx.sh &
. $scripts_dir/build-solana.sh
wait
yarn run build-sdk-wallet
yarn run build-aptos-sdk
. $scripts_dir/build-connectors.sh

yarn run build-sdk-transaction
yarn run build-sdk
yarn run build-sdk-transaction-backend

yarn run build-sdk-examples

end=$(date +%s)
seconds=$(echo "$end - $start" | bc)
echo 'BUILDING DURATION: '$seconds' sec'
