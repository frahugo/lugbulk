// const { Element } = require("../../../../lib/element.js");
const { Element } = require("lugbulk-lib/element");

exports.command = "elements";
exports.desc = "List elements from a LugBulk order";
exports.builder = {};
exports.handler = function (argv) {
  const element = new Element("123456", "BRICK 1 X 1", "black");

  console.log(element);

  if (argv.output === undefined) {
    console.log("Listing elements from %s", argv.input);
  } else {
    console.log(
      "Listing elements from %s and output to %s",
      argv.input,
      argv.output
    );
  }
};
