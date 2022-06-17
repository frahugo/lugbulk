const fs = require("fs");
const path = require("path");
const Dymo = require("dymojs");
const readlineSync = require("readline-sync");
const pluralize = require("pluralize");

const { Element } = require("lugbulk-lib/src/element");
const { Order } = require("lugbulk-lib/src/order");

exports.command = "elements <order_csv_file>";
exports.desc = "Print elements from a LugBulk order";
exports.builder = {};
exports.handler = function (argv) {
  const order = new Order();
  order.load(argv.order_csv_file);
  print(order);
};

async function print(order) {
  const lotFirstLabelFile = path.resolve(
    path.join(__dirname, "../../../resources/lot-first.label")
  );
  const lotLabelFile = path.resolve(path.join(__dirname, "../../../resources/lot.label"));

  const labelConfig = {
    dymo: new Dymo(),
    lotFirstLabelXml: fs.readFileSync(lotFirstLabelFile, "utf8"),
    lotLabelXml: fs.readFileSync(lotLabelFile, "utf8"),
  };

  console.log("%d elements to print.", order.elements.length);

  // Note: need recursion so the promises to work sequentially with the prompts.
  processElement(0, order.elements, labelConfig);
}

function processElement(index, elements, labelConfig) {
  if (index + 1 > elements.length) {
    return;
  }
  element = elements[index];
  count = element.lots.length;
  var answer = readlineSync.keyIn(`Print element ${element.id} - ${count} labels (y/n/q)? `, {
    limit: "$<ynq>",
  });
  switch (answer) {
    case "y":
      printElementLots(element, labelConfig).then((result) => {
        console.log("%d lots printed.", element.lots.length);
        processElement(++index, elements, labelConfig);
      });
      break;
    case "n":
      processElement(++index, elements, labelConfig);
      break;
    case "q":
      break;
  }
}

function printElementLots(element, labelConfig) {
  var firstLot = element.lots[0];
  var otherLots = element.lots.slice(1);

  return printLots([firstLot], labelConfig.dymo, labelConfig.lotFirstLabelXml).then((result) => {
    return printLots(otherLots, labelConfig.dymo, labelConfig.lotLabelXml);
  });
}

function printLots(lots, dymo, labelXml) {
  const labelParts = [];

  labelParts.push("<LabelSet>");
  for (var lot of lots) {
    recordXml = buildRecordXml(element, lot);
    labelParts.push(recordXml);
  }
  labelParts.push("</LabelSet>");

  let labelSetXml = labelParts.join("");
  console.log(labelXml);

  return printLabels(dymo, labelXml, labelSetXml);
}

function buildRecordXml(element, lot) {
  var totalLots = pluralize("lot", element.lots.length, true);

  return `<LabelRecord>
        <ObjectData Name="ELEMENT_ID">${element.id}</ObjectData>
        <ObjectData Name="ELEMENT_NAME">${element.name}</ObjectData>
        <ObjectData Name="ELEMENT_COLOR">${element.color}</ObjectData>
        <ObjectData Name="PSEUDO">${lot.pseudo}</ObjectData>
        <ObjectData Name="SEQUENCE">${lot.sequence}</ObjectData>
        <ObjectData Name="QUANTITY">${lot.quantity}</ObjectData>
        <ObjectData Name="TOTAL">${totalLots}</ObjectData>
    </LabelRecord>`;
}

function printLabels(dymo, labelXml, labelSetXml) {
  return (
    dymo
      // .print("DYMO LabelWriter 450 rPi @ pi-top", labelXml, labelSetXml)
      .print("DYMO LabelWriter 450", labelXml, labelSetXml)
      .then((result) => {
        true;
      })
      .catch((err) => {
        console.log(err);
        throw err;
      })
  );
}
