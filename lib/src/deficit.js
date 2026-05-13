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

    const n = this.distributions.length;
    const ratio = discrepancy / this.totalQuantity;

    let remaining = this.distributions.reduce((remaining, item) => {
      let diff = -Math.round(ratio * item.quantity);
      if (diff < remaining) {
        item.diff = remaining;
        return 0;
      } else {
        item.diff = diff;
        return remaining - diff;
      }
    }, -discrepancy);
    if (remaining < 0) {
      for (let i = 0; i < -remaining; i++) {
        this.distributions[n - 1 - i].diff -= 1;
      }
    }

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
