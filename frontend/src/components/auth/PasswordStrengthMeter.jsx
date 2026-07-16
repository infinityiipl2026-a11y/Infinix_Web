import { getPasswordStrength } from "../../validation/authSchemas";

const TOTAL_BARS = 5;

const PasswordStrengthMeter = ({ password }) => {
  if (!password) return null;

  const { score, label, color } = getPasswordStrength(password);

  return (
    <div className="pw-strength" aria-live="polite">
      <div className="pw-strength-bars">
        {Array.from({ length: TOTAL_BARS }).map((_, i) => (
          <span
            key={i}
            className="pw-strength-bar"
            style={{
              background: i <= score ? color : "var(--border-color, #e8ddd2)"
            }}
          />
        ))}
      </div>
      <span className="pw-strength-label" style={{ color }}>
        {label}
      </span>
    </div>
  );
};

export default PasswordStrengthMeter;
