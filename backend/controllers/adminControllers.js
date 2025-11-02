// backend/controllers/adminController.js
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Feedback from "../models/Feedback.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ status: "Active" });
    const totalRegistrations = await Registration.countDocuments();
    const pendingApprovals = await Registration.countDocuments({ status: "Pending" });

    res.json({
      totalEvents,
      activeEvents,
      totalRegistrations,
      pendingApprovals,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// 🟢 Create Event
export const createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);

    await Activity.create({
      eventName: event.title,
      action: "New Event Created",
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Get All Events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Update Event
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });

    await Activity.create({
      eventName: event.title,
      action: "Event Updated",
    });

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    await Activity.create({
      eventName: event.title,
      action: "Event Deleted",
    });

    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Get Registrations
export const getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find().populate("eventId", "title date");
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Approve / Reject Registration
export const updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    await Activity.create({
      eventName: registration.eventId.title,
      action: `Registration ${status}`,
    });

    res.json(registration);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟢 Get Feedbacks
export const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate("eventId", "title");
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// 🟢 Recent Activities
export const getRecentActivity = async (req, res) => {
  try {
    const recentEvents = await Event.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title updatedAt"); // selecting only what’s needed

    const formattedActivity = recentEvents.map(event => ({
      eventName: event.title,
      action: "Event Created or Updated",
      timestamp: event.updatedAt,
    }));

    res.json(formattedActivity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

