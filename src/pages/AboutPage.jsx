export default function AboutPage() {
  return (
    <section className="card about">
      <h2>About this project</h2>
      <p>
        <strong>QR Code Scanner Interface</strong> is a browser-based tool that decodes QR codes from the
        device camera or an uploaded image - no installation required. Every scan is stored in a history
        that supports search, filtering, editing and deletion.
      </p>
      <h3>Tech stack</h3>
      <p className="muted">React 18 · React Router 6 · Vite · jsQR · JSON Server · Vitest + Testing Library</p>
      <h3>How it works</h3>
      <ol>
        <li>Video frames are sampled with <code>requestAnimationFrame</code> and drawn to a hidden canvas.</li>
        <li>The pixel data is decoded locally in the browser by <code>jsQR</code> - nothing is uploaded.</li>
        <li>Results are saved through a REST API (JSON Server) with an automatic localStorage fallback.</li>
      </ol>
      <h3>Privacy</h3>
      <p className="muted">Images and camera frames never leave your device.</p>
      <p className="muted small">Advanced Web Technologies · MCA · PCCoE · PRN 125M1H050</p>
    </section>
  );
}
