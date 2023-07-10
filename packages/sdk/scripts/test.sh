#!/bin/sh
set -e
start=$(date +%s)
scripts_dir="$(cd "$(dirname "$0")" && pwd)"
echo "scripts dir: $scripts_dir"
cd "${scripts_dir}/.."
jest --runInBand --forceExit --testPathPattern=src/sdk-blockchains/ethereum &
jest --runInBand --forceExit --testPathPattern=src/sdk-blockchains/flow &
jest --runInBand --forceExit --testPathPattern=src/sdk-blockchains/immutablex &
jest --runInBand --forceExit --testPathPattern=src/sdk-blockchains/tezos
wait
echo "REST OF TESTS:"
jest --runInBand --forceExit --testPathIgnorePatterns "src/sdk-blockchains/ethereum" "src/sdk-blockchains/immutablex" "src/sdk-blockchains/tezos" "src/sdk-blockchains/flow"


end=$(date +%s)
seconds=$(echo "$end - $start" | bc)
echo 'TESTS DURATION: '$seconds' sec'
