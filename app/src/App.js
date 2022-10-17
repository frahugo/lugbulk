// const { Adjustment } = require("lugbulk-lib/src/adjustment");
import { Adjustment } from "lugbulk-lib/src/adjustment";

import React from "react";
import { Button, Form, Row, Col, Container, Table } from "react-bootstrap";
import Html5QrcodePlugin from "./Html5QrcodePlugin.jsx";
import Html5QrcodePluginMobile from "./Html5QrcodePluginMobile.jsx";
import { isMobile } from "react-device-detect";

import "./App.css";

function Lot(props) {
  return (
    <tr>
      <td>{props.quantity}</td>
      <td>{props.adjustments}</td>
    </tr>
  );
}

function Lots(props) {
  return (
    <Table striped>
      <thead>
        <tr>
          <th key="header-1">Lot Sizes</th>
          <th key="header-2">Adjustments</th>
        </tr>
      </thead>
      <tbody>
        {props.list.map((item, index) => (
          <Lot quantity={item.quantity} adjustments={item.adjustments} index={index} key={index} />
        ))}
      </tbody>
    </Table>
  );
}

function DiscrepancyForm(props) {
  return (
    <Form className="mb-3 mt-3" onSubmit={(e) => e.preventDefault()}>
      <Row>
        <Col>
          <Form.Control placeholder="Discrepancy" onChange={props.onSubmit} />
        </Col>
        <Col />
      </Row>
    </Form>
  );
}

class ScanData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      adjustments: [],
      realCount: props.data.total,
    };
  }

  distributeDiscrepancy(e) {
    // console.log(this.state.data.lots);
    // console.log(e.target.value);
    let adjustment = new Adjustment(this.state.data.lots);
    let discrepancy = parseInt(e.target.value);

    if (isNaN(discrepancy)) {
      discrepancy = 0;
    }

    let theoricalCount = parseInt(this.state.data.total);
    let realCount = theoricalCount + discrepancy;

    adjustment.distribute(discrepancy);
    // console.log(adjustment.summaries);
    this.setState({ adjustments: adjustment.summaries, realCount: realCount });
  }

  render() {
    return (
      <div className="mt-4">
        <h2>{this.state.data.name}</h2>
        <h5>
          Theorical count:&nbsp;{this.state.data.total}
          <br />
          Real count:&nbsp;<b>{this.state.realCount}</b>
        </h5>
        <DiscrepancyForm onSubmit={(e) => this.distributeDiscrepancy(e)} />
        <Lots list={this.state.adjustments} />
      </div>
    );
  }
}

class Qrcode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showScanner: false,
      scanDone: false,
      scanData: {},
    };

    // Uncomment to test without having to scan a QR code
    // this.state = {
    //   showScanner: false,
    //   scanDone: true,
    //   scanData: {
    //     name: "PLATE 1X1, W/ 1.5 PLATE 1X2, UPWARDS",
    //     total: "1050",
    //     lots: ["200", "50", "300", "100", "100", "200", "100"],
    //   },
    // };

    // This binding is necessary to make `this` work in the callback.
    // this.onNewScanResult = this.onNewScanResult.bind(this);
  }

  onNewScanResult(decodedText, decodedResult) {
    // console.log("Qrcode [result]", decodedResult);

    // let decodedResult = this.state.decodedResult;
    // decodedResult.push(decodedResult);
    this.setState((state, props) => {
      // state.scanData.push(decodedResult);
      return state;
    });

    let data = JSON.parse(decodedResult.result.text);
    let scanData = {
      name: data.name,
      total: data.total,
      lots: data.lots.split(","),
    };

    // console.log(scanData);

    this.setState({
      showScanner: false,
      scanDone: true,
      scanData: scanData,
    });
  }

  onNewScanError(error) {
    console.warn(`Code scan error = ${error}`);
  }

  startQrcodeScanner() {
    this.setState({ showScanner: true, scanDone: false });
  }

  stopQrcodeScanner() {
    this.setState({ showScanner: false, scanDone: false });
  }

  render() {
    let scanData;
    let scanner;

    if (this.state.scanDone) {
      scanData = <ScanData data={this.state.scanData} />;
    } else {
      scanData = "";
    }

    if (this.state.showScanner) {
      if (isMobile) {
        scanner = (
          <div>
            <Button
              variant="outline-primary"
              className="mb-2"
              onClick={() => this.stopQrcodeScanner()}
            >
              Stop Scanning
            </Button>
            <Html5QrcodePluginMobile
              fps={1}
              qrbox={250}
              disableFlip={false}
              qrCodeSuccessCallback={(test, result) => this.onNewScanResult(test, result)}
              qrCodeErrorCallback={(error) => this.onNewScanError(error)}
            />
          </div>
        );
      } else {
        scanner = (
          <div>
            <Button
              variant="outline-primary"
              className="mb-2"
              onClick={() => this.stopQrcodeScanner()}
            >
              Stop Scanning
            </Button>
            <Html5QrcodePlugin
              fps={1}
              qrbox={250}
              disableFlip={false}
              qrCodeSuccessCallback={(test, result) => this.onNewScanResult(test, result)}
              qrCodeErrorCallback={(error) => this.onNewScanError(error)}
            />
          </div>
        );
      }
    } else {
      scanner = (
        <Button variant="outline-primary" onClick={() => this.startQrcodeScanner()}>
          Scan QR Code
        </Button>
      );
    }

    return (
      <Row>
        <Col>
          <Row>
            <Col className="col-sm-12 text-center">{scanner}</Col>
          </Row>
          {scanData}
        </Col>
      </Row>
    );
  }
}

const App = () => (
  <Container>
    <Container className="p-2 pt-3 mt-2 mb-4 bg-light rounded-3">
      <h1 className="header">LUGBulk Calculator</h1>
      <Qrcode />
    </Container>
  </Container>
);

export default App;
