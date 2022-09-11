const fs = require("fs");
const path = require("path");
const pdf = require("pdf-creator-node");
const pluralize = require("pluralize");
const Handlebars = require("handlebars");
const QRCode = require("qrcode");

const { Element } = require("lugbulk-lib/src/element");
const { Order } = require("lugbulk-lib/src/order");

exports.command = "elements <order_csv_file>";
exports.desc = "Generate PDF file for elements";
exports.builder = {};
exports.handler = function (argv) {
  const order = new Order();
  const output = argv.output === undefined ? "./elements.pdf" : argv.output;

  order.load(argv.order_csv_file);
  print(order, output);
};

async function print(order, output) {
  const template = path.resolve(path.join(__dirname, "../../../resources/elements.html"));

  var html = fs.readFileSync(template, "utf8");

  var options = {
    format: "Letter",
    orientation: "portrait",
    border: "10mm",
    header: {
      height: "5mm",
      // contents: '<div style="text-align: center;">Author: Shyam Hajare</div>',
    },
    footer: {
      height: "5mm",
      contents: {
        // default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>',
      },
    },
  };

  generateQrCodes(order.elements).then((qrcodes) => {
    var document = {
      html: html,
      data: { order: order, qrcodes: qrcodes },
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
  });
}

function generateQrCodes(remainingELements, acc = {}) {
  if (remainingELements.length === 0) {
    return acc;
  } else {
    var element = remainingELements[0];
    var others = remainingELements.slice(1);

    let quantities = element.lots.map((lot) => lot.quantity).join(",");
    let qrcodeData = {
      id: element.id,
      name: element.name,
      total: element.totalQuantity,
      lots: quantities,
    };
    let qrcodeDataJson = JSON.stringify(qrcodeData);

    // Get the base64 url
    return QRCode.toDataURL(qrcodeDataJson, { margin: 0 })
      .then((url) => {
        acc[element.id] = url;
        return generateQrCodes(others, acc);
      })
      .catch((err) => {
        console.log(err);
        acc[element.id] = "error occurred";
        return acc;
      });
  }
}

Handlebars.registerHelper("firstName", function (order, pseudo) {
  return order.findBuyer(pseudo).firstName;
});

Handlebars.registerHelper("lastName", function (order, pseudo) {
  return order.findBuyer(pseudo).lastName;
});

Handlebars.registerHelper("id", function (order, pseudo) {
  let buyer = order.findBuyer(pseudo);
  return `${buyer.memberId}`;
});

Handlebars.registerHelper("qrcode", function (element, qrcodes) {
  return qrcodes[element.id];
});
