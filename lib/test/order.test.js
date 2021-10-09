const { assert, expect } = require("chai");
const should = require("chai").should();
const path = require("path");
const { Order } = require("../order.js");

describe("order", function () {
  beforeEach(function () {
    const csv_file = path.resolve(path.join(__dirname, "fixtures/order.csv"));

    this.order = new Order();
    this.order.load(csv_file);
  });

  context("loading elements", function () {
    it("should load elements", function () {
      const elements = this.order.elements;
      elements.should.have.lengthOf(6);
      element = elements[0];
      element.should.have.property("id").and.equal("6330148");
      element.should.have.property("name").and.equal("ANGULAR PLATE 1.5 BOT. 1X2 2/2");
      element.should.have.property("color").and.equal("SAND YELLOW");
    });

    it("should load buyers", function () {
      const buyers = this.order.buyers;
      buyers.should.have.lengthOf(2);
      buyer = buyers[0];
      buyer.should.have.property("firstName").and.equal("First1");
    });
  });
});
