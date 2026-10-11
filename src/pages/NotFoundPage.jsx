import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="card error-card">
      <h2>404 - Page not found</h2>
      <p className="muted">The page you are looking for does not exist.</p>
      <Link className="btn primary" to="/">Go to Scanner</Link>
    </section>
  );
}
