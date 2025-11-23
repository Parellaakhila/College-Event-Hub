// @ts-nocheck

import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import fs from "fs";

dotenv.config();

/* CLOUDINARY */
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* EMAIL */
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Campus Event Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Email error:", error.message);
  }
};

/* REGISTER FOR EVENT */
export const registerForEvent = async (req, res) => {
  try {
    const { eventId, name, email, college } = req.body;

    if (!eventId || !name || !email || !college)
      return res.status(400).json({ success: false, message: "All fields required" });

    const event = await Event.findById(eventId);
    if (!event)
      return res.status(404).json({ success: false, message: "Event not found" });

    const existing = await Registration.findOne({ eventId, studentEmail: email });
    if (existing)
      return res.status(400).json({ success: false, message: "Already registered" });

    const registration = await Registration.create({
      eventId,
      studentName: name,
      studentEmail: email,
      collegeName: college,
    });

    res.status(201).json({ success: true, message: "Registered Successfully", registration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* GET STUDENT REGISTRATIONS */
export const getStudentRegistrations = async (req, res) => {
  try {
    const { email } = req.params;
    const registrations = await Registration.find({ studentEmail: email })
      .select("eventId studentName studentEmail collegeName status feedbackGiven")
      .populate("eventId");

    res.json({ success: true, registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* DELETE REGISTRATION */
export const deleteRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    if (!registration)
      return res.status(404).json({ success: false, message: "Registration not found" });

    res.json({ success: true, message: "Registration deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
