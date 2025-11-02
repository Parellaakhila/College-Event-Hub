import express from "express";
import { createEvent, getAllEvents, getEventStats } from "../controllers/eventController.js";

const router = express.Router();

// Create Event (Admin)
router.post("/create", createEvent);

// Get All Events (Student Dashboard)
router.get("/all", getAllEvents);

// Get Event Stats (Admin Dashboard)
router.get("/stats", getEventStats);

export default router;
