import { NavLink } from "react-router-dom";

const AdminNav = () => {
  return (
    <div className="admin-subnav">
      <NavLink
        to="/admin"
        end
        className={({ isActive }) => (isActive ? "admin-subnav-link active" : "admin-subnav-link")}
      >
        Products
      </NavLink>
      <NavLink
        to="/admin/orders"
        className={({ isActive }) => (isActive ? "admin-subnav-link active" : "admin-subnav-link")}
      >
        Orders
      </NavLink>
      <NavLink
        to="/admin/analytics"
        className={({ isActive }) => (isActive ? "admin-subnav-link active" : "admin-subnav-link")}
      >
        Analytics
      </NavLink>
    </div>
  );
};

export default AdminNav;
