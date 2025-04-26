exports.Element = function (id, name, color, lots, sequenceNumber) {
  this.sequenceNumber = sequenceNumber;
  this.id = id;
  this.name = name;
  this.color = color;
  this.lots = [];
  this.totalQuantity = 0;
  this.extraQuantity = 0;
  this.extraPercentage = 0.0;

  this.totalQuantity = lots.reduce((total, lot) => total + lot.quantity, 0);

  let extraLot = lots.find((lot) => lot.pseudo == "extra");
  if (extraLot) {
    this.extraQuantity = extraLot.quantity;
    let percentage = (this.extraQuantity / this.totalQuantity) * 100;
    this.extraPercentage = Math.round(percentage * 100) / 100;
    this.lots = lots.filter((lot) => lot.pseudo != "extra");
  } else {
    this.lots = lots;
  }
};
