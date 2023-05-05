#!/bin/sh
set -e
start=$(date +%s)
scripts_dir="$(dirname -- "$( readlink -f -- "$0"; )")"
echo "scripts dir: $scripts_dir"
cd "${scripts_dir}/.."
#ethereum
jest --runInBand --testPathPattern=src/sdk-blockchains/ethereum &
jest --runInBand --testPathPattern=src/sdk-blockchains/flow &
jest --runInBand --testPathPattern=src/sdk-blockchains/immutablex &
jest --runInBand --testPathPattern=src/sdk-blockchains/tezos
wait
echo "REST OF TESTS:"
#rest of tests
jest --runInBand --testPathIgnorePatterns "src/sdk-blockchains/ethereum" "src/sdk-blockchains/immutablex" "src/sdk-blockchains/tezos" "src/sdk-blockchains/flow"


end=$(date +%s)
seconds=$(echo "$end - $start" | bc)
echo 'TESTS DURATION: '$seconds' sec'
