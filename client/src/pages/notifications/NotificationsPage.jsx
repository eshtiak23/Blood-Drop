import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from "../../services/localStore";
import { Bell, Check, Trash2, CheckCheck } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = () => {
    const list = getNotifications();
    setNotifications(list);
    setUnreadCount(list.filter((n) => !n.isRead).length);
  };

  useEffect(() => { refresh(); }, []);

  const markRead = (id) => { markNotificationRead(id); refresh(); };
  const markAll = () => { markAllNotificationsRead(); refresh(); };
  const remove = (id) => { deleteNotification(id); refresh(); };

  const icon = (type) => ({ blood_request: "🩸", request_accepted: "✅", request_completed: "🎉", donor_verified: "🛡️", reminder: "⏰" }[type] || "🔔");

  return (
    <div className="container" style={{ padding: "32px 20px", maxWidth: 700 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><h1 style={{ fontSize: 24, fontWeight: 800 }}>Notifications</h1><p style={{ color: "var(--text-secondary)", marginTop: 4 }}>{unreadCount} unread</p></div>
        {unreadCount > 0 && <button className="btn btn-secondary btn-sm" onClick={markAll}><CheckCheck size={14} /> Mark all read</button>}
      </div>

      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
        {notifications.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><Bell size={28} color="var(--purple)" /></div><div className="empty-state-title">No notifications</div><div className="empty-state-desc">You're all caught up!</div></div>
        ) : notifications.map((n) => (
          <div key={n._id} className="card" style={{ padding: 16, background: !n.isRead ? "rgba(139,92,246,0.04)" : undefined, borderLeft: !n.isRead ? "3px solid var(--purple)" : undefined }}>
            <div style={{ display: "flex", gap: 12, alignItems: "start" }}>
              <span style={{ fontSize: 24 }}>{icon(n.type)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: 14 }}>{n.title}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>{n.message}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {!n.isRead && <button className="btn btn-ghost btn-sm" onClick={() => markRead(n._id)} style={{ padding: 6 }}><Check size={14} /></button>}
                <button className="btn btn-ghost btn-sm" onClick={() => remove(n._id)} style={{ padding: 6, color: "#EF4444" }}><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))
        }
      </div>
    </div>
  );
}
