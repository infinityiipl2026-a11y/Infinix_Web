/**
 * Wraps all auth pages. Intentionally reuses the existing `.auth-form`
 * class (defined in global.css) so the current design system/theme is kept,
 * and layers a new `.auth-card` class for the redesign-specific styling.
 */
const AuthCard = ({ eyebrow, title, subtitle, children }) => {
  return (
    <div className="container section">
      <div className="auth-form auth-card">
        {eyebrow && <span className="auth-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};

export default AuthCard;
