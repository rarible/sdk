const path = require("path")
const webpack = require("webpack")

module.exports = {
	entry: "./build/index.js",
	output: {
		path: path.resolve(__dirname, "umd"),
		filename: "rarible-ethers-ethereum.js",
		library: {
			name: "raribleEthersEthereum",
			type: "umd",
		},
	},
	resolve: {
		fallback: {
			"stream": require.resolve("stream-browserify"),
			"Buffer": require.resolve("buffer"),
			"process": require.resolve("process/browser"),
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
	optimization: {
		minimize: true,
	},
}
