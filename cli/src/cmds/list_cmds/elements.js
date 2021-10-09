exports.command = "elements";
exports.desc = "List elements from a LugBulk order";
exports.builder = {};
exports.handler = function (argv) {
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
