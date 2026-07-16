import { forwardRef, useState } from "react";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import AuthInput from "./AuthInput";

const PasswordInput = forwardRef(({ id, label, error, hint, ...rest }, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <AuthInput
      id={id}
      ref={ref}
      label={label}
      type={visible ? "text" : "password"}
      error={error}
      hint={hint}
      icon={FiLock}
      autoComplete={rest.autoComplete || "current-password"}
      rightElement={
        <button
          type="button"
          className="auth-toggle-visibility"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          tabIndex={0}
        >
          {visible ? <FiEyeOff /> : <FiEye />}
        </button>
      }
      {...rest}
    />
  );
});

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
