#!/bin/sh
set -e
start=$(date +%s)
scripts_dir="$(dirname -- "$(readlink -f "${BASH_SOURCE}")")"

cd "${scripts_dir}/.."
#ethereum
jest --runInBand --testPathPattern=src/sdk-blockchains/ethereum --forceExit &
jest --runInBand --testPathPattern=src/sdk-blockchains/flow --forceExit &
jest --runInBand --testPathPattern=src/sdk-blockchains/immutablex --forceExit &
jest --runInBand --testPathPattern=src/sdk-blockchains/tezos --forceExit
wait
echo "REST OF TESTS:"
#rest of tests
jest --runInBand --testPathIgnorePatterns "src/sdk-blockchains/ethereum" "src/sdk-blockchains/immutablex" "src/sdk-blockchains/tezos" "src/sdk-blockchains/flow" --forceExit


end=$(date +%s)
seconds=$(echo "$end - $start" | bc)
echo 'TESTS DURATION: '$seconds' sec'
