// frontend/src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-dark text-light py-3 mt-auto">
      <div className="container text-center">
        <p className="mb-1">© {new Date().getFullYear()} HCMS 2.0 | All Rights Reserved</p>
        <p className="small mb-0">
          <strong>Healthcare Management System 2.0</strong> — Secure, Smart, QR-enabled prescriptions
        </p>
      </div>
    </footer>
  );
}
