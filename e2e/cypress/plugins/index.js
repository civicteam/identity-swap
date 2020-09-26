const cucumber = require("cypress-cucumber-preprocessor").default;
const browserify = require("@cypress/browserify-preprocessor");
const webpack = require("@cypress/webpack-preprocessor");

module.exports = (on) => {
  const options = browserify.defaultOptions;

  // options.browserifyOptions.plugin.unshift(["tsify"]);
  // To set a custom tsconfig:
  const tsconfigPath = process.cwd() + "/cypress/tsconfig.json";

  console.log(tsconfigPath);

  options.browserifyOptions.plugin.unshift([
    "tsify",
    { project: tsconfigPath },
  ]);

  on("file:preprocessor", cucumber(options));

  // const option s = {
  //   webpackOptions: require("../webpack.config.js"),
  // };
  // on("file:preprocessor", webpack(options));
};
