const fs = require("fs");
const path = require("path");
const Dymo = require("dymojs");

const { Element } = require("lugbulk-lib/src/element");
const { Order } = require("lugbulk-lib/src/order");

exports.command = "test";
exports.desc = "Print a test from a LugBulk order";
exports.builder = {};
exports.handler = function (argv) {
  const order = new Order();
  order.load(argv.input);
  print(order);
};

async function print(order) {
  const elementLabelFile = path.resolve(path.join(__dirname, "../../../resources/element.label"));
  const lotLabelFile = path.resolve(path.join(__dirname, "../../../resources/lot.label"));

  const labelConfig = {
    dymo: new Dymo(),
    elementLabelXml: fs.readFileSync(elementLabelFile, "utf8"),
    lotLabelXml: fs.readFileSync(lotLabelFile, "utf8"),
  };

  element = order.elements[0];

  printElement(element, labelConfig).then((result) => {
    printLot(element, labelConfig).then((result) => {
      console.log("2 labels should have been printed.");
    });
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
  return `<LabelRecord>
        <ObjectData Name="ELEMENT_ID">${element.id}</ObjectData>
        <ObjectData Name="ELEMENT_NAME">${element.name}</ObjectData>
        <ObjectData Name="ELEMENT_COLOR">${element.color}</ObjectData>
        <ObjectData Name="PSEUDO">${lot.pseudo}</ObjectData>
        <ObjectData Name="SEQUENCE">${lot.sequence}</ObjectData>
        <ObjectData Name="QUANTITY">${lot.quantity}</ObjectData>
        <ObjectData Name="TOTAL">1 lot</ObjectData>
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
