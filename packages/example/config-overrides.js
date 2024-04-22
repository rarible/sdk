const {override, addExternalBabelPlugins} = require("customize-cra")

const configFn = override(
	...addExternalBabelPlugins(
		"@babel/plugin-proposal-nullish-coalescing-operator",
		"@babel/plugin-proposal-logical-assignment-operators",
		"@babel/plugin-proposal-optional-chaining",
		"@babel/plugin-syntax-bigint"
	)
)
module.exports = function o(config) {
	config.module.rules.push({
		test: /\.mjs$/,
		include: /node_modules/,
		type: "javascript/auto"
	})
	const c = configFn(config)
	console.log(JSON.stringify(c, null, "  "))

	return c
}
