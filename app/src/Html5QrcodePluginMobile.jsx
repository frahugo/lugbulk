import { Html5Qrcode } from "html5-qrcode";
import React from 'react';

const qrcodeRegionId = "html5qr-code-full-region";

class Html5QrcodePluginMobile extends React.Component {
  render() {
    return (
      <div id={qrcodeRegionId} />
    );
  }

  componentWillUnmount() {
    // TODO(mebjas): See if there is a better way to handle
    //  promise in `componentWillUnmount`.
    // console.log("Unmounting...");
    this.html5QrCode.stop().catch(error => {
      console.error("Failed to clear html5QrcodeScanner. ", error);
    });
  }

  componentDidMount() {
    // Creates the configuration object for Html5QrcodeScanner.
    function createConfig(props) {
      var config = {};
      if (props.fps) {
        config.fps = props.fps;
      }
      if (props.qrbox) {
        config.qrbox = props.qrbox;
        // config.qrbox = function(e,t){var n=e>t?t:e,o=Math.floor(.8*n);return o<250?n<250?{width:n,height:n}:{width:250,height:250}:{width:o,height:o}};
      }
      if (props.aspectRatio) {
        config.aspectRatio = props.aspectRatio;
      }
      if (props.disableFlip !== undefined) {
        config.disableFlip = props.disableFlip;
      }
      config.experimentalFeatures = { useBarCodeDetectorIfSupported: !0 };
      // config.rememberLastUsedCamera = !0;
      config.aspectRatio = 1.7777778;
      config.facingMode = "environment";
      config.supportedScanTypes = [0];
      return config;
    }

    var config = createConfig(this.props);

    this.html5QrCode = new Html5Qrcode(qrcodeRegionId);

    this.html5QrCode.start({ facingMode: "environment" }, config, this.props.qrCodeSuccessCallback);
  }
};

export default Html5QrcodePluginMobile;
