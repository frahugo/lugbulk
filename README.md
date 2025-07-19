lugbulk
======

Tools for helping with the task of sorting parts from a LUG bulk.

![label example](/doc/example2.jpg)

![command line demo](/doc/command-line-demo.gif)

-----

The tools were developed on Mac OS X.

- Dymo LabelWriter 450
- [Dymo Label Software v8.7.5](https://download.dymo.com/dymo/Software/Mac/DLS8Setup.8.7.5.dmg) for editing labels if necessary
- `Dymo Label Web Service` running on port 41951
- 28mm x 89mm labels
- NodeJS 16.11+ installed


Installation
-----

- Clone the git repo locally
- If necessary, install NodeJS. If you use [ASDF](https://github.com/asdf-vm/asdf), you can follow [these instructions](https://github.com/asdf-vm/asdf-nodejs).
- Install the packages:

```
cd lugbulk
cd lib
npm install
cd ../cli
npm install
```

Note: if you have to modify the label templates (XML files), make sure you do not have a plugin that reformats the file on save. In VS code, run command `Save without formatting`.

Assumptions
-----

- The LUG bulk order is provided in CSV format. If your order is a Google Sheet, you should export a CSV for the 'grid' of lots. See [lib/test/fixture/order.csv](/lib/test/fixtures/order.csv) for the expected format.
- The printer name is "DYMO LabelWriter 450". You can see the name of the printer in the `DYMO Label` software.

Usage
----

Open a terminal window and `cd` to the repository, in the `cli` sub-folder.

To list the elements:

    bin/lugbulk list elements path-to-order-csv

To list the buyers:

    bin/lugbulk list lots path-to-order-csv

The `list` commands can send output to a CSV file by appending `-o csv-file-name` to the command.

### Labels

The name of the label printer is hardcoded in the source code to `DYMO LabelWriter 450`. To change it, edit [this file](https://github.com/frahugo/lugbulk/blob/master/cli/src/cmds/print_cmds/elements.js#L133).

To print test labels:

    bin/lugbulk print test path-to-order-csv

To print the labels for the lots:

    bin/lugbulk print elements path-to-order-csv

### PDF Files

To create the PDF files:

    bin/lugbulk pdf elements path-to-order-csv
    bin/lugbulk pdf megalots path-to-order-csv
    bin/lugbulk pdf buyers path-to-order-csv path-to-members-csv

To show help:

    bin/lugbulk

### Missing lots

If some elements were not received fast enough, you can print the missings lots per member.

1. Create a CSV and put the element IDs, one per line.
2. Run this command:

    bin/lugbulk print missings path-to-order-csv path-to-missing-lots

You can then attach each slip to the member's megalot sheet.

Development
---

To run the tests and watch for changes:

    cd lib
    npm run test -- --watch

For the web app:

    cd app
    npm start
    npm run build
    http-server build

QUELug instructions
---

For a project support or LUG bulk order, first, you need to export sheet with the right
buyers and quantities (the order sheet, not the nominations sheet).

- First, go in the Google Sheet and download as CSV the two sheets (replace X with appropriate number):
    - Commande: rename to lb202X-orig.csv
    - MembresCommande: rename to lb202X-membres.csv
- Open lb202X-orig.csv in LibreOffice or other software:
    - Make sure that the first row has LUG member IDs that are included in the bulk.
    - Review the buyers columns and remove the non-participating buyers.
    - Go at the bottom and look at the total pieces per buyer. If a buyer has 0 as the total, delete the column.
    - Then save the file as CSV format to lb202X.csv
    - Remove bottow rows (subtotals, totals, ...)
- Follow instruction above to generate the PDF files and labels.
