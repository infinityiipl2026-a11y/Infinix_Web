const AuthSubmitButton = ({ loading, children, ...rest }) => {
  return (
    <button className="btn auth-submit-btn" type="submit" disabled={loading} {...rest}>
      {loading && <span className="auth-spinner" aria-hidden="true" />}
      <span>{loading ? "Please wait..." : children}</span>
    </button>
  );
};

export default AuthSubmitButton;
