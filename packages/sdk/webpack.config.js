const path = require("path")
const webpack = require("webpack")

module.exports = {
	entry: "./build/index.js",
	experiments: {
		outputModule: true,
	},
	output: {
		path: path.resolve(__dirname, "umd"),
		filename: "rarible-sdk.js",
		library: {
			type: "umd",
		},
		path: path.resolve(__dirname, "esm"),
		filename: "rarible-sdk.js",
		library: {
			type: "module",
		},
	},
	resolve: {
		fallback: {
			"os": require.resolve("os-browserify/browser"),
			"stream": require.resolve("stream-browserify"),
			"buffer": require.resolve("buffer"),
			"process": require.resolve("process/browser"),
			"path": require.resolve("path-browserify"),
			"crypto": require.resolve("crypto-browserify"),
			"http": false,
			"https": false,
		},
	},
	plugins: [
		new webpack.ProvidePlugin({
			Buffer: ["buffer", "Buffer"],
		}),
		new webpack.ProvidePlugin({
			process: "process/browser",
		}),
	],
	mode: "production",
	module: {
		rules: [{
			test: /\.mjs/,
			resolve: {
				fullySpecified: false,
			},
		}],
	},
	optimization: {
		minimize: true,
	},
}
