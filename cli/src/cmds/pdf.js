exports.command = "pdf <type>";
exports.desc = "Generate PDF for elements, megalots or buyers";
exports.builder = function (yargs) {
  return yargs.commandDir("pdf_cmds").option("i", {
    alias: "input",
    describe: "LugBluk order CSV file",
    type: "string",
    demandOption: true,
  });
};
exports.handler = function (argv) {};
