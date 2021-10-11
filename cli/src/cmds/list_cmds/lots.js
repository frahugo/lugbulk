const chalk = require("chalk");
const TextTable = require("text-table");
const Papa = require("papaparse");
const fs = require("fs");

const { Element } = require("lugbulk-lib/src/element");
const { Order } = require("lugbulk-lib/src/order");

exports.command = "lots";
exports.desc = "List lots from a LugBulk order";
exports.builder = {};
exports.handler = function (argv) {
  const order = new Order();

  order.load(argv.input);

  if (argv.output === undefined) {
    var table = [];
    for (var lot of order.lots) {
      const element = order.findElement(lot.elementId);
      const buyer = order.findBuyer(lot.pseudo);
      line = [
        chalk.yellow.bold(element.id),
        element.name,
        chalk.green.green(element.color),
        buyer.pseudo,
        lot.quantity,
        lot.sequence,
        buyer.firstName,
        buyer.lastName,
      ];
      table.push(line);
    }
    console.log(TextTable(table));
    console.log("Total of %d lots", order.lots.length);
  } else {
    var table = [
      ["elementId", "name", "color", "pseudo", "quantity", "sequence", "first_name", "last_name"],
    ];
    for (var lot of order.lots) {
      const element = order.findElement(lot.elementId);
      const buyer = order.findBuyer(lot.pseudo);
      line = [
        element.id,
        element.name,
        element.color,
        buyer.pseudo,
        lot.quantity,
        lot.sequence,
        buyer.firstName,
        buyer.lastName,
      ];
      table.push(line);
    }

    fs.writeFile(argv.output, Papa.unparse(table), function (err) {
      if (err) return console.log(err);
    });
  }
};
