exports.command = "list <elements|lots>";
exports.desc = "list elements or lots from a Lugbulk CSV file";
exports.builder = function (yargs) {
  return yargs.commandDir("list_cmds");
};
exports.handler = function (argv) {};
