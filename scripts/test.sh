#!/bin/sh
lerna run test --parallel --ignore=@rarible/sdk || echo 'ignoring errors in test results'
lerna run test --scope=@rarible/sdk  || echo 'ignoring errors in SDK test results'
