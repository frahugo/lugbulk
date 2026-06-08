exports.command = "list <type>";
exports.desc = "List buyers, elements or lots";
exports.builder = function (yargs) {
  return yargs.commandDir("list_cmds");
};
exports.handler = function (argv) {};
