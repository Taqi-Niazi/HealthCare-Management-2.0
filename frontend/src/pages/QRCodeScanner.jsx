// frontend/src/pages/QRCodeScanner.jsx
import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "react-toastify";

export default function QRCodeScanner() {
  const [scanResult, setScanResult] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!scanResult) {
      const scanner = new Html5QrcodeScanner("qr-reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      });

      scanner.render(onScanSuccess, onScanError);
      scannerRef.current = scanner;
    }

    return () => {
      scannerRef.current?.clear().catch(() => {});
    };
  }, [scanResult]);

  const onScanSuccess = (decodedText) => {
    setScanResult(decodedText);
    toast.success("QR Code Scanned Successfully!");
    scannerRef.current?.clear();
  };

  const onScanError = () => {
    // We keep this silent or very light — scanning errors are frequent.
  };

  return (
    <div className="container py-4 d-flex flex-column align-items-center">
      <h2 className="text-primary mb-3">Scan Prescription QR Code</h2>

      {!scanResult ? (
        <div
          id="qr-reader"
          className="shadow rounded"
          style={{
            width: "100%",
            maxWidth: "400px",
            margin: "auto",
            minHeight: "350px",
          }}
        ></div>
      ) : (
        <div className="card p-4 shadow-sm text-center" style={{ maxWidth: "450px", width: "100%" }}>
          <h5 className="mb-2">Scanned Result:</h5>
          <p className="text-break">{scanResult}</p>

          <a
            href={scanResult}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success w-100 mb-2"
          >
            Open Prescription
          </a>

          <button
            className="btn btn-secondary w-100"
            onClick={() => setScanResult(null)}
          >
            Scan Again
          </button>
        </div>
      )}
    </div>
  );
}
