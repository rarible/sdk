#!/bin/sh
set -e
start=$(date +%s)
scripts_dir="$(cd "$(dirname "$0")" && pwd)"
echo "scripts dir: $scripts_dir"
cd "${scripts_dir}/.."
jest --runInBand --forceExit --testPathPattern=src/sdk-blockchains/ethereum --coverage --coverageReporters=lcov &
jest --runInBand --forceExit --testPathPattern=src/sdk-blockchains/flow --coverage --coverageReporters=lcov &
jest --runInBand --forceExit --testPathPattern=src/sdk-blockchains/immutablex --coverage --coverageReporters=lcov &
jest --runInBand --forceExit --testPathPattern=src/sdk-blockchains/tezos --coverage --coverageReporters=lcov
wait
echo "REST OF TESTS:"
jest --runInBand --forceExit --testPathIgnorePatterns "src/sdk-blockchains/ethereum" "src/sdk-blockchains/immutablex" "src/sdk-blockchains/tezos" "src/sdk-blockchains/flow" --coverage --coverageReporters=lcov


end=$(date +%s)
seconds=$(echo $((end-start)) | awk '{print int($1%60)}')
echo 'TESTS DURATION: '$seconds' sec'
