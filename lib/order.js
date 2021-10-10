const fs = require("fs");
const Papa = require("papaparse");
const { Element } = require("./element.js");
const { Buyer } = require("./buyer.js");

exports.Order = function () {
  this.elements = [];
  this.buyers = [];
  this.load = function (fileName) {
    csv = fs.readFileSync(fileName, "utf8");
    results = Papa.parse(csv);
    this.elements = loadElements(results.data);
    this.buyers = loadBuyers(results.data);
  };
};

function loadElements(data) {
  const nbRows = data.length;
  const firstRow = 6;
  const elements = [];

  for (let row = firstRow; row < nbRows; row++) {
    const elementId = data[row][0];
    const name = data[row][2];
    const color = data[row][3];
    if (elementId.trim() != "") {
      element = new Element(elementId, name, color);
      elements.push(element);
    }
  }

  return elements;
}

function loadBuyers(data) {
  const nbCols = data[0].length;
  const firstCol = 14;
  const buyers = [];

  for (let col = firstCol; col < nbCols; col++) {
    if (data[0][col] != "") {
      const email = data[1][col];
      const firstName = data[2][col];
      const lastName = data[3][col];
      const pseudo = data[4][col];
      buyer = new Buyer(pseudo, firstName, lastName, email);
      buyers.push(buyer);
    }
  }

  return buyers;
}
