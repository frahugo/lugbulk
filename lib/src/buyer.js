exports.Buyer = function (pseudo, firstName, lastName, email, lots, memberId) {
  this.pseudo = pseudo;
  this.memberId = memberId;
  this.firstName = firstName;
  this.lastName = lastName;
  this.email = email;
  this.lots = lots;
};
