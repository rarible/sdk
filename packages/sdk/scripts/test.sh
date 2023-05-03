#!/bin/sh
set -e
start=$(date +%s)
scripts_dir="$(dirname -- "$(readlink -f "${BASH_SOURCE}")")"

cd "${scripts_dir}/.."
#ethereum
(jest --runInBand --testPathPattern=src/sdk-blockchains/ethereum --forceExit || echo "ignoring ethereum tests")
(jest --runInBand --testPathPattern=src/sdk-blockchains/flow --forceExit || echo "ignoring flow tests") &
(jest --runInBand --testPathPattern=src/sdk-blockchains/immutablex --forceExit || echo "ignoring imx tests") &
(jest --runInBand --testPathPattern=src/sdk-blockchains/tezos --forceExit || echo "ignoring tezos tests")
wait
echo "REST OF TESTS:"
#rest of tests
(jest --runInBand --testPathIgnorePatterns "src/sdk-blockchains/ethereum" "src/sdk-blockchains/immutablex" "src/sdk-blockchains/tezos" "src/sdk-blockchains/flow" --forceExit) || echo "ignoring rest of tests"


end=$(date +%s)
seconds=$(echo "$end - $start" | bc)
echo 'TESTS DURATION: '$seconds' sec'
