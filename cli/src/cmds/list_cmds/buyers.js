const chalk = require("chalk");
const TextTable = require("text-table");
const Papa = require("papaparse");
const fs = require("fs");

const { Order } = require("lugbulk-lib/src/order");

exports.command = "buyers <order_csv_file>";
exports.desc = "List buyers from a LugBulk order";
exports.builder = {};
exports.handler = async function (argv) {
  const order = new Order();

  await order.load(argv.order_csv_file);

  if (argv.output === undefined) {
    var table = [];
    for (var buyer of order.buyers) {
      table.push([
        chalk.yellow.bold(`${buyer.zone}${buyer.memberId}`),
        buyer.pseudo,
        buyer.fullName,
        buyer.region || "",
        buyer.distribution_method || "",
        buyer.distributor_name || "",
        `${buyer.lots.length} lots`,
      ]);
    }
    console.log(TextTable(table));
    console.log("Total of %d buyers", order.buyers.length);

    const noMethod = order.buyers.filter((b) => !b.distribution_method);
    if (noMethod.length > 0) {
      console.log("\nNo distribution method:");
      for (const buyer of noMethod) {
        console.log("  %s (%s)", buyer.fullName, buyer.pseudo);
      }
    }
  } else {
    var table = [["memberId", "zone", "pseudo", "fullName", "region", "distribution_method", "distributor_name", "lots"]];
    for (var buyer of order.buyers) {
      table.push([
        buyer.memberId,
        buyer.zone,
        buyer.pseudo,
        buyer.fullName,
        buyer.region || "",
        buyer.distribution_method || "",
        buyer.distributor_name || "",
        buyer.lots.length,
      ]);
    }

    fs.writeFile(argv.output, Papa.unparse(table), function (err) {
      if (err) return console.log(err);
    });
  }
};
