const path = require("path")
const fs = require("fs")
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin")
// import HtmlWebpackPlugin from "html-webpack-plugin"
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
  mode: "development",
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/",
    filename: "[name].[fullhash].js",
    chunkFilename: "[name].[fullhash].js",
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
    historyApiFallback: true,
    https: {
      key: fs.readFileSync(path.join(__dirname, "./test-virtual.mattel.com-key.pem")),
      cert: fs.readFileSync(path.join(__dirname, "./test-virtual.mattel.com.pem")),
      // ca: fs.readFileSync(path.join(__dirname, "./server.key")),
    },
    port: 443,
    open: true,
  },
  resolve: {
    extensions: [".mjs", ".js", ".jsx", ".tsx", ".ts", ".json"],
    // alias: config.aliases,
    plugins: [
      new TsconfigPathsPlugin({
        baseUrl: path.resolve(__dirname),
        configFile: path.resolve(__dirname, "tsconfig.json"),
      }),
    ],
  },
  experiments: {
    asyncWebAssembly: true,
  },
  entry: path.resolve(__dirname, "src/index.tsx"),
  module: {
    rules: [
      {
        test: /\.[tj]sx?$/,
        use: {
          loader: "babel-loader",
          options: {
            babelrc: false,
            sourceType: "unambiguous",
            cacheDirectory: true,

            presets: [
              [
                "@babel/env",
                {
                  useBuiltIns: "usage",
                  corejs: "3",
                },
              ],
              ["@babel/react"],
              [
                "@babel/typescript",
                {
                  allowNamespaces: true,
                  onlyRemoveTypeImports: true,
                },
              ],
            ],
            plugins: [
              // ...getLinguiPlugins(config.linguiSupport),
              // ...getStyledComponentsPlugins(config.styledComponents),
              /**
               * Allows async require
               * Used in i18n package
               */
              "@babel/plugin-syntax-dynamic-import",
              /**
               * This is required for importing helpers from @babel/runtime
               * instead of redeclaring in every module
               */
              "@babel/plugin-transform-runtime",
              /**
               * This required because constructor properties in class
               * must be initialized before other class properties
               */
              ["@babel/plugin-proposal-private-property-in-object", { loose: true }],
              ["@babel/plugin-proposal-private-methods", { loose: true }],
              ["@babel/plugin-proposal-class-properties", { loose: true }],
            ],
          },
        },
        exclude: [/node_modules/],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg|mp4|webm|woff|woff2|otf|ttf|eot|webp)$/,
        type: "asset",
      },
      /**
       * If move it to all assets in object above it won't work
       * idk why
       */
      {
        resourceQuery: /file/,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      // template: config.pathToTemplate,
      template: path.resolve(__dirname, "/public/index.html"),
      templateParameters: false,
      // favicon: config.faviconPath,
      minify: {
        collapseWhitespace: true,
      },
    }),
    new NodePolyfillPlugin({
      excludeAliases: [
        "console",
        "zlib",
        "vm",
        "url",
        "tty",
        "timers",
        "sys",
        "string_decoder",
        "querystring",
        "punycode",
        "events",
        "domain",
        "constants",
        "_stream_writable",
        "_stream_transform",
        "_stream_readable",
        "_stream_passthrough",
        "_stream_duplex",
      ],
    }),
  ],
}
