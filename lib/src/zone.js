const NUM_ZONES = 12;

exports.assignZones = function (buyers) {
  const denominator = Math.max(buyers.length, NUM_ZONES);
  buyers.forEach((buyer, i) => {
    buyer.zone = String.fromCharCode(65 + Math.floor((i * NUM_ZONES) / denominator));
  });
};
