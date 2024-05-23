const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const { override, addExternalBabelPlugins, addWebpackModuleRule, addWebpackPlugin } = require("customize-cra")

const configFn = override(
	...addExternalBabelPlugins(
		"@babel/plugin-proposal-nullish-coalescing-operator",
		"@babel/plugin-proposal-logical-assignment-operators",
		"@babel/plugin-proposal-optional-chaining",
		"@babel/plugin-syntax-bigint"
	),
	addWebpackModuleRule({
		test: /\.mjs$/,
		include: /node_modules/,
		type: "javascript/auto"
	}),
	addWebpackPlugin(new NodePolyfillPlugin({
		includeAliases: ["process", "buffer", "https", "http", "os", "path", "zlib", "crypto", "stream"]
	}))
)
module.exports = function prepareConfig(config) {
	return configFn(config)
}
