exports.command = "list <elements|buyers>";
exports.desc = "list elements or buyers from a Lugbulk CSV file";
exports.builder = function (yargs) {
  return yargs.commandDir("list_cmds");
};
exports.handler = function (argv) {};
