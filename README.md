lugbulk
======

Tools for helping with the task of sorting parts from a LUG bulk.

![label example](/doc/example.jpg)

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

Assumptions
-----

- The LUG bulk order is provided in CSV format. If your order is a Google Sheet, you should export a CSV for the 'grid' of lots. See [lib/test/fixture/order.csv](/lib/test/fixtures/order.csv) for the expected format.
- The printer name is "DYMO LabelWriter 450". You can see the name of the printer in the `DYMO Label` software.

Usage
----

Open a terminal window and `cd` to the repository, in the `cli` sub-folder.

To list the elements:

    bin/lugbulk -i path-to-csv list elements

To list the buyers:

    bin/lugbulk -i path-to-csv list lots

The out of the above commands can also be sent to a CSV file by appending the option `-o csv-file-name`.

To print test labels:

    bin/lugbulk -i path-to-csv print test

To print the labels for the lots:

    bin/lugbulk -i path-to-csv print elements

To show help:

    bin/lugbulk
