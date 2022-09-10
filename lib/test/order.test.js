const { assert, expect } = require("chai");
const should = require("chai").should();
const path = require("path");
const { Order } = require("../src/order.js");

describe("order", function () {
  beforeEach(function () {
    const csv_file = path.resolve(path.join(__dirname, "fixtures/order.csv"));

    this.order = new Order();
    this.order.load(csv_file);
  });

  context("loading order", function () {
    it("should load lots", function () {
      const lots = this.order.lots;
      lots.should.have.lengthOf(7);
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
      element.should.have.property("totalQuantity").and.equal(100);

      element.lots.should.have.lengthOf(1);
      element.lots[0].should.have.property("pseudo").equal("buyer1");
      element.lots[0].should.have.property("quantity").equal(100);

      lastElement = elements[5];
      lastElement.should.have.property("sequenceNumber").and.equal(6);
    });

    it("should load buyers", function () {
      const buyers = this.order.buyers;
      buyers.should.have.lengthOf(2);
      buyer = buyers[0];
      buyer.should.have.property("pseudo").equal("buyer1");
      buyer.should.have.property("memberId").equal("1");
      buyer.should.have.property("firstName").and.equal("First1");
      buyer.lots.should.have.lengthOf(3);
      buyer.lots[0].should.have.property("elementId").equal("6330148");
      buyer.lots[0].should.have.property("quantity").equal(100);
      buyer.lots[0].should.have.property("sequence").equal("1 / 3");
    });

    it("should load a map of buyers", function () {
      const buyersMap = this.order.buyersMap;
      buyersMap.should.have.lengthOf(2);
      buyer = buyersMap.get("buyer1");
      buyer.should.have.property("firstName").equal("First1");
      buyer.should.have.property("lastName").equal("Last1");
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
