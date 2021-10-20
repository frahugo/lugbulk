exports.command = "pdf <elements|megalots>";
exports.desc = "generate PDF for elements or megalots of a Lugbulk CSV file";
exports.builder = function (yargs) {
  return yargs.commandDir("pdf_cmds");
};
exports.handler = function (argv) {};
