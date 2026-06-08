const fs = require("fs");
const path = require("path");
const pdf = require("pdf-creator-node");
const Handlebars = require("handlebars");

const { Order } = require("lugbulk-lib/src/order");

exports.command = "dispatch <order_csv_file>";
exports.desc = "Generate PDF file for buyer zone dispatch";
exports.builder = {};
exports.handler = async function (argv) {
  const order = new Order();
  const output = argv.output === undefined ? "./dispatch.pdf" : argv.output;

  await order.load(argv.order_csv_file);
  print(order, output);
};

async function print(order, output) {
  const template = path.resolve(path.join(__dirname, "../../../resources/dispatch.html"));

  var html = fs.readFileSync(template, "utf8");

  var options = {
    format: "Letter",
    orientation: "portrait",
    border: "10mm",
    header: {
      height: "0mm",
    },
    footer: {
      height: "0mm",
      contents: {},
    },
  };

  const zones = groupByZone(order.buyers);

  var document = {
    html: html,
    data: { zones, count: zones.length },
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

function groupByZone(buyers) {
  const zoneMap = new Map();

  for (const buyer of buyers) {
    const letter = buyer.zone;
    if (!zoneMap.has(letter)) {
      zoneMap.set(letter, []);
    }
    zoneMap.get(letter).push(buyer);
  }

  return Array.from(zoneMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, buyers]) => ({ letter, buyers }));
}

Handlebars.registerHelper("buyerId", function (buyer) {
  return `${buyer.zone}${buyer.memberId}`;
});

Handlebars.registerHelper("isLastZone", function (index, count, options) {
  if (index + 1 === count) {
    return options.fn(this);
  }
  return options.inverse(this);
});
