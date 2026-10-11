import { NavLink } from 'react-router-dom';

/** Presentational component - title/subtitle come in via props (from FA-1). Now with routing navigation. */
export default function Header({ title, subtitle, historyCount = 0 }) {
  const cls = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');
  return (
    <header className="app-header">
      <div className="brand">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <nav aria-label="Main navigation">
        <NavLink to="/" end className={cls}>Scanner</NavLink>
        <NavLink to="/history" className={cls}>
          History <span className="badge">{historyCount}</span>
        </NavLink>
        <NavLink to="/about" className={cls}>About</NavLink>
      </nav>
    </header>
  );
}
