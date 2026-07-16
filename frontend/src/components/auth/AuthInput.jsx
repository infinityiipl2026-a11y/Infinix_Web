import { forwardRef } from "react";

/**
 * Reusable labeled input used across all auth forms.
 * Works with react-hook-form's register() via forwardRef.
 */
const AuthInput = forwardRef(
  (
    {
      id,
      label,
      type = "text",
      error,
      hint,
      icon: Icon,
      rightElement,
      ...rest
    },
    ref
  ) => {
    const describedBy = [];
    if (error) describedBy.push(`${id}-error`);
    if (hint) describedBy.push(`${id}-hint`);

    return (
      <div className="auth-field">
        <label htmlFor={id} className="auth-field-label">
          {label}
        </label>

        <div className={`auth-field-control ${error ? "has-error" : ""}`}>
          {Icon && (
            <span className="auth-field-icon" aria-hidden="true">
              <Icon />
            </span>
          )}

          <input
            id={id}
            ref={ref}
            type={type}
            aria-invalid={!!error}
            aria-describedby={describedBy.join(" ") || undefined}
            {...rest}
          />

          {rightElement && (
            <span className="auth-field-right">{rightElement}</span>
          )}
        </div>

        {hint && !error && (
          <p id={`${id}-hint`} className="auth-field-hint">
            {hint}
          </p>
        )}

        {error && (
          <p id={`${id}-error`} className="auth-field-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";

export default AuthInput;
