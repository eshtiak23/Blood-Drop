/**
 * localStore.js — LocalStorage Data Service (No Database Needed!)
 * 
 * This file handles ALL data storage using the browser's localStorage.
 * Instead of a server/database, everything is saved in the user's browser.
 * 
 * Three types of data are stored:
 * 1. Blood Requests (key: "ld_requests") — requests for blood donations
 * 2. Notifications (key: "ld_notifications") — alerts and updates for users
 * 3. Bookmarks (key: "ld_bookmarks") — donors saved for quick access
 * 
 * Each function below provides a simple way to read, create, update, or delete data.
 * All data is automatically saved to localStorage after every change.
 */

// localStorage keys — these are the "folder names" where data is stored
const REQUESTS_KEY = "ld_requests";
const NOTIFICATIONS_KEY = "ld_notifications";
const BOOKMARKS_KEY = "ld_bookmarks";

// ── Generic localStorage helpers ──

/** Read data from localStorage. Returns fallback (default: empty array) if nothing is saved. */
function get(key, fallback = []) {
  return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
}

/** Save data to localStorage. Converts JavaScript objects to text (JSON) for storage. */
function set(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Blood Requests ──

/** Get all blood requests from all users */
export function getRequests() {
  return get(REQUESTS_KEY);
}

/** Get only the requests created by a specific user (identified by userId) */
export function getMyRequests(userId) {
  return get(REQUESTS_KEY).filter((r) => r.requester?._id === userId);
}

/**
 * Create a new blood request.
 * Adds a unique ID, status "open", requester info, and timestamp.
 * The request appears at the top of the list (unshift = prepend).
 */
export function createRequest(data, user) {
  const requests = get(REQUESTS_KEY);
  const newReq = {
    _id: "r" + Date.now(),              // Unique ID based on current time
    ...data,                             // All form data (patient name, hospital, blood group, etc.)
    status: "open",                      // New requests always start as "open"
    requester: { _id: user._id, name: user.name, email: user.email },
    acceptedBy: null,                    // No donor has accepted yet
    createdAt: new Date().toISOString(),
  };
  requests.unshift(newReq);              // Add to the beginning of the list
  set(REQUESTS_KEY, requests);
  return newReq;
}

/**
 * Accept a blood request — a donor agrees to donate.
 * Changes status from "open" to "accepted" and records who accepted it.
 */
export function acceptRequest(requestId, donor) {
  const requests = get(REQUESTS_KEY);
  const idx = requests.findIndex((r) => r._id === requestId);
  if (idx === -1) throw new Error("Request not found");
  requests[idx].status = "accepted";
  requests[idx].acceptedBy = { _id: donor._id, name: donor.name };
  set(REQUESTS_KEY, requests);
  return requests[idx];
}

/**
 * Mark a request as completed — the donation has been made.
 * Changes status from "accepted" to "completed".
 */
export function completeRequest(requestId) {
  const requests = get(REQUESTS_KEY);
  const idx = requests.findIndex((r) => r._id === requestId);
  if (idx === -1) throw new Error("Request not found");
  requests[idx].status = "completed";
  set(REQUESTS_KEY, requests);
  return requests[idx];
}

/**
 * Search/filter blood requests.
 * Applies filters one by one — only requests matching ALL filters are returned.
 * If no filters are provided, returns all requests.
 */
export function searchRequests(filters = {}) {
  let list = get(REQUESTS_KEY);
  if (filters.bloodGroup) list = list.filter((r) => r.patientBloodGroup === filters.bloodGroup);
  if (filters.district) list = list.filter((r) => r.district === filters.district);
  if (filters.urgency) list = list.filter((r) => r.urgency === filters.urgency);
  return list;
}

// ── Notifications ──

/** Get all notifications for the current user */
export function getNotifications() {
  return get(NOTIFICATIONS_KEY);
}

/**
 * Create a new notification.
 * Marked as unread by default (isRead: false).
 * Types: blood_request, request_accepted, request_completed, donor_verified, reminder
 */
export function addNotification(data) {
  const list = get(NOTIFICATIONS_KEY);
  const n = { _id: "n" + Date.now(), ...data, isRead: false, createdAt: new Date().toISOString() };
  list.unshift(n);                       // Add to the top of the list
  set(NOTIFICATIONS_KEY, list);
  return n;
}

/** Mark a single notification as read (turns off the unread highlight) */
export function markNotificationRead(id) {
  const list = get(NOTIFICATIONS_KEY);
  const n = list.find((x) => x._id === id);
  if (n) n.isRead = true;
  set(NOTIFICATIONS_KEY, list);
}

/** Mark ALL notifications as read at once */
export function markAllNotificationsRead() {
  const list = get(NOTIFICATIONS_KEY).map((n) => ({ ...n, isRead: true }));
  set(NOTIFICATIONS_KEY, list);
}

/** Delete a single notification permanently */
export function deleteNotification(id) {
  const list = get(NOTIFICATIONS_KEY).filter((n) => n._id !== id);
  set(NOTIFICATIONS_KEY, list);
}

// ── Bookmarks (Saved Donors) ──

/** Get all bookmarked donors for the current user */
export function getBookmarks() {
  return get(BOOKMARKS_KEY);
}

/**
 * Save a donor to bookmarks.
 * Prevents duplicate bookmarks — if already saved, does nothing.
 */
export function addBookmark(donorId, donor) {
  const list = get(BOOKMARKS_KEY);
  if (list.find((b) => b.donorId === donorId)) return;   // Already bookmarked — skip
  list.unshift({ _id: "b" + Date.now(), donorId, donor });
  set(BOOKMARKS_KEY, list);
}

/** Remove a donor from bookmarks */
export function removeBookmark(donorId) {
  const list = get(BOOKMARKS_KEY).filter((b) => b.donorId !== donorId);
  set(BOOKMARKS_KEY, list);
}

/** Check if a specific donor is bookmarked (returns true/false) */
export function isBookmarked(donorId) {
  return get(BOOKMARKS_KEY).some((b) => b.donorId === donorId);
}
