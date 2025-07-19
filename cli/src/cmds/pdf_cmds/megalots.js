const fs = require("fs");
const path = require("path");
const pdf = require("pdf-creator-node");
const pluralize = require("pluralize");
const Handlebars = require("handlebars");

const { Element } = require("lugbulk-lib/src/element");
const { Order } = require("lugbulk-lib/src/order");

exports.command = "megalots <order_csv_file>";
exports.desc = "Generate PDF file for megalots";
exports.builder = {};
exports.handler = function (argv) {
  const order = new Order();
  const output = argv.output === undefined ? "./megalots.pdf" : argv.output;

  order.load(argv.order_csv_file);
  print(order, output);
};

async function print(order, output) {
  const template = path.resolve(path.join(__dirname, "../../../resources/megalots.html"));

  var html = fs.readFileSync(template, "utf8");

  var now = new Date();
  var year = now.getFullYear();

  var options = {
    format: "Letter",
    orientation: "portrait",
    border: "0mm",
    header: {
      height: "0mm",
      // contents: '<div style="text-align: center;">Author: Shyam Hajare</div>',
    },
    footer: {
      height: "0mm",
      // contents: { default: "<span>LUGbulk 2025</span>", },
    },
  };

  var document = {
    html: html,
    data: { order: order, year: year },
    path: output,
    type: "",
  };

  pdf
    .create(document, options)
    .then((res) => {
      console.log("PDF file generated: %s", res.filename);
    })
    .catch((error) => {
      console.error(error);
    });
}

Handlebars.registerHelper("elementName", function (order, elementId) {
  return order.findElement(elementId).name;
});

Handlebars.registerHelper("elementColor", function (order, elementId) {
  return order.findElement(elementId).color;
});

Handlebars.registerHelper("elementIdentifier", function (order, elementId) {
  const element = order.findElement(elementId);
  const identifier = `${element.id} (${element.sequenceNumber})`;
  return identifier;
});

Handlebars.registerHelper("chunk", function (array, chunkSize) {
  if (!Array.isArray(array) || chunkSize <= 0) return [];
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
});
