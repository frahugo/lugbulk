const chalk = require("chalk");
const TextTable = require("text-table");
const { Element } = require("lugbulk-lib/element");
const { Order } = require("lugbulk-lib/order");

exports.command = "elements";
exports.desc = "List elements from a LugBulk order";
exports.builder = {};
exports.handler = function (argv) {
  const order = new Order();

  order.load(argv.input);

  if (argv.output === undefined) {
    var table = [];
    for (var elem of order.elements) {
      table.push([chalk.yellow.bold(elem.id), elem.name, chalk.green.green(elem.color)]);
    }
    console.log(TextTable(table));
    console.log("Total of %d elements", order.elements.length);
  } else {
    console.log("Listing elements from %s and output to %s", argv.input, argv.output);
  }
};
