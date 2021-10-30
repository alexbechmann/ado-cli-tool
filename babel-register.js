require("reflect-metadata");
const path = require("path");
const fs = require("fs");

const babelConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, ".babelrc")).toString()
);

require("@babel/register")({
  cache: false,
  extensions: [".ts", ".tsx"],
  ...babelConfig,
});
