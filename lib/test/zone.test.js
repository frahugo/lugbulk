const should = require("chai").should();
const { assignZones } = require("../src/zone.js");

describe("zone", function () {
  context("with 13 buyers", function () {
    it("should cover all 12 zones from A to L", function () {
      const buyers = Array.from({ length: 13 }, (_, i) => ({ memberId: String(i + 1) }));
      assignZones(buyers);
      buyers.map((b) => b.zone).should.deep.equal([
        "A", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
      ]);
    });
  });
});
