const fs = require("fs");
const path = require("path");
const pdf = require("pdf-creator-node");
const pluralize = require("pluralize");
const Handlebars = require("handlebars");

const { Order } = require("lugbulk-lib/src/order");
const { Club } = require("lugbulk-lib/src/club");

exports.command = "buyers <order_csv_file> <members_csv_file>";
exports.desc = "Generate PDF file for buyers";
exports.builder = {};
exports.handler = async function (argv) {
  const order = new Order();
  const club = new Club();
  const output = argv.output === undefined ? "./buyers.pdf" : argv.output;

  await order.load(argv.order_csv_file);
  club.load(argv.members_csv_file);
  print(order, club, output);
};

async function print(order, club, output) {
  const template = path.resolve(path.join(__dirname, "../../../resources/buyers.html"));

  var html = fs.readFileSync(template, "utf8");

  var options = {
    format: "Letter",
    orientation: "portrait",
    border: "10mm",
    header: {
      height: "10mm",
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
    data: { order: order, club: club, count: order.buyers.length },
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

Handlebars.registerHelper("city", function (club, pseudo) {
  return club.findMember(pseudo).city;
});

Handlebars.registerHelper("region", function (club, pseudo) {
  return club.findMember(pseudo).region;
});

Handlebars.registerHelper("distribution_badge", function (method) {
  const labels = { self: "Sur place", region: "Région", person: "Via" };
  const label = labels[method] || method || "";
  return new Handlebars.SafeString(`<span class="badge">${label}</span>`);
});

Handlebars.registerHelper("distribution_detail", function (method, distributorName, region) {
  if (method === "person") return distributorName || "";
  if (method === "region") return region || "";
  return "";
});

Handlebars.registerHelper("if_multiple_of_three", function (conditional, count, options) {
  if (conditional + 1 == count) {
    // Do nothing
    return "";
  } else if ((conditional + 1) % 3 == 0) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper("if_extras", function (element, options) {
  if (element.extraQuantity > 0) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});
