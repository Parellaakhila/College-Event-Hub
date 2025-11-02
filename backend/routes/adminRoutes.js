import express from "express";
import {
  getDashboardStats,
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
  getRegistrations,
  updateRegistrationStatus,
  getFeedbacks,
  getRecentActivity,
} from "../controllers/adminControllers.js";
import { adminOnly, protect } from "../middleware/auth.js";

const router = express.Router();

// Dashboard
router.get("/stats", getDashboardStats);

// Events
router.post("/events", createEvent);
router.get("/events", getAllEvents);
router.put("/events/:id", updateEvent);
router.delete("/events/:id", deleteEvent);

// Registrations
router.get("/registrations", getRegistrations);
router.put("/registrations/:id", updateRegistrationStatus);

// Feedback
router.get("/feedbacks", getFeedbacks);

// Activity Log
router.get("/activity", getRecentActivity);
router.get("/stats", protect, adminOnly, getDashboardStats);
export default router;
