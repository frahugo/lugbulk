const { assert, expect } = require("chai");
const should = require("chai").should();
const path = require("path");
const { Missings } = require("../src/missings.js");

describe("missings", function () {
  beforeEach(function () {
    const csv_file = path.resolve(path.join(__dirname, "fixtures/missings.csv"));

    this.missings = new Missings();
    this.missings.load(csv_file);
  });

  context("loading missings", function () {
    it("should load element ids", function () {
      const elementIds = this.missings.elementIds;
      elementIds.should.have.lengthOf(4);
      elementId = elementIds[0];
      elementId.should.equal("6330148");
    });
  });
});
