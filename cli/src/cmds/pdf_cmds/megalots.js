const fs = require("fs");
const path = require("path");
const pdf = require("pdf-creator-node");
const pluralize = require("pluralize");
const Handlebars = require("handlebars");

const { Element } = require("lugbulk-lib/src/element");
const { Order } = require("lugbulk-lib/src/order");

exports.command = "megalots";
exports.desc = "Generate PDF file for megalots";
exports.builder = {};
exports.handler = function (argv) {
  const order = new Order();
  const output = argv.output === undefined ? "./output.pdf" : argv.output;

  order.load(argv.input);
  print(order, output);
};

async function print(order, output) {
  const template = path.resolve(path.join(__dirname, "../../../resources/megalots.html"));

  var html = fs.readFileSync(template, "utf8");

  var options = {
    format: "Letter",
    orientation: "portrait",
    border: "10mm",
    header: {
      height: "0mm",
      // contents: '<div style="text-align: center;">Author: Shyam Hajare</div>',
    },
    footer: {
      height: "0mm",
      contents: {
        // default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
      },
    },
  };

  var document = {
    html: html,
    data: { order: order },
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
