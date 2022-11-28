#!/bin/sh
set -e

yarn run build-solana-common
yarn run build-solana-wallet
yarn run build-solana-sdk
