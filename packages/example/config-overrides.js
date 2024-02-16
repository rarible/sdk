const {override, addExternalBabelPlugins} = require("customize-cra")

module.exports = override(
	...addExternalBabelPlugins(
		"@babel/plugin-proposal-nullish-coalescing-operator",
		"@babel/plugin-proposal-logical-assignment-operators",
		"@babel/plugin-proposal-optional-chaining",
		"@babel/plugin-syntax-bigint"
	)
)
