# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.9.36](https://github.com/rarible/sdk/compare/v0.9.35...v0.9.36) (2022-10-14)


### Bug Fixes

* change imx network ([#358](https://github.com/rarible/sdk/issues/358)) ([423b136](https://github.com/rarible/sdk/commit/423b136acec46c3aa358ce6e989d20415a65b1c1))


### Features

* add gamestop wallet enum value ([#357](https://github.com/rarible/sdk/issues/357)) ([558df7b](https://github.com/rarible/sdk/commit/558df7b8c5379b77e422f35c8c18bd025147e685))





## [0.9.21](https://github.com/rarible/sdk/compare/v0.9.20...v0.9.21) (2022-08-19)


### Features

* add iframe support for imx-wallet, simplify things ([6f1a46e](https://github.com/rarible/sdk/commit/6f1a46e6e88b7be83a9cb80f8b9886a843713e57))





## [0.9.19](https://github.com/rarible/sdk/compare/v0.9.18...v0.9.19) (2022-08-16)


### Bug Fixes

* remove test command from imx-wallet pkg ([b76bc1c](https://github.com/rarible/sdk/commit/b76bc1c3d19694930c4bf38004791b526c033afb))





## [0.9.18](https://github.com/rarible/sdk/compare/v0.9.17...v0.9.18) (2022-08-12)


* immutablex sdk integration (#309) ([d7c63b5](https://github.com/rarible/sdk/commit/d7c63b57f16fa998a25085a79271cec315cdae51)), closes [#309](https://github.com/rarible/sdk/issues/309)


### BREAKING CHANGES

* field `blockchain` on wallets replaced by field `walletType: WalletType`
* Transactions now have property `isEmpty` indicating whether the
transaction is empty and should be ignored
* all places where BlockchainGroup was used should use WalletType now
