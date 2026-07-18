/**
 * friendService.js — Connection Request API Service
 *
 * Manages friend/connect requests between users.
 * When accepted, both users can see each other's phone numbers.
 *
 * Available functions:
 * - sendRequest(userId) → Send a connection request
 * - acceptRequest(requestId) → Accept a received request
 * - rejectRequest(requestId) → Reject a received request
 * - withdrawRequest(requestId) → Cancel a sent request or remove connection
 * - getStatus(userId) → Check connection status with a user
 * - getFriends() → List all accepted friends
 * - getPending() → List pending requests received
 */

import api from "./api.js";

/** Send a connection request to a user */
export const sendRequest = async (userId) => {
  const res = await api.post(`/friends/send/${userId}`);
  return res.data;
};

/** Accept a connection request */
export const acceptRequest = async (requestId) => {
  const res = await api.patch(`/friends/accept/${requestId}`);
  return res.data;
};

/** Reject a connection request */
export const rejectRequest = async (requestId) => {
  const res = await api.patch(`/friends/reject/${requestId}`);
  return res.data;
};

/** Withdraw a sent request or remove an existing connection */
export const withdrawRequest = async (requestId) => {
  const res = await api.delete(`/friends/${requestId}`);
  return res.data;
};

/** Check connection status with another user */
export const getStatus = async (userId) => {
  const res = await api.get(`/friends/status/${userId}`);
  return res.data;
};

/** List all accepted friends (with phone numbers visible) */
export const getFriends = async () => {
  const res = await api.get("/friends");
  return res.data.friends;
};

/** List pending connection requests received */
export const getPending = async () => {
  const res = await api.get("/friends/pending");
  return res.data.requests;
};
