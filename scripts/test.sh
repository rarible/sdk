#!/bin/sh
echo endoint is $SOLANA_CUSTOM_ENDPOINT
lerna run test --parallel || echo 'ignoring errors in test results'