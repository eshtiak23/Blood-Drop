/**
 * NotificationsPage - Displays all user notifications with read/unread status.
 * Supports marking individual/all notifications as read and deleting them.
 * Each notification type has its own color scheme.
 * Clicking a notification navigates to the relevant page (if link exists).
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from "../../services/localStore";
import { Bell, Check, Trash2, CheckCheck, Droplets, CheckCircle, PartyPopper, Shield, Clock, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

const NOTIFICATION_STYLES = {
  blood_request: { icon: Droplets, bg: "#FEE2E2", color: "#DC2626", border: "#FECACA", darkBg: "rgba(239,68,68,0.12)", darkBorder: "rgba(239,68,68,0.25)" },
  request_accepted: { icon: CheckCircle, bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", darkBg: "rgba(5,150,105,0.12)", darkBorder: "rgba(5,150,105,0.25)" },
  request_completed: { icon: PartyPopper, bg: "#F3E8FF", color: "#7C3AED", border: "#DDD6FE", darkBg: "rgba(124,58,237,0.12)", darkBorder: "rgba(124,58,237,0.25)" },
  donor_verified: { icon: Shield, bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE", darkBg: "rgba(59,130,246,0.12)", darkBorder: "rgba(59,130,246,0.25)" },
  reminder: { icon: Clock, bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", darkBg: "rgba(217,119,6,0.12)", darkBorder: "rgba(217,119,6,0.25)" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const refresh = async () => {
    const list = await getNotifications();
    setNotifications(list);
    setUnreadCount(list.filter((n) => !n.isRead).length);
  };

  useEffect(() => { refresh(); }, []);

  const markRead = async (id) => { try { await markNotificationRead(id); refresh(); } catch { toast.error("Failed"); } };
  const markAll = async () => { try { await markAllNotificationsRead(); refresh(); toast.success("All notifications marked as read"); } catch { toast.error("Failed"); } };
  const remove = async (id, e) => { e.stopPropagation(); try { await deleteNotification(id); refresh(); toast.success("Notification deleted"); } catch { toast.error("Failed"); } };

  /** Handle notification click — navigate to link and mark as read */
  const handleClick = useCallback(async (n) => {
    if (n.link) {
      if (!n.isRead) await markNotificationRead(n._id).catch(() => {});
      navigate(n.link);
    } else if (!n.isRead) {
      markRead(n._id);
    }
  }, [navigate]);

  const getStyle = (type) => NOTIFICATION_STYLES[type] || NOTIFICATION_STYLES.blood_request;

  return (
    <div className="container" style={{ padding: "32px 20px", maxWidth: 700 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Notifications</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={markAll}>
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Bell size={28} color="var(--red)" /></div>
            <div className="empty-state-title">No notifications</div>
            <div className="empty-state-desc">You're all caught up!</div>
          </div>
        ) : notifications.map((n) => {
          const s = getStyle(n.type);
          const Icon = s.icon;
          const isDark = document.documentElement.classList.contains("dark");
          const hasLink = !!n.link;
          return (
            <div
              key={n._id}
              className="card"
              onClick={() => handleClick(n)}
              style={{
                padding: "14px 16px",
                background: !n.isRead ? (isDark ? s.darkBg : s.bg) : undefined,
                borderLeft: `3px solid ${!n.isRead ? s.color : "var(--border-light)"}`,
                transition: "all 0.2s",
                cursor: hasLink ? "pointer" : "default",
              }}
              onMouseEnter={(e) => { if (hasLink) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "start" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: isDark ? s.darkBg : s.bg,
                  border: `1.5px solid ${isDark ? s.darkBorder : s.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={16} color={s.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: 14, color: !n.isRead ? s.color : "var(--text)" }}>{n.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.5 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ display: "flex", gap: 2, flexShrink: 0, alignItems: "center" }}>
                  {hasLink && (
                    <ChevronRight size={16} color="var(--text-muted)" style={{ marginRight: 2 }} />
                  )}
                  {!n.isRead && (
                    <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); markRead(n._id); }} title="Mark as read" style={{ padding: 6, color: s.color }}>
                      <Check size={14} />
                    </button>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={(e) => remove(n._id, e)} title="Delete" style={{ padding: 6, color: "var(--red)" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
