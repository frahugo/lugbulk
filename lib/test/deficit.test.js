const { assert, expect } = require("chai");
const should = require("chai").should();
const path = require("path");
const { Deficit } = require("../src/deficit.js");

describe("deficit", function () {
  beforeEach(function () { });

  context("parsing quantities", function () {
    it("should load quantities", function () {
      const quantities = ["1", "2"];
      const deficit = new Deficit(quantities);
      deficit.quantities.should.have.lengthOf(2);
      deficit.distributions.should.have.lengthOf(2);
      let first = deficit.distributions[0];
      first.should.have.property("quantity").and.equal(2);
    });

    it("should calculate a total quantity", function () {
      const quantities = ["1", "2"];
      const deficit = new Deficit(quantities);
      deficit.should.have.property("totalQuantity").and.equal(3);
    });
  });

  context("distributing discrepancy", function () {
    it("should distribute to one lot", function () {
      const quantities = ["100"];
      const deficit = new Deficit(quantities);
      deficit.distribute(5);
      let distribution = deficit.distributions[0];
      distribution.should.have.property("diff").and.equal(-5);
      distribution.should.have.property("quantityAfterAdjustment").and.equal(95);
      distribution.should.have.property("quantityToAddOrRemove").and.equal(0);
    });

    it("should distribute to two lots", function () {
      const quantities = ["50", "100"];
      const deficit = new Deficit(quantities);
      deficit.distribute(3);
      deficit.distributions[0].should.have.property("quantity").and.equal(50);
      deficit.distributions[0].should.have.property("diff").and.equal(-1);
      deficit.distributions[0].should.have.property("quantityAfterAdjustment").and.equal(49);
      deficit.distributions[0].should.have.property("quantityToAddOrRemove").and.equal(-1);
      deficit.distributions[1].should.have.property("quantity").and.equal(100);
      deficit.distributions[1].should.have.property("diff").and.equal(-2);
      deficit.distributions[1].should.have.property("quantityAfterAdjustment").and.equal(98);
      deficit.distributions[1].should.have.property("quantityToAddOrRemove").and.equal(1);
    });

    it("should round until none remains", function () {
      const quantities = ["50", "100", "100"];
      const deficit = new Deficit(quantities);
      deficit.distribute(4);
      deficit.distributions[0].should.have.property("quantity").and.equal(50);
      deficit.distributions[0].should.have.property("diff").and.equal(-1);
      deficit.distributions[0].should.have.property("quantityAfterAdjustment").and.equal(49);
      deficit.distributions[0].should.have.property("quantityToAddOrRemove").and.equal(-1);
      deficit.distributions[1].should.have.property("quantity").and.equal(100);
      deficit.distributions[1].should.have.property("diff").and.equal(-1);
      deficit.distributions[1].should.have.property("quantityAfterAdjustment").and.equal(99);
      deficit.distributions[1].should.have.property("quantityToAddOrRemove").and.equal(-1);
      deficit.distributions[2].should.have.property("quantity").and.equal(100);
      deficit.distributions[2].should.have.property("diff").and.equal(-2);
      deficit.distributions[2].should.have.property("quantityAfterAdjustment").and.equal(98);
      deficit.distributions[2].should.have.property("quantityToAddOrRemove").and.equal(2);
    });

    it("should distribute remaining evenly", function () {
      const quantities = ["50", "50", "50"];
      const deficit = new Deficit(quantities);
      deficit.distribute(1);
      deficit.distributions[0].should.have.property("quantity").and.equal(50);
      deficit.distributions[0].should.have.property("diff").and.equal(0);
      deficit.distributions[0].should.have.property("quantityAfterAdjustment").and.equal(50);
      deficit.distributions[0].should.have.property("quantityToAddOrRemove").and.equal(0);
      deficit.distributions[1].should.have.property("quantity").and.equal(50);
      deficit.distributions[1].should.have.property("diff").and.equal(0);
      deficit.distributions[1].should.have.property("quantityAfterAdjustment").and.equal(50);
      deficit.distributions[1].should.have.property("quantityToAddOrRemove").and.equal(0);
      deficit.distributions[2].should.have.property("quantity").and.equal(50);
      deficit.distributions[2].should.have.property("diff").and.equal(-1);
      deficit.distributions[2].should.have.property("quantityAfterAdjustment").and.equal(49);
      deficit.distributions[2].should.have.property("quantityToAddOrRemove").and.equal(0);
    });

    it("should handle discrepancy greater than last bag", function () {
      const quantities = ["100", "100", "100"];
      const deficit = new Deficit(quantities);
      deficit.distribute(120);
      deficit.distributions[0].should.have.property("quantity").and.equal(100);
      deficit.distributions[0].should.have.property("diff").and.equal(-40);
      deficit.distributions[0].should.have.property("quantityAfterAdjustment").and.equal(60);
      deficit.distributions[0].should.have.property("quantityToAddOrRemove").and.equal(-40);
      deficit.distributions[1].should.have.property("quantity").and.equal(100);
      deficit.distributions[1].should.have.property("diff").and.equal(-40);
      deficit.distributions[1].should.have.property("quantityAfterAdjustment").and.equal(60);
      deficit.distributions[1].should.have.property("quantityToAddOrRemove").and.equal(-20);
      deficit.distributions[2].should.have.property("quantity").and.equal(100);
      deficit.distributions[2].should.have.property("diff").and.equal(-40);
      deficit.distributions[2].should.have.property("quantityAfterAdjustment").and.equal(60);
      deficit.distributions[2].should.have.property("quantityToAddOrRemove").and.equal(60);
    });

    it("should handle discrepancy greater than last bags", function () {
      const quantities = ["100", "200", "300"];
      const deficit = new Deficit(quantities);
      deficit.distribute(540);
      deficit.distributions[0].should.have.property("quantity").and.equal(100);
      deficit.distributions[0].should.have.property("diff").and.equal(-90);
      deficit.distributions[0].should.have.property("quantityAfterAdjustment").and.equal(10);
      deficit.distributions[0].should.have.property("quantityToAddOrRemove").and.equal(-50);
      deficit.distributions[1].should.have.property("quantity").and.equal(200);
      deficit.distributions[1].should.have.property("diff").and.equal(-180);
      deficit.distributions[1].should.have.property("quantityAfterAdjustment").and.equal(20);
      deficit.distributions[1].should.have.property("quantityToAddOrRemove").and.equal(20);
      deficit.distributions[2].should.have.property("quantity").and.equal(300);
      deficit.distributions[2].should.have.property("diff").and.equal(-270);
      deficit.distributions[2].should.have.property("quantityAfterAdjustment").and.equal(30);
      deficit.distributions[2].should.have.property("quantityToAddOrRemove").and.equal(30);
    });

    it("should summarize diffs quantity", function () {
      const quantities = ["50", "100", "100"];
      const deficit = new Deficit(quantities);
      deficit.distribute(6);
      deficit.summaries[0].should.have.property("quantity").and.equal(50);
      deficit.summaries[0].should.have.property("adjustments").and.equal("-1");
      deficit.summaries[0].should.have.property("newQuantities").and.equal("49");
      deficit.summaries[1].should.have.property("quantity").and.equal(100);
      deficit.summaries[1].should.have.property("adjustments").and.equal("-2, +3");
      deficit.summaries[1].should.have.property("newQuantities").and.equal("98, 97");
    });

    it("should distribute in ascending order of quantity", function () {
      const quantities = ["200", "50", "300", "100", "100", "200", "100"];
      const deficit = new Deficit(quantities);
      deficit.distribute(110);
      deficit.summaries[0].should.have.property("quantity").and.equal(50);
      deficit.summaries[0].should.have.property("adjustments").and.equal("-5");
      deficit.summaries[0].should.have.property("newQuantities").and.equal("45");
      deficit.summaries[1].should.have.property("quantity").and.equal(100);
      deficit.summaries[1].should.have.property("adjustments").and.equal("-10, -11, -11");
      deficit.summaries[1].should.have.property("newQuantities").and.equal("90, 89");
      deficit.summaries[2].should.have.property("quantity").and.equal(200);
      deficit.summaries[2].should.have.property("adjustments").and.equal("-21, -21");
      deficit.summaries[2].should.have.property("newQuantities").and.equal("179");
      deficit.summaries[3].should.have.property("quantity").and.equal(300);
      deficit.summaries[3].should.have.property("adjustments").and.equal("+79");
      deficit.summaries[3].should.have.property("newQuantities").and.equal("269");
    });

    it("should distribute over 2 empty bags", function () {
      const quantities = ["100", "200", "300"];
      const deficit = new Deficit(quantities);
      deficit.distribute(540);
      deficit.summaries[0].should.have.property("quantity").and.equal(100);
      deficit.summaries[0].should.have.property("adjustments").and.equal("-50");
      deficit.summaries[0].should.have.property("newQuantities").and.equal("10");
      deficit.summaries[1].should.have.property("quantity").and.equal(200);
      deficit.summaries[1].should.have.property("adjustments").and.equal("+20");
      deficit.summaries[1].should.have.property("newQuantities").and.equal("20");
      deficit.summaries[2].should.have.property("quantity").and.equal(300);
      deficit.summaries[2].should.have.property("adjustments").and.equal("+30");
      deficit.summaries[2].should.have.property("newQuantities").and.equal("30");
    });
  });
});
