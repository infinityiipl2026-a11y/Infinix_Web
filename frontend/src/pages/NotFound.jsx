import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="container section" style={{ textAlign: "center" }}>
      <h1 className="page-title">404 — Page Not Found</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
      <Link to="/" className="btn">
        Back To Home
      </Link>
    </div>
  );
};

export default NotFound;
