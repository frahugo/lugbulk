const { assert, expect } = require("chai");
const should = require("chai").should();
const path = require("path");
const { Adjustment } = require("../src/adjustment.js");

describe("adjustment", function () {
  beforeEach(function () {});

  context("parsing quantities", function () {
    it("should load quantities", function () {
      const quantities = ["1", "2"];
      const adjustment = new Adjustment(quantities);
      adjustment.quantities.should.have.lengthOf(2);
      adjustment.distributions.should.have.lengthOf(2);
      let first = adjustment.distributions[0];
      first.should.have.property("quantity").and.equal(2);
    });

    it("should calculate a total quantity", function () {
      const quantities = ["1", "2"];
      const adjustment = new Adjustment(quantities);
      adjustment.should.have.property("totalQuantity").and.equal(3);
    });
  });

  context("distributing discrepancy", function () {
    it("should distribute to one lot", function () {
      const quantities = ["100"];
      const adjustment = new Adjustment(quantities);
      adjustment.distribute(5);
      let distribution = adjustment.distributions[0];
      distribution.should.have.property("diff").and.equal(5);
    });

    it("should distribute to two lots", function () {
      const quantities = ["50", "100"];
      const adjustment = new Adjustment(quantities);
      adjustment.distribute(3);
      adjustment.distributions[0].should.have.property("diff").and.equal(2);
      adjustment.distributions[1].should.have.property("diff").and.equal(1);
    });

    it("should round until none remains", function () {
      const quantities = ["50", "100", "100"];
      const adjustment = new Adjustment(quantities);
      adjustment.distribute(4);
      adjustment.distributions[0].should.have.property("diff").and.equal(2);
      adjustment.distributions[1].should.have.property("diff").and.equal(2);
      adjustment.distributions[2].should.have.property("diff").and.equal(0);
    });

    it("should distribute remaining evenly", function () {
      const quantities = ["50", "50", "50"];
      const adjustment = new Adjustment(quantities);
      adjustment.distribute(1);
      adjustment.distributions[0].should.have.property("diff").and.equal(1);
      adjustment.distributions[1].should.have.property("diff").and.equal(0);
      adjustment.distributions[2].should.have.property("diff").and.equal(0);
    });

    it("should summarize diffs by positive quantity", function () {
      const quantities = ["50", "100", "100"];
      const adjustment = new Adjustment(quantities);
      adjustment.distribute(6);
      adjustment.distributions[0].should.have.property("diff").and.equal(3);
      adjustment.distributions[1].should.have.property("diff").and.equal(2);
      adjustment.distributions[2].should.have.property("diff").and.equal(1);
      adjustment.summaries[0].should.have.property("quantity").and.equal(100);
      adjustment.summaries[0].should.have.property("adjustments").and.equal("+3, +2");
      adjustment.summaries[1].should.have.property("quantity").and.equal(50);
      adjustment.summaries[1].should.have.property("adjustments").and.equal("+1");
    });

    it("should summarize diffs by negative quantity", function () {
      const quantities = ["50", "100", "100"];
      const adjustment = new Adjustment(quantities);
      adjustment.distribute(-6);
      adjustment.distributions[0].should.have.property("diff").and.equal(-3);
      adjustment.distributions[1].should.have.property("diff").and.equal(-2);
      adjustment.distributions[2].should.have.property("diff").and.equal(-1);
      adjustment.summaries[0].should.have.property("quantity").and.equal(100);
      adjustment.summaries[0].should.have.property("adjustments").and.equal("-3, -2");
      adjustment.summaries[1].should.have.property("quantity").and.equal(50);
      adjustment.summaries[1].should.have.property("adjustments").and.equal("-1");
    });

    it("should distribute in descending order of quantity", function () {
      const quantities = ["200", "50", "300", "100", "100", "200", "100"];
      const adjustment = new Adjustment(quantities);
      adjustment.distribute(110);
      adjustment.summaries[0].should.have.property("quantity").and.equal(300);
      adjustment.summaries[0].should.have.property("adjustments").and.equal("+32");
      adjustment.summaries[1].should.have.property("quantity").and.equal(200);
      adjustment.summaries[1].should.have.property("adjustments").and.equal("+22, +21");
      adjustment.summaries[2].should.have.property("quantity").and.equal(100);
      adjustment.summaries[2].should.have.property("adjustments").and.equal("+10, +10, +10");
      adjustment.summaries[3].should.have.property("quantity").and.equal(50);
      adjustment.summaries[3].should.have.property("adjustments").and.equal("+5");
    });

    it("should distribute in descending order of quantity", function () {
      const quantities = ["200", "50", "300", "100", "100", "200", "100"];
      const adjustment = new Adjustment(quantities);
      adjustment.distribute(-110);
      adjustment.summaries[0].should.have.property("quantity").and.equal(300);
      adjustment.summaries[0].should.have.property("adjustments").and.equal("-32");
      adjustment.summaries[1].should.have.property("quantity").and.equal(200);
      adjustment.summaries[1].should.have.property("adjustments").and.equal("-22, -21");
      adjustment.summaries[2].should.have.property("quantity").and.equal(100);
      adjustment.summaries[2].should.have.property("adjustments").and.equal("-10, -10, -10");
      adjustment.summaries[3].should.have.property("quantity").and.equal(50);
      adjustment.summaries[3].should.have.property("adjustments").and.equal("-5");
    });
  });
});
