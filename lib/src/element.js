exports.Element = function (id, name, color, lots, sequenceNumber) {
  this.sequenceNumber = sequenceNumber;
  this.id = id;
  this.name = name;
  this.color = color;
  this.lots = lots;
  this.totalQuantity = lots.reduce((total, lot) => total + lot.quantity, 0);
};
