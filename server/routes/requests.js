import express from "express";
import Request from "../models/Request.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import { sendBloodRequestEmails } from "../utils/email.js";

const router = express.Router();

// GET /api/requests/search — MUST be before /:id to avoid param collision
router.get("/search", auth, async (req, res) => {
  try {
    const { bloodGroup, district, urgency } = req.query;
    let query = {};
    if (bloodGroup) query.patientBloodGroup = bloodGroup;
    if (district) query.district = district;
    if (urgency) query.urgency = urgency;
    const requests = await Request.find(query).populate("requester", "name email").populate("acceptedBy", "name").sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/requests/my — MUST be before /:id
router.get("/my", auth, async (req, res) => {
  try {
    const requests = await Request.find({ requester: req.user._id }).sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/requests
router.get("/", auth, async (req, res) => {
  try {
    const requests = await Request.find().populate("requester", "name email").populate("acceptedBy", "name").sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/requests/:id — AFTER /search and /my
router.get("/:id", auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate("requester", "name email").populate("acceptedBy", "name");
    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json({ request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/requests
router.post("/", auth, async (req, res) => {
  try {
    const request = await Request.create({ ...req.body, requester: req.user._id });
    const populated = await request.populate("requester", "name email");

    // Notify all users with matching blood group (excluding the requester)
    const matchingUsers = await User.find({
      _id: { $ne: req.user._id },
      bloodGroup: req.body.patientBloodGroup,
    }).select("_id");

    if (matchingUsers.length > 0) {
      const notifications = matchingUsers.map((u) => ({
        userId: u._id,
        type: "blood_request",
        title: "New Blood Request",
        message: `${req.user.name} needs ${req.body.unitsRequired} unit(s) of ${req.body.patientBloodGroup} blood at ${req.body.hospital || req.body.district}`,
      }));
      await Notification.insertMany(notifications);
    }

    // Send email notifications to matching donors with email addresses
    const donorsWithEmail = await User.find({
      _id: { $ne: req.user._id },
      bloodGroup: req.body.patientBloodGroup,
      email: { $exists: true, $ne: "" },
    }).select("email name");

    if (donorsWithEmail.length > 0) {
      sendBloodRequestEmails(donorsWithEmail, req.body).catch((err) =>
        console.error("[Email] Background send error:", err.message)
      );
    }

    res.status(201).json({ request: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/requests/:id/accept
router.patch("/:id/accept", auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.status !== "open") return res.status(400).json({ error: "Request is not open" });
    if (request.requester.toString() === req.user._id.toString()) return res.status(400).json({ error: "Cannot accept your own request" });
    request.status = "accepted";
    request.acceptedBy = req.user._id;
    await request.save();
    await Notification.create({
      userId: request.requester,
      type: "request_accepted",
      title: "Request Accepted",
      message: `${req.user.name} accepted your blood request for ${request.patientName}`,
    });
    const populated = await request.populate("requester", "name email").populate("acceptedBy", "name");
    res.json({ request: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/requests/:id/complete
router.patch("/:id/complete", auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.status !== "accepted") return res.status(400).json({ error: "Request is not accepted" });
    request.status = "completed";
    await request.save();
    await Notification.create({
      userId: request.requester,
      type: "request_completed",
      title: "Request Completed",
      message: `Your blood request for ${request.patientName} has been completed`,
    });
    const populated = await request.populate("requester", "name email").populate("acceptedBy", "name");
    res.json({ request: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/requests/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.requester.toString() !== req.user._id.toString()) return res.status(403).json({ error: "Not authorized" });
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: "Request deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
