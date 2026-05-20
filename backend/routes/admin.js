const { Router } = require("express");
const { adminModel, courseModel } = require("../database/db");
const adminRouter = Router();
const JWT_SECRET = process.env.ADMINJWT_SECRET;
const jwt = require("jsonwebtoken");
const { cookieOptions } = require("../lib/cookieOptions");
const bcrypt = require("bcrypt");
const adminMiddleware = require("../middleware/adminMiddeware");

adminRouter.post("/signup", async function (req, res) {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      message: "Please provide all the fields",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 5);
  try {
    await adminModel.create({
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
    });
    return res.status(201).json({
      message: "Admin Signup successful",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Admin Signup failed",
      error: error.message,
    });
  }
});

adminRouter.post("/signin", async function (req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please provide all fields" });
  }
  const admin = await adminModel.findOne({ email: email });
  if (!admin) {
    return res.status(404).json({
      message: "Admin not found",
    });
  }
  const comparePassword = await bcrypt.compare(password, admin.password);
  if (!comparePassword) {
    return res
      .status(401)
      .json({ message: "Signin failed, Invalid Credentials" });
  }
  const token = jwt.sign(
    {
      id: admin._id,
      role: admin.role,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  res.cookie("token", token, cookieOptions);
  console.log("Signin successful", email);
  return res.status(200).json({ message: "Signin successful" });
});

// Protected routes
adminRouter.post("/course", adminMiddleware, async function (req, res) {
  const adminId = req.adminId;
  const { title, description, imageUrl, price } = req.body;

  if (!title || !description || !imageUrl || !price) {
    return res.status(400).json({ message: "Please provide all the fields" });
  }

  const courseExists = await courseModel.findOne({ title });
  if (courseExists) {
    return res.status(400).json({ message: "Course already exists" });
  }

  const course = await courseModel.create({
    title,
    description,
    image: imageUrl,
    price,
    creatorId: adminId,
  });

  return res.status(201).json({
    message: "Course created",
    courseId: course._id,
  });
});

adminRouter.put("/course", adminMiddleware, async function (req, res) {
  const { courseId, title, description, price, image } = req.body;
  const adminId = req.adminId;
  
  const course = await courseModel.findOneAndUpdate(
    {
      _id: courseId,
      creatorId: adminId,
    },
    {
      title,
      description,
      price,
      image,
    },
    { new: true }
  );

  if (!course) {
    return res.status(404).json({
      message: "Course not found or you don't have permission to update it"
    });
  }

  return res.status(200).json({
    message: "Course updated successfully",
    course
  });
});

adminRouter.get("/course/bulk", adminMiddleware, async function (req, res) {
  const adminId = req.adminId;

  const courses = await courseModel.find({
    creatorId: adminId,
  });

  return res.status(200).json({
    message: "Courses retrieved successfully",
    courses,
  });
});

adminRouter.delete("/course", adminMiddleware, async function (req, res) {
  const { courseId } = req.body;
  const adminId = req.adminId;

  const course = await courseModel.findOneAndDelete({
    _id: courseId,
    creatorId: adminId
  });

  if (!course) {
    return res.status(404).json({
      message: "Course not found or you don't have permission to delete it"
    });
  }

  return res.status(200).json({
    message: "Course deleted successfully",
    courseId: course._id,
  });
});

module.exports = {
  adminRouter: adminRouter,
};
