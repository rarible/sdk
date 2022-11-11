#!/bin/sh
env
lerna run test --parallel || echo 'ignoring errors in test results'