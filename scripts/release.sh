#!/bin/bash

# Define color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'

# Check for uncommitted changes and abort if found
if [[ $(git status --porcelain) ]]; then
    echo "${RED}There are uncommitted changes in your working directory. Please commit or stash them before running this script."
    exit 1
fi

echo "${BLUE}Checking out to master branch..."
git checkout master

echo "${BLUE}Pulling latest changes..."
git pull origin master

echo "${BLUE}Installing dependencies..."
yarn

echo "${BLUE}Build project..."
yarn build

echo "${BLUE}Running version command..."
yarn run version patch --yes --force-publish

echo "${BLUE}Lerna version patch increment completed."

# Get the latest Git tag (created by Lerna)
latest_tag=$(git describe --tags --abbrev=0)

echo "${GREEN}Your build link: http://jenkins.rarible.int/view/protocol/job/protocol-sdk/view/tags/job/$latest_tag"
