#!/bin/sh
set -e
start=$(date +%s)
scripts_dir="$(dirname "$0")"

source $scripts_dir/build-ethereum.sh &
source $scripts_dir/build-imx.sh &
source $scripts_dir/build-solana.sh
wait
source $scripts_dir/build-connectors.sh

yarn run build-sdk-wallet
yarn run build-sdk-transaction
yarn run build-sdk
yarn run build-sdk-transaction-backend

yarn run build-sdk-examples

end=$(date +%s)
seconds=$(echo "$end - $start" | bc)
echo 'BUILDING DURATION: '$seconds' sec'
