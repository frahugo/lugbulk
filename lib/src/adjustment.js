var _ = require("lodash");

class Distribution {
  constructor(qty) {
    this.quantity = parseInt(qty);
    this.diff = 0;
  }
}

class Summary {
  constructor(quantity, distributions) {
    this.quantity = parseInt(quantity);
    this.adjustments = distributions
      .map((item) => {
        if (item.diff > 0) {
          return `+${item.diff}`;
        } else {
          return `${item.diff}`;
        }
      })
      .join(", ");
  }
}

class Adjustment {
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
    const ratio = discrepancy / this.totalQuantity;
    if (discrepancy > 0) {
      let remaining = this.distributions.reduce((remaining, item) => {
        let diff = Math.round(ratio * item.quantity);
        // console.log(diff, item.quantity, remaining);
        if (diff > remaining) {
          item.diff = remaining;
          return 0;
        } else {
          item.diff = diff;
          return remaining - diff;
        }
      }, discrepancy);
      if (remaining > 0) {
        for (let i = 0; i < remaining; i++) {
          this.distributions[i].diff += 1;
        }
      }
    } else {
      let remaining = this.distributions.reduce((remaining, item) => {
        let diff = Math.round(ratio * item.quantity);
        if (diff < remaining) {
          item.diff = remaining;
          return 0;
        } else {
          item.diff = diff;
          return remaining - diff;
        }
      }, discrepancy);
      if (remaining < 0) {
        for (let i = 0; i < remaining * -1; i++) {
          this.distributions[i].diff -= 1;
        }
      }
    }

    let groups = _.groupBy(this.distributions, "quantity");
    let summaries = new Array();
    for (var quantity in groups) {
      let summary = new Summary(quantity, groups[quantity]);
      summaries.push(summary);
    }
    this.summaries = summaries
      .sort((a, b) => {
        return a.quantity - b.quantity;
      })
      .reverse();
  }
}

module.exports = {
  Adjustment,
};
