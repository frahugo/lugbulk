var _ = require("lodash");

class Distribution {
  constructor(qty) {
    this.quantity = parseInt(qty);
    this.diff = 0;
    this.quantityBeforeAdjustment = 0;
    this.quantityAfterAdjustment = 0;
    this.quantityToAddOrRemove = 0;
  }
}

class Summary {
  constructor(quantity, distributions) {
    this.quantity = parseInt(quantity);
    this.adjustments = distributions
      .map((item) => {
        if (item.quantityToAddOrRemove > 0) {
          return `+${item.quantityToAddOrRemove}`;
        } else {
          return `${item.quantityToAddOrRemove}`;
        }
      })
      .join(", ");
    this.newQuantities = [...new Set(distributions.map((item) => item.quantityAfterAdjustment))].join(", ");
  }
}

class Deficit {
  constructor(quantities) {
    this.quantities = quantities;
    this.distributions = quantities
      .map((qty) => {
        return new Distribution(qty);
      })
      .sort((a, b) => {
        return a.quantity - b.quantity;
      })
      .reverse();

    this.totalQuantity = this.distributions.reduce((acc, item) => {
      return acc + item.quantity;
    }, 0);

    this.summaries = [];
  }

  distribute(discrepancy) {
    this.distributions.sort((a, b) => a.quantity - b.quantity);

    const ratio = discrepancy / this.totalQuantity;

    // Largest remainder method: floor each exact share, then give extras to highest remainders
    const entries = this.distributions.map((item, idx) => {
      const exact = ratio * item.quantity;
      const floor = Math.floor(exact);
      return { item, idx, floor, remainder: exact - floor };
    });

    entries.forEach(({ item, floor }) => {
      item.diff = -floor;
    });

    const totalFloor = entries.reduce((acc, e) => acc + e.floor, 0);
    const extras = discrepancy - totalFloor;
    entries
      .slice()
      .sort((a, b) => b.remainder - a.remainder || b.idx - a.idx)
      .slice(0, extras)
      .forEach(({ item }) => { item.diff -= 1; });

    let available = this.totalQuantity - discrepancy;
    this.distributions.forEach((item) => {
      const filled = Math.min(item.quantity, Math.max(0, available));
      item.quantityBeforeAdjustment = filled;
      available -= filled;
    });

    this.distributions.forEach((item) => {
      item.quantityAfterAdjustment = item.quantity + item.diff;
      item.quantityToAddOrRemove = item.quantityAfterAdjustment - item.quantityBeforeAdjustment;
    });

    const grouped = _.groupBy(this.distributions, "quantity");
    const summaries = [];
    for (const quantity in grouped) {
      summaries.push(new Summary(quantity, grouped[quantity]));
    }
    this.summaries = summaries.sort((a, b) => a.quantity - b.quantity);
  }
}

module.exports = {
  Deficit,
};
