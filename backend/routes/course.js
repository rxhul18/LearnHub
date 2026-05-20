const { Router } = require("express");
const mongoose = require("mongoose");
const userMiddleware = require("../middleware/userMiddleware");
const { purchaseModel, courseModel } = require("../database/db");
const adminMiddleware = require("../middleware/adminMiddeware");
const courseRouter = Router();

courseRouter.post("/purchase", userMiddleware, async(req, res) => {
  const userId = req.userId;
  const courseId = req.body.courseId;

  // Check if user already purchased the course
  const existingPurchase = await purchaseModel.findOne({ userId, courseId });
  if (existingPurchase) {
    return res.status(400).json({
      message: "You have already purchased this course"
    });
  }

  await purchaseModel.create({ userId, courseId });
  res.status(201).json({
    message: "Course purchased",
  });
});

courseRouter.get("/purchased", userMiddleware, async(req, res) => {
  const userId = req.userId;
  const purchases = await purchaseModel.find({ userId }).populate("courseId");
  if (!purchases) {
    return res.status(404).json({
      message: "No purchases found"
    });
  }

  res.status(200).json({
    message: "Purchased courses",
    purchases
  });
});

courseRouter.get("/preview", userMiddleware, async(req, res) => {
  const courses = await courseModel.find({}).sort({ _id: -1 });
  res.status(200).json({
    message: "Courses",
    courses
  });
});

courseRouter.get("/launched", adminMiddleware, async(req, res) => {
  const adminId = req.adminId;
  const courses = await courseModel.find({ creatorId: adminId }).sort({ _id: -1 });
  
  if (!courses || courses.length === 0) {
    return res.status(404).json({
      message: "No courses found"
    });
  }

  res.status(200).json({
    message: "Launched courses",
    courses
  });
});

// Must be last — :id would otherwise match "launched", "preview", etc.
courseRouter.get("/:id", userMiddleware, async(req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: "Course not found" });
  }

  const course = await courseModel.findById(id);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }
  res.status(200).json({ message: "Course", course });
});

module.exports = {
  courseRouter: courseRouter
};
