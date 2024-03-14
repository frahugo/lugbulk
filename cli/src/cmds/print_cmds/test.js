const fs = require("fs");
const path = require("path");
const Dymo = require("dymojs");

const { Element } = require("lugbulk-lib/src/element");
const { Order } = require("lugbulk-lib/src/order");

exports.command = "test <order_csv_file>";
exports.desc = "Print a test label from a LugBulk order";
exports.builder = {};
exports.handler = function (argv) {
  const order = new Order();
  order.load(argv.order_csv_file);
  print(order);
};

async function print(order) {
  const lotLabelFile = path.resolve(path.join(__dirname, "../../../resources/lot-first.label"));

  const labelConfig = {
    dymo: new Dymo(),
    lotLabelXml: fs.readFileSync(lotLabelFile, "utf8"),
  };

  element = order.elements[0];

  printLot(element, labelConfig).then((result) => {
    console.log("1 label should have been printed.");
  });
}

function printElement(element, labelConfig) {
  const labelParts = [];

  labelParts.push("<LabelSet>");
  recordXml = buildRecordXml(element, lot);
  labelParts.push(recordXml);
  labelParts.push("</LabelSet>");

  let labelSetXml = labelParts.join("");

  return printLabels(labelConfig.dymo, labelConfig.elementLabelXml, labelSetXml);
}

function printLot(element, labelConfig) {
  const labelParts = [];

  labelParts.push("<LabelSet>");
  recordXml = buildRecordXml(element, element.lots[0]);
  labelParts.push(recordXml);
  labelParts.push("</LabelSet>");

  let labelSetXml = labelParts.join("");

  return printLabels(labelConfig.dymo, labelConfig.lotLabelXml, labelSetXml);
}

function buildRecordXml(element, lot) {
  var totalLots = 10;
  var sequenceNumber = 100;

  return `<LabelRecord>
        <ObjectData Name="ELEMENT_ID">${element.id} (${sequenceNumber})</ObjectData>
        <ObjectData Name="ELEMENT_NAME">${element.name}</ObjectData>
        <ObjectData Name="ELEMENT_COLOR">${element.color}</ObjectData>
        <ObjectData Name="PSEUDO">${lot.pseudo} (${buyer.memberId})</ObjectData>
        <ObjectData Name="SEQUENCE">${lot.sequence}</ObjectData>
        <ObjectData Name="QUANTITY">${lot.quantity}</ObjectData>
        <ObjectData Name="TOTAL">${totalLots}</ObjectData>
    </LabelRecord>`;
}

function printLabels(dymo, labelXml, labelSetXml) {
  return dymo
    .print("DYMO LabelWriter 450", labelXml, labelSetXml)
    .then((result) => {
      true;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
}
