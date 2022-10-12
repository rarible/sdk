# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.10.0-beta.4](https://github.com/rarible/sdk/compare/v0.10.0-beta.3...v0.10.0-beta.4) (2022-10-12)

**Note:** Version bump only for package @rarible/connector-immutablex-link





# [0.10.0-beta.3](https://github.com/rarible/sdk/compare/v0.9.33...v0.10.0-beta.3) (2022-10-06)



# [0.10.0-beta.2](https://github.com/rarible/sdk/compare/v0.9.32...v0.10.0-beta.2) (2022-10-03)



# [0.10.0-beta.1](https://github.com/rarible/sdk/compare/v0.9.31...v0.10.0-beta.1) (2022-09-23)



# [0.10.0-beta.0](https://github.com/rarible/sdk/compare/v0.9.23...v0.10.0-beta.0) (2022-08-23)

**Note:** Version bump only for package @rarible/connector-immutablex-link





# [0.10.0-beta.2](https://github.com/rarible/sdk/compare/v0.10.0-beta.1...v0.10.0-beta.2) (2022-10-03)

**Note:** Version bump only for package @rarible/connector-immutablex-link





# [0.10.0-beta.1](https://github.com/rarible/sdk/compare/v0.9.31...v0.10.0-beta.1) (2022-09-23)



# [0.10.0-beta.0](https://github.com/rarible/sdk/compare/v0.9.23...v0.10.0-beta.0) (2022-08-23)

**Note:** Version bump only for package @rarible/connector-immutablex-link





# [0.10.0-beta.0](https://github.com/rarible/sdk/compare/v0.9.23...v0.10.0-beta.0) (2022-08-23)

**Note:** Version bump only for package @rarible/connector-immutablex-link





## [0.9.18](https://github.com/rarible/sdk/compare/v0.9.17...v0.9.18) (2022-08-12)


* immutablex sdk integration (#309) ([d7c63b5](https://github.com/rarible/sdk/commit/d7c63b57f16fa998a25085a79271cec315cdae51)), closes [#309](https://github.com/rarible/sdk/issues/309)


### BREAKING CHANGES

* field `blockchain` on wallets replaced by field `walletType: WalletType`
* Transactions now have property `isEmpty` indicating whether the
transaction is empty and should be ignored
* all places where BlockchainGroup was used should use WalletType now
