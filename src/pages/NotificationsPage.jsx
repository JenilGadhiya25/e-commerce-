import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { clearNotifications, markAllRead, markNotificationRead } from "../notifications/notificationStore.js";
import { useNotifications } from "../notifications/useNotifications.js";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function NotificationsPage() {
  const { customer } = useAuth();
  const notifications = useNotifications(customer?.id);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <section className="notifPage" aria-label="Notifications">
      <div className="container">
        <div className="sectionTitle">
          <h2 className="sectionTitle__text">Notifications</h2>
          <div className="sectionTitle__underline" aria-hidden="true" />
        </div>

        {!customer ? (
          <div className="cartPageEmpty">
            Please <Link className="inlineLink" to="/login?redirect=%2Fnotifications">login</Link> to view notifications.
          </div>
        ) : (
          <div className="notifCard">
            <div className="notifTop">
              <div className="notifTop__meta">
                <strong>{notifications.length}</strong> total • <strong>{unread}</strong> unread
              </div>
              <div className="notifTop__actions">
                <button className="cartActionBtn" type="button" onClick={() => markAllRead(customer.id)} disabled={!unread}>
                  Mark all read
                </button>
                <button
                  className="cartActionBtn"
                  type="button"
                  onClick={() => clearNotifications(customer.id)}
                  disabled={!notifications.length}
                >
                  Clear
                </button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="notifEmpty">No notifications yet.</div>
            ) : (
              <div className="notifList" aria-label="Notification list">
                {notifications.map((n) => (
                  <div key={n.id} className={n.read ? "notifItem" : "notifItem notifItem--unread"}>
                    <div className="notifItem__row">
                      <div className="notifItem__title">{n.title || "Notification"}</div>
                      <div className="notifItem__date">{formatDate(n.createdAt)}</div>
                    </div>
                    {n.message ? <div className="notifItem__msg">{n.message}</div> : null}
                    {n.orderId ? <div className="notifItem__order">Order: {n.orderId}</div> : null}
                    {!n.read ? (
                      <button className="notifItem__mark" type="button" onClick={() => markNotificationRead(customer.id, n.id)}>
                        Mark as read
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

