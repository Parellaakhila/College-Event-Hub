import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Feedback from "../models/Feedback.js";
import Activity from "../models/Activity.js";

// 📌 DASHBOARD STATS
export const getDashboardStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ status: "Active" });
    const totalRegistrations = await Registration.countDocuments();
    const pendingApprovals = await Registration.countDocuments({
      status: "Pending",
    });

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

// 📌 CREATE EVENT
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

// 📌 GET ALL EVENTS
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 UPDATE EVENT
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    await Activity.create({
      eventName: event.title,
      action: "Event Updated",
    });

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 DELETE EVENT
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

// 📌 GET ADMIN VIEW REGISTRATIONS
export const getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find().populate("eventId");
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 APPROVE / REJECT REGISTRATION
export const updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("eventId");

    await Activity.create({
      eventName: registration.eventId.title,
      action: `Registration ${status}`,
    });

    res.json(registration);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 GET FEEDBACKS
export const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate("eventId", "title");
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 RECENT ACTIVITIES
export const getRecentActivity = async (req, res) => {
  try {
    const recentEvents = await Event.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title updatedAt");

    const formattedActivity = recentEvents.map((event) => ({
      eventName: event.title,
      action: "Event Created or Updated",
      timestamp: event.updatedAt,
    }));

    res.json(formattedActivity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 SUBMIT / UPDATE FEEDBACK (NO DUPLICATE)
export const submitFeedback = async (req, res) => {
  try {
    const { eventId, name, email, rating, comments } = req.body;

    const cleanedEmail = email.trim().toLowerCase();

    // 🔍 Check existing feedback
    let existing = await Feedback.findOne({ eventId, email: cleanedEmail });

    if (existing) {
      existing.rating = rating;
      existing.comments = comments;
      await existing.save();

      await Registration.updateOne(
        { eventId, studentEmail: cleanedEmail },
        { $set: { feedbackGiven: true } }
      );

      return res.json({ success: true, message: "Feedback updated" });
    }

    // 🆕 Add new feedback
    await Feedback.create({
      eventId,
      name,
      email: cleanedEmail,
      rating,
      comments,
    });

    await Registration.updateOne(
      { eventId, studentEmail: cleanedEmail },
      { $set: { feedbackGiven: true } }
    );

    res.json({ success: true, message: "Feedback submitted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📌 CHECK IF FEEDBACK EXISTS
export const checkFeedback = async (req, res) => {
  try {
    const { eventId, email } = req.params;
    const cleanedEmail = email.trim().toLowerCase();

    const feedback = await Feedback.findOne({ eventId, email: cleanedEmail });
    res.json({ feedback });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
