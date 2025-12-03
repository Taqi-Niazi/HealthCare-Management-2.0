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
        qrbox: { width: 260, height: 260 },
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

  const onScanError = () => {};

  return (
    <div className="container py-5 d-flex flex-column align-items-center">
      <h2 className="text-primary fw-bold mb-4">📷 Scan Prescription QR Code</h2>

      {!scanResult ? (
        <div
          id="qr-reader"
          className="shadow-lg border rounded"
          style={{
            width: "100%",
            maxWidth: "420px",
            minHeight: "380px",
            padding: "10px",
            backgroundColor: "#fff",
          }}
        ></div>
      ) : (
        <div
          className="card p-4 shadow-lg text-center"
          style={{ maxWidth: "480px", width: "100%" }}
        >
          <h5 className="text-dark mb-2 fw-semibold">Scanned Prescription Link</h5>
          <p className="text-break border rounded p-2 bg-light">{scanResult}</p>

          <a
            href={scanResult}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-success w-100 mb-2"
          >
            Open Prescription
          </a>

          <button className="btn btn-secondary w-100" onClick={() => setScanResult(null)}>
            Scan Again
          </button>
        </div>
      )}
    </div>
  );
}
