const fs = require("fs");
const Papa = require("papaparse");
const { Element } = require("./element.js");
const { Buyer } = require("./buyer.js");
const { Lot } = require("./lot.js");

exports.Order = function () {
  this.elements = [];
  this.buyers = [];
  this.buyersMap = new Map();
  this.lots = [];

  this.load = function (fileName) {
    csv = fs.readFileSync(fileName, "utf8");
    results = Papa.parse(csv);
    this.lots = loadLots(results.data);
    this.elements = loadElements(results.data, this.lots);
    this.buyers = loadBuyers(results.data, this.lots);
    this.buyersMap = mapBuyers(this.buyers);
    assignSequences(this.buyers);
  };

  this.findBuyer = function (pseudo) {
    return this.buyersMap.get(pseudo);
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
    const sequenceNumber = row - firstRow + 1;
    const elementId = data[row][0];
    const name = data[row][2];
    const color = data[row][3];
    if (elementId.trim() != "") {
      elementLots = lots
        .filter(function (lot) {
          return lot.elementId == elementId;
        })
        .sort((a, b) => {
          return a.quantity - b.quantity;
        });
      element = new Element(elementId, name, color, elementLots, sequenceNumber);
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
    const memberId = data[0][col];
    const email = data[1][col];
    const firstName = data[2][col];
    const lastName = data[3][col];
    const pseudo = data[4][col];
    const buyerTag = data[5][col];

    if (buyerTag.trim().includes("Acheteur")) {
      buyerLots = lots.filter(function (lot) {
        return lot.pseudo == pseudo;
      });

      if (buyerLots.length > 0) {
        buyer = new Buyer(pseudo, firstName, lastName, email, buyerLots, memberId);
        buyers.push(buyer);
      }
    }
  }

  return buyers;
}

function mapBuyers(buyers) {
  const map = new Map();

  for (var buyer of buyers) {
    map.set(buyer.pseudo, buyer);
  }

  return map;
}

function assignSequences(buyers) {
  // Assign the sequence number to elements of a megalot (buyer).
  // This way, a runner looks at the sequence number on the label and checks off the
  // related line on the megalot page.
  for (var buyer of buyers) {
    const nbLots = buyer.lots.length;
    for (const [index, lot] of buyer.lots.entries()) {
      const sequence = `lot #${index + 1}`;
      lot.setSequence(sequence);
    }
  }
}
