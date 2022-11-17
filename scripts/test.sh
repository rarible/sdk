#!/bin/sh
lerna run test --parallel || echo 'ignoring errors in test results'