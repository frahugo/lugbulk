const { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } = require("node-thermal-printer");

const { Element } = require("lugbulk-lib/src/element");
const { Order } = require("lugbulk-lib/src/order");
const { Missings } = require("lugbulk-lib/src/missings");

exports.command = "missings <order_csv_file> <missing_elements_csv_file>";
exports.desc = "Print missings parts per megalot";
exports.builder = {};
exports.handler = function (argv) {
  const order = new Order();
  const missings = new Missings();
  order.load(argv.order_csv_file);
  missings.load(argv.missing_elements_csv_file);
  printMissings(order, missings);
  // printTest();
};

function printMissings(order, missings) {
  let printer = new ThermalPrinter({
    type: PrinterTypes.EPSON, // Printer type: 'star' or 'epson'
    interface: "tcp://192.168.2.59", // Printer interface
    width: 42,
    characterSet: CharacterSet.PC852_LATIN2, // Printer character set
    breakLine: BreakLine.WORD, // Break line after WORD or CHARACTERS. Disabled with NONE - default: WORD
    options: {
      // Additional options
      timeout: 5000, // Connection timeout (ms) [applicable only for network printers] - default: 3000
    },
  });

  for (var buyer of order.buyers) {
    var missingIds = [];
    var missingLots = [];
    for (var lot of buyer.lots) {
      if (missings.elementIds.includes(lot.elementId)) {
        missingIds.push(lot.elementId);
        missingLots.push(lot);
      }
    }
    printBuyerMissings(order, buyer, missingLots, printer);
  }

  try {
    let execute = printer.execute();
    console.error("Print done!");
  } catch (error) {
    console.log("Print failed:", error);
  }
}

function printBuyerMissings(order, buyer, missingLots, printer) {
  printer.alignCenter();
  printer.setTypeFontA();
  printer.setTextQuadArea();
  printer.bold(true);
  printer.print(buyer.memberId);
  printer.bold(false);
  printer.println(" " + buyer.pseudo);
  printer.setTextNormal();
  printer.drawLine();
  printer.println("Elements manquant");
  printer.newLine();
  // console.log(buyer.pseudo);

  for (var lot of missingLots) {
    let identifier = elementIdentifier(order, lot.elementId);
    // console.log(lot.sequence);
    // console.log(identifier);
    printer.setTextQuadArea();
    printer.println(lot.sequence);
    printer.setTextNormal();
    printer.println(identifier);
    printer.newLine();
  }

  if (missingLots.length === 0) {
    printer.println("*** Aucun ***");
  }

  printer.drawLine();
  printer.cut();
}

function elementIdentifier(order, elementId) {
  var element = order.findElement(elementId);
  var identifier = `${element.id} (${element.sequenceNumber})`;
  return identifier;
}

function printTest() {
  let printer = new ThermalPrinter({
    type: PrinterTypes.EPSON, // Printer type: 'star' or 'epson'
    interface: "tcp://192.168.2.59", // Printer interface
    width: 42,
    characterSet: CharacterSet.PC852_LATIN2, // Printer character set
    breakLine: BreakLine.WORD, // Break line after WORD or CHARACTERS. Disabled with NONE - default: WORD
    options: {
      // Additional options
      timeout: 5000, // Connection timeout (ms) [applicable only for network printers] - default: 3000
    },
  });

  printer.alignCenter();
  printer.setTypeFontA();
  printer.setTextQuadArea();
  printer.bold(true);
  printer.print("57");
  printer.bold(false);
  printer.println(" ThyClin");
  printer.setTextNormal();
  printer.drawLine();
  printer.println("Elements manquant");
  printer.newLine();

  printer.setTextQuadArea();
  printer.println("18");
  printer.setTextNormal();
  printer.println("6372265 (23)");
  printer.newLine();

  printer.setTextQuadArea();
  printer.println("28");
  printer.setTextNormal();
  printer.println("6327837 (39)");
  printer.newLine();

  printer.drawLine();
  printer.cut();

  try {
    let execute = printer.execute();
    console.error("Print done!");
  } catch (error) {
    console.log("Print failed:", error);
  }
}
