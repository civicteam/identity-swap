const cucumber = require("cypress-cucumber-preprocessor").default;
const browserify = require("@cypress/browserify-preprocessor");

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
};
