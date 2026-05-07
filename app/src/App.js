// const { Adjustment } = require("lugbulk-lib/src/adjustment");
import { Adjustment } from "lugbulk-lib/src/adjustment";
import React, { useState } from "react";
import { Button, Form, Row, Col, Container, Table } from "react-bootstrap";
import Html5QrcodePlugin from "./Html5QrcodePlugin.jsx";
import Html5QrcodePluginMobile from "./Html5QrcodePluginMobile.jsx";
import { isMobile } from "react-device-detect";
import { GearFill } from "react-bootstrap-icons";

import "./App.css";

const APPS_SCRIPT_URL = process.env.REACT_APP_APPS_SCRIPT_URL;

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
          <Form.Control
            placeholder="Discrepancy"
            value={props.discrepancy}
            onChange={(e) => props.onChange(e.target.value)}
          />
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={props.onCalculate}>
            Calculate
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

class ScanData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      discrepancy: "",
      adjustments: [],
      realCount: props.data.total,
    };
  }

  calculate() {
    const adjustment = new Adjustment(this.state.data.lots);
    let discrepancy = parseInt(this.state.discrepancy);

    if (isNaN(discrepancy)) {
      discrepancy = 0;
    }

    const theoricalCount = parseInt(this.state.data.total);
    const realCount = theoricalCount + discrepancy;

    adjustment.distribute(discrepancy);
    const adjustments = adjustment.summaries;

    this.setState({ adjustments, realCount });

    if (!APPS_SCRIPT_URL) return;
    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({
        name: this.state.data.name,
        theoretical: theoricalCount,
        discrepancy,
        realCount,
        adjustments,
      }),
    }).catch((err) => console.error("Failed to record calculation:", err));
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
        <DiscrepancyForm
          discrepancy={this.state.discrepancy}
          onChange={(val) => this.setState({ discrepancy: val })}
          onCalculate={() => this.calculate()}
        />
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
              Arrêter le scan
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
              Arrêter le scan
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
        <div className="d-flex justify-content-center gap-2">
          <Button variant="success" onClick={() => this.startQrcodeScanner()}>
            Scanner code QR
          </Button>
          <Button variant="outline-secondary" onClick={this.props.onSettings} aria-label="Paramètres">
            <GearFill />
          </Button>
        </div>
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

function Settings({ onClose }) {
  const [name, setName] = useState(() => localStorage.getItem("name") || "");
  const [tableNumber, setTableNumber] = useState(() => localStorage.getItem("tableNumber") || "");
  const [balanceChoice, setBalanceChoice] = useState(() => localStorage.getItem("balanceChoice") || "Aucune");
  const [balanceNumber, setBalanceNumber] = useState(() => localStorage.getItem("balanceNumber") || "");

  function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem("name", trimmed);
    localStorage.setItem("tableNumber", tableNumber.trim());
    localStorage.setItem("balanceChoice", balanceChoice);
    localStorage.setItem("balanceNumber", balanceNumber.trim());
    onClose(trimmed);
  }

  return (
    <Container>
      <Container className="p-2 pt-3 mt-2 mb-4 bg-light rounded-3">
        <h1 className="header"><span className="fw-light">Calculateur</span> <span className="fw-bold">LUGBulk</span></h1>
        <h2 className="header text-center">Paramètres</h2>
        <Row className="justify-content-center">
          <Col xs={12} md={6}>
            <Form onSubmit={(e) => { e.preventDefault(); save(); }}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Nom(s)</Form.Label>
                <Form.Control
                  placeholder="Entrez votre ou vos noms"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Numéro de table</Form.Label>
                <Form.Control
                  placeholder="Numéro"
                  value={tableNumber}
                  type="number"
                  min="1"
                  inputMode="numeric"
                  onChange={(e) => setTableNumber(e.target.value)}
                  style={{ maxWidth: "8rem" }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Row className="align-items-start">
                  <Col xs="auto">
                    <Form.Label className="fw-bold">Balance</Form.Label>
                    {["Aucune", "Personnelle", "QueLug"].map((option) => (
                      <Form.Check
                        key={option}
                        type="radio"
                        label={option}
                        value={option}
                        checked={balanceChoice === option}
                        onChange={() => setBalanceChoice(option)}
                      />
                    ))}
                  </Col>
                  {balanceChoice === "QueLug" && (
                    <Col xs="auto">
                      <Form.Label className="fw-bold">Numéro de balance</Form.Label>
                      <Form.Control
                        placeholder="Numéro"
                        type="number"
                        min="1"
                        inputMode="numeric"
                        value={balanceNumber}
                        onChange={(e) => setBalanceNumber(e.target.value)}
                        style={{ maxWidth: "8rem" }}
                      />
                    </Col>
                  )}
                </Row>
              </Form.Group>
              <Button
                variant="primary"
                onClick={save}
                disabled={
                  !name.trim() ||
                  !tableNumber.trim() ||
                  !balanceChoice ||
                  (balanceChoice === "QueLug" && !balanceNumber.trim())
                }
              >
                Sauvegarder
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

function settingsSummary() {
  const name = localStorage.getItem("name") || "";
  const tableNumber = localStorage.getItem("tableNumber") || "";
  const balanceChoice = localStorage.getItem("balanceChoice") || "";
  const balanceNumber = localStorage.getItem("balanceNumber") || "";

  let balancePart;
  if (balanceChoice === "QueLug") {
    balancePart = `avec la balance #${balanceNumber}`;
  } else if (balanceChoice === "Personnelle") {
    balancePart = "avec balance personnelle";
  } else {
    balancePart = "sans balance";
  }

  return `${name} à la table ${tableNumber} ${balancePart}`;
}

const App = () => {
  const [showSettings, setShowSettings] = useState(() => !localStorage.getItem("name"));
  const [summary, setSummary] = useState(() => settingsSummary());

  function handleSettingsClose() {
    setSummary(settingsSummary());
    setShowSettings(false);
  }

  if (showSettings) {
    return <Settings onClose={handleSettingsClose} />;
  }

  return (
    <Container>
      <Container className="p-2 pt-3 mt-2 mb-4 bg-light rounded-3">
        <div className="text-center mb-3">
          <h1 className="header"><span className="fw-light">Calculateur</span> <span className="fw-bold">LUGBulk</span></h1>
          <p className="text-muted mb-0 fs-5">{summary}</p>
        </div>
        <Qrcode onSettings={() => setShowSettings(true)} />
      </Container>
    </Container>
  );
};

export default App;
