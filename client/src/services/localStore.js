/**
 * localStore.js — API Data Service (MongoDB Atlas Backend)
 * 
 * This file handles ALL data operations by communicating with the backend API.
 * All data is stored in MongoDB Atlas (cloud database) via the Express server.
 * 
 * The backend provides endpoints for:
 * 1. Blood Requests — CRUD operations on /api/requests
 * 2. Notifications — CRUD operations on /api/notifications
 * 3. Bookmarks — CRUD operations on /api/bookmarks
 * 4. Donation Logs — CRUD operations on /api/donation-logs
 * 5. Feedback — CRUD operations on /api/feedback
 * 6. Ratings — CRUD operations on /api/ratings
 * 
 * Each function makes an HTTP request to the API using the centralized axios instance.
 */

import api from "./api.js";

// ── Blood Requests ──

/** Get all blood requests from all users */
export async function getRequests() {
  const res = await api.get("/requests");
  return res.data.requests;
}

/** Get only the requests created by the current user */
export async function getMyRequests() {
  const res = await api.get("/requests/my");
  return res.data.requests;
}

/** Create a new blood request */
export async function createRequest(data) {
  const res = await api.post("/requests", data);
  return res.data.request;
}

/** Accept a blood request — donor agrees to donate */
export async function acceptRequest(requestId) {
  const res = await api.patch(`/requests/${requestId}/accept`);
  return res.data.request;
}

/** Mark a request as completed — donation has been made */
export async function completeRequest(requestId) {
  const res = await api.patch(`/requests/${requestId}/complete`);
  return res.data.request;
}

/** Delete a blood request permanently */
export async function deleteRequest(requestId) {
  const res = await api.delete(`/requests/${requestId}`);
  return res.data;
}

/** Search/filter blood requests */
export async function searchRequests(filters = {}) {
  const params = new URLSearchParams();
  if (filters.bloodGroup) params.set("bloodGroup", filters.bloodGroup);
  if (filters.district) params.set("district", filters.district);
  if (filters.urgency) params.set("urgency", filters.urgency);
  const res = await api.get(`/requests/search?${params.toString()}`);
  return res.data.requests;
}

// ── Notifications ──

/** Get all notifications for the current user */
export async function getNotifications() {
  const res = await api.get("/notifications");
  return res.data.notifications;
}

/** Mark a single notification as read */
export async function markNotificationRead(id) {
  await api.patch(`/notifications/${id}/read`);
}

/** Mark ALL notifications as read at once */
export async function markAllNotificationsRead() {
  await api.patch("/notifications/read-all");
}

/** Delete a single notification permanently */
export async function deleteNotification(id) {
  await api.delete(`/notifications/${id}`);
}

// ── Bookmarks (Saved Donors) ──

/** Get all bookmarked donors for the current user */
export async function getBookmarks() {
  const res = await api.get("/bookmarks");
  return res.data.bookmarks;
}

/** Save a donor to bookmarks */
export async function addBookmark(donorId) {
  await api.post("/bookmarks", { donorId });
}

/** Remove a donor from bookmarks */
export async function removeBookmark(donorId) {
  await api.delete(`/bookmarks/${donorId}`);
}

/** Check if a specific donor is bookmarked */
export async function isBookmarked(donorId) {
  const res = await api.get(`/bookmarks/check/${donorId}`);
  return res.data.bookmarked;
}

// ── Donation Logs ──

/** Get all donation logs for the current user */
export async function getDonationLogs() {
  const res = await api.get("/donation-logs");
  return res.data.logs;
}

/** Log a new blood donation */
export async function addDonationLog(data) {
  const res = await api.post("/donation-logs", data);
  return res.data.log;
}

/** Delete a donation log */
export async function deleteDonationLog(logId) {
  await api.delete(`/donation-logs/${logId}`);
}

// ── Donation History (requests user donated to) ──

/** Get completed requests the current user accepted/donated to */
export async function getDonationHistory() {
  const res = await api.get("/requests/donation-history");
  return res.data.requests;
}

// ── Feedback / Reviews ──

/** Get all feedback entries */
export async function getAllFeedback() {
  const res = await api.get("/feedback");
  return res.data.feedback;
}

/** Get feedback left by the current user */
export async function getMyFeedback() {
  const res = await api.get("/feedback/my");
  return res.data.feedback;
}

/** Submit feedback / a review */
export async function addFeedback(data) {
  const res = await api.post("/feedback", data);
  return res.data.feedback;
}

/** Delete a feedback entry */
export async function deleteFeedback(feedbackId) {
  await api.delete(`/feedback/${feedbackId}`);
}

// ── Donor Ratings (after donation) ──

/** Check if user has already rated for a given request */
export async function hasRated(requestId) {
  const res = await api.get(`/ratings/check/${requestId}`);
  return res.data.rated;
}

/** Submit a rating for a user after completing a donation request */
export async function addRating(data) {
  const res = await api.post("/ratings", data);
  return res.data.rating;
}

/** Get all ratings for a specific user */
export async function getUserRatings(userId) {
  const res = await api.get(`/ratings/user/${userId}`);
  return res.data.ratings;
}

// ── Donation Cooldown Helper ──

/**
 * Check if a user is within the 3-month donation cooldown.
 * This is a client-side calculation using the user's lastDonationDate.
 */
export function getDonationCooldown(user) {
  if (!user || !user.lastDonationDate) return { cooledDown: false, daysSinceLast: 999, nextAvailable: null };
  const last = new Date(user.lastDonationDate);
  const now = new Date();
  const diffMs = now - last;
  const daysSinceLast = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const cooldownDays = 90;
  const nextAvailable = new Date(last.getTime() + cooldownDays * 86400000);
  return {
    cooledDown: daysSinceLast >= cooldownDays,
    daysSinceLast,
    nextAvailable: daysSinceLast < cooldownDays ? nextAvailable : null,
    daysRemaining: daysSinceLast < cooldownDays ? cooldownDays - daysSinceLast : 0,
  };
}
