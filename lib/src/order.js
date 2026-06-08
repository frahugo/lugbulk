const fs = require("fs");
const https = require("https");
const http = require("http");
const path = require("path");
const Papa = require("papaparse");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const { Element } = require("./element.js");
const { Buyer } = require("./buyer.js");
const { Lot } = require("./lot.js");
const { assignZones } = require("./zone.js");

exports.Order = function () {
  this.elements = [];
  this.buyers = [];
  this.buyersMap = new Map();
  this.lots = [];
  this.hasExtras = false;

  this.load = async function (fileName) {
    csv = fs.readFileSync(fileName, "utf8");
    results = Papa.parse(csv);

    this.lots = loadLots(results.data);
    this.elements = loadElements(results.data, this.lots);
    this.buyers = await loadBuyers(results.data, this.lots);
    this.buyersMap = mapBuyers(this.buyers);
    handleExtras(this);
    assignZones(this.buyers);
    assignSequences(this.buyers);
    verifyQuantities(this.elements);
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

function handleExtras(order) {
  let extraMember = order.findBuyer("extra");
  if (extraMember) {
    order.hasExtras = true;
    order.buyersMap.delete("extra");
    order.buyers = order.buyers.filter(function (buyer) {
      return buyer.pseudo != "extra";
    });
    order.lots = order.lots.filter(function (lot) {
      return lot.pseudo != "extra";
    });
  }
}

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
    const orderedQuantity = parseInt(data[row][5]);
    if (elementId.trim() != "") {
      elementLots = lots
        .filter(function (lot) {
          return lot.elementId == elementId;
        })
        .sort((a, b) => {
          return a.quantity - b.quantity;
        });
      element = new Element(elementId, name, color, elementLots, sequenceNumber, orderedQuantity);
      elements.push(element);
    }
  }

  return elements;
}

async function loadBuyers(data, lots) {
  const nbCols = data[0].length;
  const firstCol = 14;
  const buyers = [];

  for (let col = firstCol; col < nbCols; col++) {
    const memberId = data[0][col];
    const fullName = data[3][col];
    const pseudo = data[4][col];
    const buyerTag = data[5][col];

    if (buyerTag.trim().includes("Acheteur")) {
      buyerLots = lots.filter(function (lot) {
        return lot.pseudo == pseudo;
      });

      if (buyerLots.length > 0) {
        buyer = new Buyer(pseudo, fullName, buyerLots, memberId);
        buyers.push(buyer);
      }
    }
  }

  buyers.sort((a, b) => parseInt(a.memberId) - parseInt(b.memberId));

  const url = process.env.BUYERS_CSV_URL;
  if (url) {
    const enrichments = await fetchBuyerEnrichments(url);
    for (const buyer of buyers) {
      const data = enrichments.get(buyer.fullName.trim());
      if (data) {
        buyer.region = data.region;
        buyer.distribution_method = data.distribution_method;
        buyer.distributor_name = data.distributor_name;
      }
    }
  }

  return buyers;
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    lib
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return httpGet(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          res.resume();
          return;
        }
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => resolve(data));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

async function fetchBuyerEnrichments(url) {
  let csv;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    csv = await httpGet(url);
  } else {
    csv = fs.readFileSync(url, "utf8");
  }
  return parseBuyerEnrichments(csv);
}

function parseBuyerEnrichments(csvText) {
  const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const map = new Map();

  for (const row of result.data) {
    const normalized = {};
    for (const [key, value] of Object.entries(row)) {
      normalized[key.trim().toLowerCase().replace(/\s+/g, "_")] = value;
    }
    const fullName =
      normalized["nom"] ||
      normalized["full_name"] ||
      normalized["fullname"] ||
      normalized["nom_complet"] ||
      normalized["name"];
    if (fullName) {
      map.set(fullName.trim(), {
        region: normalized["region"] || null,
        distribution_method: normalized["choix"] || normalized["distribution_method"] || null,
        distributor_name: normalized["transporteur"] || normalized["distributor_name"] || null,
      });
    }
  }

  return map;
}

exports.parseBuyerEnrichments = parseBuyerEnrichments;


function mapBuyers(buyers) {
  const map = new Map();

  for (var buyer of buyers) {
    map.set(buyer.pseudo, buyer);
  }

  return map;
}

function verifyQuantities(elements) {
  for (const element of elements) {
    if (element.orderedQuantity !== element.totalQuantity) {
      console.warn(
        `Quantity mismatch for element ${element.id} (${element.name}): ordered=${element.orderedQuantity}, total=${element.totalQuantity}`
      );
    }
  }
}

function assignSequences(buyers) {
  // Assign the sequence number to elements of a megalot (buyer).
  // This way, a runner looks at the sequence number on the label and checks off the
  // related line on the megalot page.
  for (var buyer of buyers) {
    const nbLots = buyer.lots.length;
    for (const [index, lot] of buyer.lots.entries()) {
      const sequence = `${index + 1}`;
      lot.setSequence(sequence);
    }
  }
}
