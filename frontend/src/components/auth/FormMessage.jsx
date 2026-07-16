import { FiAlertCircle, FiCheckCircle, FiInfo } from "react-icons/fi";

const ICONS = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  info: FiInfo
};

const FormMessage = ({ type = "info", children }) => {
  if (!children) return null;
  const Icon = ICONS[type] || FiInfo;

  return (
    <div className={`auth-message auth-message-${type}`} role="alert">
      <Icon aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
};

export default FormMessage;
