const fs = require("fs");
const Papa = require("papaparse");
const { Element } = require("./element.js");
const { Buyer } = require("./buyer.js");
const { Lot } = require("./lot.js");

exports.Missings = function () {
  this.elementIds = [];

  this.load = function (fileName) {
    csv = fs.readFileSync(fileName, "utf8");
    results = Papa.parse(csv);

    this.elementIds = loadElementIds(results.data);
  };
};

function loadElementIds(data, lots) {
  const nbRows = data.length;
  const elementIds = [];

  for (let row = 0; row < nbRows; row++) {
    const elementId = data[row][0];
    if (elementId.trim() != "") {
      elementIds.push(elementId);
    }
  }

  return elementIds;
}
