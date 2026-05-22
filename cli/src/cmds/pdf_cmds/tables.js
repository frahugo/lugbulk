const fs = require("fs");
const path = require("path");
const pdf = require("pdf-creator-node");
const Handlebars = require("handlebars");
const QRCode = require("qrcode");

exports.command = "tables [num_tables]";
exports.desc = "Generate PDF file for sorting tables";
exports.builder = {
  num_tables: {
    default: 15,
    type: "number",
    description: "Number of tables to generate",
  },
};
exports.handler = function (argv) {
  const output = argv.output === undefined ? "./tables.pdf" : argv.output;
  print(argv.num_tables, output);
};

async function print(numTables, output) {
  const template = path.resolve(path.join(__dirname, "../../../resources/tables.html"));

  var html = fs.readFileSync(template, "utf8");

  var options = {
    format: "Letter",
    orientation: "portrait",
    border: "10mm",
    header: {
      height: "10mm",
    },
    footer: {
      height: "0mm",
      contents: {},
    },
  };

  const tables = Array.from({ length: numTables }, (_, i) => ({ number: i + 1 }));

  generateAppQrCode().then((appQrcode) => {
    var document = {
      html: html,
      data: { tables, count: tables.length, appQrcode },
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

function generateAppQrCode() {
  return QRCode.toDataURL("https://lugbulkcalc.com/", { margin: 0 })
    .then((url) => url)
    .catch((err) => {
      console.log(err);
      return "error occurred";
    });
}

Handlebars.registerHelper("if_multiple_of_three_tables", function (conditional, count, options) {
  if (conditional + 1 == count) {
    return "";
  } else if ((conditional + 1) % 3 == 0) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});
