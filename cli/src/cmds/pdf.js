exports.command = "pdf <type>";
exports.desc = "Generate PDF for elements, megalots or buyers";
exports.builder = function (yargs) {
  return yargs.commandDir("pdf_cmds");
};
exports.handler = function (argv) {};
