const yargs = require("yargs");

module.exports = () => {
  require("yargs/yargs")(process.argv.slice(2))
    .option("i", {
      alias: "input",
      describe: "LugBluk order CSV file",
      type: "string",
      demandOption: true,
    })
    .option("o", {
      alias: "output",
      describe: "Output file (CSV format)",
      type: "string",
      demandOption: false,
    })
    .commandDir("cmds")
    .demandCommand()
    .help().argv;
};
