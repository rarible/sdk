# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.9.13-beta.imx.2](https://github.com/rarible/sdk/compare/v0.9.13-beta.imx.1...v0.9.13-beta.imx.2) (2022-07-29)

**Note:** Version bump only for package @rarible/immutable-wallet





## [0.9.13-beta.imx.1](https://github.com/rarible/sdk/compare/v0.9.13...v0.9.13-beta.imx.1) (2022-07-29)


### Features

* added immutablex sdk, ([25f5542](https://github.com/rarible/sdk/commit/25f5542ec2405b532eb87a1b3f325f6e66511733))


### BREAKING CHANGES

* field `blockchain` on wallets replaced by field `walletType: WalletType`
* Transactions now have property `isEmpty` indicating whether the
transaction is empty and should be ignored
