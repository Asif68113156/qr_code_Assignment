import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

const COOLDOWN_MS = 2500;
const MAX_FRAME_WIDTH = 640;

/** Maps getUserMedia errors to friendly messages (Error Handling). */
export function cameraErrorMessage(err) {
  switch (err?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Camera permission was denied. Allow camera access in the browser and try again.';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'No camera was found on this device.';
    case 'NotReadableError':
      return 'The camera is already in use by another application.';
    default:
      return 'Could not start the camera. Please try again or upload an image instead.';
  }
}

/**
 * Custom hook that owns the camera lifecycle and the frame-sampling loop.
 * - useRef   : video/canvas elements, MediaStream, animation-frame id
 * - useEffect: guarantees the camera is released on unmount
 * - useCallback: stable start/stop functions
 */
export default function useCameraScanner(onDetected) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(0);
  const lastRef = useRef({ value: '', at: 0 });
  const onDetectedRef = useRef(onDetected);

  const [active, setActive] = useState(false);
  const [error, setError] = useState('');

  // keep latest callback without restarting the loop
  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }, []);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const scale = Math.min(1, MAX_FRAME_WIDTH / video.videoWidth);
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
      if (code && code.data) {
        const now = Date.now();
        const last = lastRef.current;
        // ignore the same code if it was just reported (prevents duplicate history entries)
        if (code.data !== last.value || now - last.at > COOLDOWN_MS) {
          lastRef.current = { value: code.data, at: now };
          onDetectedRef.current?.(code.data);
        }
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(async () => {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser does not support camera access. Try uploading an image instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      await video.play();
      setActive(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      stop();
      setError(cameraErrorMessage(err));
    }
  }, [stop, tick]);

  // release the camera when the component unmounts / user navigates away
  useEffect(() => stop, [stop]);

  return { videoRef, canvasRef, active, error, start, stop, setError };
}
