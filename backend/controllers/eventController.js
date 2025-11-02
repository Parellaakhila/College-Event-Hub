import Event from "../models/Event.js";

// ✅ Create Event
export const createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json({ success: true, message: "Event created successfully", event });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating event", error: error.message });
  }
};

// ✅ Get All Events (for Student Dashboard)
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching events", error: error.message });
  }
};

// ✅ Get Event Stats (for Admin Dashboard)
export const getEventStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const categories = await Event.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    res.status(200).json({ totalEvents, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching stats", error: error.message });
  }
};
