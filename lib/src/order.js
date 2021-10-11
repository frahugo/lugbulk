const fs = require("fs");
const Papa = require("papaparse");
const { Element } = require("./element.js");
const { Buyer } = require("./buyer.js");
const { Lot } = require("./lot.js");

exports.Order = function () {
  this.elements = [];
  this.buyers = [];
  this.lots = [];

  this.load = function (fileName) {
    csv = fs.readFileSync(fileName, "utf8");
    results = Papa.parse(csv);
    this.lots = loadLots(results.data);
    this.elements = loadElements(results.data, this.lots);
    this.buyers = loadBuyers(results.data, this.lots);
    assignSequences(this.buyers);
  };

  this.findBuyer = function (pseudo) {
    return this.buyers.find(function (buyer) {
      return buyer.pseudo == pseudo;
    });
  };

  this.findElement = function (elementId) {
    return this.elements.find(function (element) {
      return element.id == elementId;
    });
  };
};

function loadLots(data) {
  const nbRows = data.length;
  const firstRow = 6;
  const nbCols = data[0].length;
  const firstCol = 14;
  const lots = [];

  for (let row = firstRow; row < nbRows; row++) {
    const elementId = data[row][0];
    if (elementId.trim() != "") {
      for (let col = firstCol; col < nbCols; col++) {
        const pseudo = data[4][col];
        const quantity = parseInt(data[row][col]);
        if (pseudo != "" && quantity > 0) {
          lot = new Lot(pseudo, elementId, quantity);
          lots.push(lot);
        }
      }
    }
  }

  return lots;
}

function loadElements(data, lots) {
  const nbRows = data.length;
  const firstRow = 6;
  const elements = [];

  for (let row = firstRow; row < nbRows; row++) {
    const elementId = data[row][0];
    const name = data[row][2];
    const color = data[row][3];
    if (elementId.trim() != "") {
      elementLots = lots.filter(function (lot) {
        return lot.elementId == elementId;
      });
      element = new Element(elementId, name, color, elementLots);
      elements.push(element);
    }
  }

  return elements;
}

function loadBuyers(data, lots) {
  const nbCols = data[0].length;
  const firstCol = 14;
  const buyers = [];

  for (let col = firstCol; col < nbCols; col++) {
    if (data[0][col] != "") {
      const email = data[1][col];
      const firstName = data[2][col];
      const lastName = data[3][col];
      const pseudo = data[4][col];

      buyerLots = lots.filter(function (lot) {
        return lot.pseudo == pseudo;
      });

      buyer = new Buyer(pseudo, firstName, lastName, email, buyerLots);
      buyers.push(buyer);
    }
  }

  return buyers;
}

function assignSequences(buyers) {
  for (var buyer of buyers) {
    const nbLots = buyer.lots.length;
    for (const [index, lot] of buyer.lots.entries()) {
      const sequence = `${index + 1} / ${nbLots}`;
      lot.setSequence(sequence);
    }
  }
}
