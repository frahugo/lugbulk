exports.command = "print <elements>";
exports.desc = "print elements from a Lugbulk CSV file";
exports.builder = function (yargs) {
  return yargs.commandDir("print_cmds");
};
exports.handler = function (argv) {};
