import { useRef, useState } from 'react';
import useCameraScanner from '../hooks/useCameraScanner';
import { decodeImageFile } from '../utils/decodeImage';

/**
 * Scanner panel - camera preview/placeholder, Start/Stop, Upload Image, status + errors.
 * Props: onScan(value, source)  - called for every successful decode.
 */
export default function Scanner({ onScan }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const { videoRef, canvasRef, active, error, start, stop, setError } = useCameraScanner(
    (value) => onScan(value, 'camera')
  );

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;
    setUploadError('');
    setError('');
    setBusy(true);
    try {
      const value = await decodeImageFile(file);
      onScan(value, 'upload');
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const message = error || uploadError;

  return (
    <section className="card scanner" aria-label="Scanner">
      <div className={`preview ${active ? 'live' : ''}`}>
        <video ref={videoRef} muted playsInline className={active ? '' : 'hidden'} />
        <canvas ref={canvasRef} className="hidden" />
        {active ? (
          <div className="frame" aria-hidden="true" />
        ) : (
          <div className="placeholder">
            <span className="qr-icon" aria-hidden="true">▣</span>
            <p>Camera is off</p>
            <small>Start the camera or upload an image</small>
          </div>
        )}
      </div>

      <div className="actions">
        {active ? (
          <button className="btn danger" onClick={stop}>■ Stop Camera</button>
        ) : (
          <button className="btn primary" onClick={start}>▶ Start Camera</button>
        )}
        <button className="btn" onClick={() => fileRef.current?.click()} disabled={busy}>
          {busy ? 'Decoding…' : '⇪ Upload Image'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFile}
          aria-label="Upload QR image"
        />
      </div>

      <p className={`status ${message ? 'error' : ''}`} role={message ? 'alert' : 'status'}>
        {message || (active ? 'Scanning… point the camera at a QR code.' : 'Ready.')}
      </p>
    </section>
  );
}
