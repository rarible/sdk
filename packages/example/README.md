# Rarible SDK React Example

What we have done in this example:

- Create Lazy Minting NFT item
- Create Sell Order
- Create Bid
- Purchase (buy item) an order

See Rarible Protocol documentation for more information about [tokens](https://docs.rarible.org/ethereum/smart-contracts/tokens/#tokens) and [smart contracts](https://docs.rarible.org/ethereum/smart-contracts/smart-contracts/).

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

In this example we're using [Metamask](https://metamask.io/) wallet to interact with ethereum blockchain.

## Install

1. Clone repository
2. Install dependencies and build sdk. Execute in the root folder:

    ```shell
    yarn && yarn bootstrap && yarn build-all
    ```

3. Start the application in development mode:

    ```shell
    cd packages/example
    yarn start
    ```

The application is available at [http://localhost:3000](http://localhost:3000)

The page will reload if you make edits. You will also see any lint errors in the console.

## Test Runner

To launch the test runner in the interactive watch mode:

```shell
yarn test
```

See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

## Build the application

To build the application for production to the `build` folder:

```shell
yarn build
```

It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified, and the filenames include the hashes. Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Eject dependencies

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

```shell
yarn eject
```

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc.) right into your project. So you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts, so you can tweak them. At this point, you are on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However, we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Known issues

* Sale/Bid may not work correctly on non-ethereum blockchains due to incorrect currencies setup

## Suggestions

You are welcome to [suggest features](https://github.com/rarible/protocol/discussions) and [report bugs found](https://github.com/rarible/protocol/issues)!

## License

Rarible Protocol React Example is available under [MIT License](LICENSE.md).
