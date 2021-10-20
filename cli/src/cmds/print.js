exports.command = "print <elements|lots|test>";
exports.desc = "print labels or sheets from a Lugbulk CSV file";
exports.builder = function (yargs) {
  return yargs.commandDir("print_cmds");
};
exports.handler = function (argv) {};
