const { assert, expect } = require("chai");
const should = require("chai").should();
const path = require("path");
const { Club } = require("../src/club.js");

describe("club", function () {
  beforeEach(function () {
    const csv_file = path.resolve(path.join(__dirname, "fixtures/members.csv"));

    this.club = new Club();
    this.club.load(csv_file);
  });

  context("loading list of members", function () {
    it("should load members", function () {
      const members = this.club.members;
      members.should.have.lengthOf(3);
      member = members[0];
      member.should.have.property("id").and.equal("1");
      member.should.have.property("pseudo").and.equal("buyer1");
    });

    it("should load a map of members", function () {
      const membersMap = this.club.membersMap;
      membersMap.should.have.lengthOf(3);
      buyer = membersMap.get("buyer1");
      buyer.should.have.property("fullName").equal("First1 Last1");
    });
  });

  context("querying club", function () {
    it("should return a member for a given pseudo", function () {
      member = this.club.findMember("buyer1");
      member.should.not.be.null;
    });
  });
});
