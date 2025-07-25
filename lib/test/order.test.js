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
