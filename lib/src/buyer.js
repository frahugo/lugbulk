exports.Buyer = function (pseudo, fullName, lots, memberId, zone) {
  this.pseudo = pseudo;
  this.memberId = memberId;
  this.fullName = fullName;
  this.lots = lots;
  this.zone = zone;
  this.region = null;
  this.distribution_method = null;
  this.distributor_name = null;
};
