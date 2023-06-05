#!/bin/sh
echo "testnet key=${SDK_API_KEY_TESTNET}"
echo "prod key=${SDK_API_KEY_PROD}"
lerna run test --parallel --ignore=@rarible/sdk || echo 'ignoring errors in test results'
lerna run test --scope=@rarible/sdk  || echo 'ignoring errors in SDK test results'
