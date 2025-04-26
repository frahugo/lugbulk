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
  const members = [];

  for (let row = firstRow; row < nbRows; row++) {
    const memberId = data[row][0];
    const fullName = data[row][1];
    const pseudo = data[row][2];
    const email = data[row][3];

    if (memberId.trim() != "") {
      member = new Member(memberId, fullName, pseudo, email);
      members.push(member);
    }
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
