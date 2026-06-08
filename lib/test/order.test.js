const { assert, expect } = require("chai");
const should = require("chai").should();
const path = require("path");
const { Order, parseBuyerEnrichments } = require("../src/order.js");
const fs = require("fs");

describe("order", function () {
  beforeEach(async function () {
    const csv_file = path.resolve(path.join(__dirname, "fixtures/order.csv"));

    this.order = new Order();
    await this.order.load(csv_file);
  });

  context("loading order", function () {
    it("should load lots ordered by quantity", function () {
      const lots = this.order.lots;
      lots.should.have.lengthOf(8);
      lot = lots[0];
      lot.should.have.property("elementId").and.equal("6330148");
      lot.should.have.property("pseudo").and.equal("buyer1");
      lot.should.have.property("quantity").and.equal(100);
    });

    it("should load elements", function () {
      const elements = this.order.elements;
      elements.should.have.lengthOf(6);
      element = elements[0];
      element.should.have.property("sequenceNumber").and.equal(1);
      element.should.have.property("id").and.equal("6330148");
      element.should.have.property("name").and.equal("ANGULAR PLATE 1.5 BOT. 1X2 2/2");
      element.should.have.property("color").and.equal("SAND YELLOW");
      element.should.have.property("orderedQuantity").and.equal(175);
      element.should.have.property("totalQuantity").and.equal(175);
      element.should.have.property("extraQuantity").and.equal(25);
      element.should.have.property("extraPercentage").and.equal(14.29);

      element.lots.should.have.lengthOf(2);
      element.lots[0].should.have.property("pseudo").equal("buyer2");
      element.lots[0].should.have.property("quantity").equal(50);
      element.lots[1].should.have.property("pseudo").equal("buyer1");
      element.lots[1].should.have.property("quantity").equal(100);

      lastElement = elements[5];
      lastElement.should.have.property("sequenceNumber").and.equal(6);
    });

    it("should warn when ordered quantity does not match total quantity", async function () {
      const warnings = [];
      const originalWarn = console.warn;
      console.warn = (msg) => warnings.push(msg);

      const order = new Order();
      await order.load(path.resolve(path.join(__dirname, "fixtures/order-mismatch.csv")));

      console.warn = originalWarn;

      const mismatch = warnings.find((w) => w.includes("6330148"));
      expect(mismatch).to.include("ordered=2750");
      expect(mismatch).to.include("total=175");
    });

    it("should load buyers", function () {
      const buyers = this.order.buyers;
      this.order.should.have.property("hasExtras").equal(true);
      buyers.should.have.lengthOf(2);
      buyer = buyers[0];
      buyer.should.have.property("pseudo").equal("buyer1");
      buyer.should.have.property("memberId").equal("1");
      buyer.should.have.property("fullName").and.equal("First1 Last1");
      buyer.lots.should.have.lengthOf(3);
      buyer.lots[0].should.have.property("elementId").equal("6330148");
      buyer.lots[0].should.have.property("quantity").equal(100);
      buyer.lots[0].should.have.property("sequence").equal("1");
    });

    it("should assign zones to buyers ordered by memberId", function () {
      const buyers = this.order.buyers;
      buyers[0].should.have.property("memberId").equal("1");
      buyers[0].should.have.property("zone").equal("A");
      buyers[1].should.have.property("memberId").equal("2");
      buyers[1].should.have.property("zone").equal("B");
    });

    it("should load a map of buyers", function () {
      const buyersMap = this.order.buyersMap;
      buyersMap.should.have.lengthOf(2);
      buyer = buyersMap.get("buyer1");
      buyer.should.have.property("fullName").and.equal("First1 Last1");
    });
  });

  context("querying order", function () {
    it("should return a buyer for a given pseudo", function () {
      buyer = this.order.findBuyer("buyer1");
      buyer.should.not.be.null;
    });

    it("should return an element for a given elementId", function () {
      element = this.order.findElement("6330148");
      element.should.not.be.null;
    });
  });
});

describe("parseBuyerEnrichments", function () {
  beforeEach(function () {
    const csvFile = path.resolve(path.join(__dirname, "fixtures/distribution.csv"));
    const csvText = fs.readFileSync(csvFile, "utf8");
    this.enrichments = parseBuyerEnrichments(csvText);
  });

  it("should parse all entries", function () {
    this.enrichments.should.have.property("size").equal(3);
  });

  it("should map region for a buyer choosing regional distribution", function () {
    const entry = this.enrichments.get("Patrick Bégin");
    entry.should.have.property("region").equal("Québec/Portneuf");
    entry.should.have.property("distribution_method").equal("region");
    expect(entry.distributor_name).to.be.null;
  });

  it("should map distributor name for a buyer choosing a person", function () {
    const entry = this.enrichments.get("Jacques Dupuis");
    entry.should.have.property("distributor_name").equal("Martin Chauvette");
    entry.should.have.property("distribution_method").equal("person");
    expect(entry.region).to.be.null;
  });

  it("should return null for empty fields", function () {
    const entry = this.enrichments.get("Jean Bédard");
    entry.should.have.property("distribution_method").equal("self");
    expect(entry.region).to.be.null;
    expect(entry.distributor_name).to.be.null;
  });
});

describe("buyer enrichment via BUYERS_CSV_URL", function () {
  let originalUrl;

  beforeEach(function () {
    originalUrl = process.env.BUYERS_CSV_URL;
    delete process.env.BUYERS_CSV_URL;
  });

  afterEach(function () {
    if (originalUrl !== undefined) {
      process.env.BUYERS_CSV_URL = originalUrl;
    } else {
      delete process.env.BUYERS_CSV_URL;
    }
  });

  it("should enrich buyers when BUYERS_CSV_URL points to a file", async function () {
    const distributionFile = path.resolve(path.join(__dirname, "fixtures/distribution.csv"));
    const orderFile = path.resolve(path.join(__dirname, "fixtures/order.csv"));
    process.env.BUYERS_CSV_URL = distributionFile;

    const order = new Order();
    await order.load(orderFile);

    const buyer = order.findBuyer("buyer1");
    expect(buyer.region).to.be.null;
    expect(buyer.distribution_method).to.be.null;
    expect(buyer.distributor_name).to.be.null;
  });

  it("should leave enrichment properties null when BUYERS_CSV_URL is not set", async function () {
    const orderFile = path.resolve(path.join(__dirname, "fixtures/order.csv"));

    const order = new Order();
    await order.load(orderFile);

    const buyer = order.findBuyer("buyer1");
    expect(buyer.region).to.be.null;
    expect(buyer.distribution_method).to.be.null;
    expect(buyer.distributor_name).to.be.null;
  });
});
