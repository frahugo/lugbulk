const fs = require("fs");
const Papa = require("papaparse");
const { Member } = require("./member.js");

exports.Club = function () {
  this.members = [];

  this.load = function (fileName) {
    csv = fs.readFileSync(fileName, "utf8");
    results = Papa.parse(csv);
    this.members = loadMembers(results.data);
    this.membersMap = mapMembers(this.members);
  };

  this.findMember = function (pseudo) {
    return this.membersMap.get(pseudo);
  };
};

function loadMembers(data) {
  const nbRows = data.length;
  const firstRow = 1;
  const nbCols = data[0].length;
  const firstCol = 2;
  const members = [];

  for (let row = firstRow; row < nbRows; row++) {
    const memberId = data[row][0];
    const firstName = data[row][2];
    const lastName = data[row][3];
    const pseudo = data[row][4];
    const city = data[row][5];
    const region = data[row][6];
    const email = data[row][7];

    member = new Member(memberId, firstName, lastName, pseudo, city, region, email);
    members.push(member);
  }

  return members;
}

function mapMembers(members) {
  const map = new Map();

  for (var member of members) {
    map.set(member.pseudo, member);
  }

  return map;
}
