exports.Lot = function (pseudo, elementId, quantity) {
  this.pseudo = pseudo;
  this.elementId = elementId;
  this.quantity = quantity;
  this.sequence = "";
  this.setSequence = function (sequence) {
    this.sequence = sequence;
  };
};
