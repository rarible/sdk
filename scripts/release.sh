#!/bin/bash

# Check for uncommitted changes and abort if found
if [[ $(git status --porcelain) ]]; then
    echo "There are uncommitted changes in your working directory. Please commit or stash them before running this script."
    exit 1
fi

echo "Checking out to master branch..."
git checkout master

echo "Pulling latest changes..."
git pull origin master

echo "Installing dependencies..."
yarn

echo "Build project..."
yarn build

echo "Running version command..."
yarn run version patch --yes --force-publish

echo "Lerna version patch increment completed."
