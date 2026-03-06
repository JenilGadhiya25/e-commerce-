import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function AdminDashboardPage() {
  const { admin, logoutAdmin } = useAuth();

  return (
    <section className="adminPage" aria-label="Admin dashboard">
      <div className="container">
        <div className="adminTop">
          <div>
            <div className="adminTop__title">Admin Account</div>
            <div className="adminUsersCount">
              Logged in as <strong>{admin?.username || "admin"}</strong>
              {admin?.loggedInAt ? ` • ${new Date(admin.loggedInAt).toLocaleString()}` : ""}
            </div>
          </div>
          <div className="adminTop__actions">
            <Link className="cartActionBtn cartActionBtn--primary" to="/admin/orders">
              Orders
            </Link>
            <Link className="cartActionBtn" to="/admin/products">
              Products
            </Link>
            <Link className="cartActionBtn" to="/admin/users">
              Users
            </Link>
            <button className="cartActionBtn" type="button" onClick={logoutAdmin}>
              Logout
            </button>
          </div>
        </div>

        <div className="adminCard">
          <div className="adminCard__title">Account</div>
          <div className="adminOrder__customer">
            <strong>Username</strong>: {admin?.username || "admin"}
          </div>
          <div className="adminOrder__customer">
            <strong>Access</strong>: Admin only
          </div>
        </div>
      </div>
    </section>
  );
}
