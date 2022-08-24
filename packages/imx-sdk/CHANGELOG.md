# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.9.23](https://github.com/rarible/sdk/compare/v0.9.22...v0.9.23) (2022-08-23)


### Bug Fixes

* change baseFee for imx ([#320](https://github.com/rarible/sdk/issues/320)) ([46c0e49](https://github.com/rarible/sdk/commit/46c0e49a717c894f3a97622a26dd06ed48cbe2b0))





## [0.9.22](https://github.com/rarible/sdk/compare/v0.9.21...v0.9.22) (2022-08-22)


### Bug Fixes

* correct getBalance for imx ([#319](https://github.com/rarible/sdk/issues/319)) ([fe906d2](https://github.com/rarible/sdk/commit/fe906d2a2833c8394cb076214bcd7e1938f790b4))





## [0.9.21](https://github.com/rarible/sdk/compare/v0.9.20...v0.9.21) (2022-08-19)

**Note:** Version bump only for package @rarible/immutable-sdk





## [0.9.19](https://github.com/rarible/sdk/compare/v0.9.18...v0.9.19) (2022-08-16)

**Note:** Version bump only for package @rarible/immutable-sdk





## [0.9.18](https://github.com/rarible/sdk/compare/v0.9.17...v0.9.18) (2022-08-12)


* immutablex sdk integration (#309) ([d7c63b5](https://github.com/rarible/sdk/commit/d7c63b57f16fa998a25085a79271cec315cdae51)), closes [#309](https://github.com/rarible/sdk/issues/309)


### BREAKING CHANGES

* field `blockchain` on wallets replaced by field `walletType: WalletType`
* Transactions now have property `isEmpty` indicating whether the
transaction is empty and should be ignored
* all places where BlockchainGroup was used should use WalletType now
