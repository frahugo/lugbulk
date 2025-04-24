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

  let totalCount = order.elements
    .map((elem) => elem.lots.length)
    .reduce((acc, count) => acc + count);
  console.log("%d elements to print.", order.elements.length);
  console.log("%d labels to print.", totalCount);

  // Note: need recursion so the promises to work sequentially with the prompts.
  processElement(0, order, labelConfig, 0);
}

function processElement(index, order, labelConfig, runningCount) {
  if (index + 1 > order.elements.length) {
    return;
  }
  element = order.elements[index];
  count = element.lots.length;
  var answer = readlineSync.keyIn(
    `Print element ${element.id} - ${count} labels, ${runningCount} so far (y/n, [q]uit [r]eset [g]oto)? `,
    {
      limit: "$<ynqrg>",
    }
  );
  switch (answer) {
    case "y":
      printElementLots(element, order, labelConfig).then((result) => {
        console.log("%d lots printed.", element.lots.length);
        processElement(++index, order, labelConfig, runningCount + count);
      });
      break;
    case "n":
      processElement(++index, order, labelConfig, runningCount);
      break;
    case "r":
      processElement(index, order, labelConfig, 0);
      break;
    case "g":
      var elementId = readlineSync.question("Element ID: ");
      var elementIndex = order.elements.findIndex((element) => element.id == elementId);
      if (elementIndex == -1) {
        console.log("Element not found.");
        processElement(index, order, labelConfig, runningCount);
      } else {
        processElement(elementIndex, order, labelConfig, runningCount);
      }
      break;
    case "q":
      break;
  }
}

function printElementLots(element, order, labelConfig) {
  var firstLot = element.lots[0];
  var otherLots = element.lots.slice(1);

  if (otherLots.length > 0) {
    return printLots([firstLot], order, labelConfig.dymo, labelConfig.lotFirstLabelXml).then(
      (result) => {
        return printLots(otherLots, order, labelConfig.dymo, labelConfig.lotLabelXml);
      }
    );
  } else {
    return printLots([firstLot], order, labelConfig.dymo, labelConfig.lotFirstLabelXml);
  }
}

function printLots(lots, order, dymo, labelXml) {
  const labelParts = [];

  labelParts.push("<LabelSet>");
  for (var lot of lots) {
    recordXml = buildRecordXml(element, lot, order);
    labelParts.push(recordXml);
  }
  labelParts.push("</LabelSet>");

  let labelSetXml = labelParts.join("");

  return printLabels(dymo, labelXml, labelSetXml);
}

// 4211075

function buildRecordXml(element, lot, order) {
  var totalLots = pluralize("lot", element.lots.length, true);
  var buyer = order.findBuyer(lot.pseudo);
  var now = new Date();
  var year = now.getFullYear();

  return `<LabelRecord>
        <ObjectData Name="ELEMENT_ID">${element.id} (${sequenceNumber})</ObjectData>
        <ObjectData Name="ELEMENT_NAME">${element.name}</ObjectData>
        <ObjectData Name="ELEMENT_COLOR">${element.color}</ObjectData>
        <ObjectData Name="PSEUDO">${lot.pseudo}</ObjectData>
        <ObjectData Name="MEMBER_ID">${buyer.memberId}</ObjectData>
        <ObjectData Name="SEQUENCE">${lot.sequence}</ObjectData>
        <ObjectData Name="QUANTITY">${lot.quantity}</ObjectData>
        <ObjectData Name="TOTAL">${totalLots}</ObjectData>
        <ObjectData Name="YEAR">${year}</ObjectData>
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
