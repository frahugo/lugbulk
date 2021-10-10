const chalk = require("chalk");
const TextTable = require("text-table");
const Papa = require("papaparse");
const fs = require("fs");

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
    var table = [["elementId", "name", "color"]];
    for (var elem of order.elements) {
      table.push([elem.id, elem.name, elem.color]);
    }

    fs.writeFile(argv.output, Papa.unparse(table), function (err) {
      if (err) return console.log(err);
    });
  }
};
