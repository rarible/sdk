const {override, addExternalBabelPlugins, addWebpackAlias} = require("customize-cra")

module.exports = override(
	...addExternalBabelPlugins(
		"@babel/plugin-proposal-nullish-coalescing-operator",
		"@babel/plugin-proposal-logical-assignment-operators",
		"@babel/plugin-proposal-optional-chaining"
	),
	addWebpackAlias({
		"zlib": require.resolve("zlib-browserify"),
		"os": require.resolve("os-browserify/browser"),
		"crypto": require.resolve("crypto-browserify"),
		"process/browser": require.resolve("process/browser"),
		"stream": require.resolve("stream-browserify"),
		"path": require.resolve("path-browserify"),
		"https": false,
		"http": false,
	})
)
