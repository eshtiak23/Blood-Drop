const REQUESTS_KEY = "ld_requests";
const NOTIFICATIONS_KEY = "ld_notifications";
const BOOKMARKS_KEY = "ld_bookmarks";

function get(key, fallback = []) {
  return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
}

function set(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Blood Requests ──
export function getRequests() {
  return get(REQUESTS_KEY);
}

export function getMyRequests(userId) {
  return get(REQUESTS_KEY).filter((r) => r.requester?._id === userId);
}

export function createRequest(data, user) {
  const requests = get(REQUESTS_KEY);
  const newReq = {
    _id: "r" + Date.now(),
    ...data,
    status: "open",
    requester: { _id: user._id, name: user.name, email: user.email },
    acceptedBy: null,
    createdAt: new Date().toISOString(),
  };
  requests.unshift(newReq);
  set(REQUESTS_KEY, requests);
  return newReq;
}

export function acceptRequest(requestId, donor) {
  const requests = get(REQUESTS_KEY);
  const idx = requests.findIndex((r) => r._id === requestId);
  if (idx === -1) throw new Error("Request not found");
  requests[idx].status = "accepted";
  requests[idx].acceptedBy = { _id: donor._id, name: donor.name };
  set(REQUESTS_KEY, requests);
  return requests[idx];
}

export function completeRequest(requestId) {
  const requests = get(REQUESTS_KEY);
  const idx = requests.findIndex((r) => r._id === requestId);
  if (idx === -1) throw new Error("Request not found");
  requests[idx].status = "completed";
  set(REQUESTS_KEY, requests);
  return requests[idx];
}

export function searchRequests(filters = {}) {
  let list = get(REQUESTS_KEY);
  if (filters.bloodGroup) list = list.filter((r) => r.patientBloodGroup === filters.bloodGroup);
  if (filters.district) list = list.filter((r) => r.district === filters.district);
  if (filters.urgency) list = list.filter((r) => r.urgency === filters.urgency);
  return list;
}

// ── Notifications ──
export function getNotifications() {
  return get(NOTIFICATIONS_KEY);
}

export function addNotification(data) {
  const list = get(NOTIFICATIONS_KEY);
  const n = { _id: "n" + Date.now(), ...data, isRead: false, createdAt: new Date().toISOString() };
  list.unshift(n);
  set(NOTIFICATIONS_KEY, list);
  return n;
}

export function markNotificationRead(id) {
  const list = get(NOTIFICATIONS_KEY);
  const n = list.find((x) => x._id === id);
  if (n) n.isRead = true;
  set(NOTIFICATIONS_KEY, list);
}

export function markAllNotificationsRead() {
  const list = get(NOTIFICATIONS_KEY).map((n) => ({ ...n, isRead: true }));
  set(NOTIFICATIONS_KEY, list);
}

export function deleteNotification(id) {
  const list = get(NOTIFICATIONS_KEY).filter((n) => n._id !== id);
  set(NOTIFICATIONS_KEY, list);
}

// ── Bookmarks ──
export function getBookmarks() {
  return get(BOOKMARKS_KEY);
}

export function addBookmark(donorId, donor) {
  const list = get(BOOKMARKS_KEY);
  if (list.find((b) => b.donorId === donorId)) return;
  list.unshift({ _id: "b" + Date.now(), donorId, donor });
  set(BOOKMARKS_KEY, list);
}

export function removeBookmark(donorId) {
  const list = get(BOOKMARKS_KEY).filter((b) => b.donorId !== donorId);
  set(BOOKMARKS_KEY, list);
}

export function isBookmarked(donorId) {
  return get(BOOKMARKS_KEY).some((b) => b.donorId === donorId);
}
