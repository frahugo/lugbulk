exports.command = "print <type>";
exports.desc = "Print element labels";
exports.builder = function (yargs) {
  return yargs.commandDir("print_cmds");
};
exports.handler = function (argv) {};
