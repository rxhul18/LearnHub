const { Router } = require("express");
const { userModel, purchaseModel } = require("../database/db");
const bcrypt = require("bcrypt");
const userRouter = Router();
const JWT_SECRET = process.env.USERJWT_SECRET;
const jwt = require("jsonwebtoken");
const { cookieOptions } = require("../lib/cookieOptions");
const userMiddleware = require("../middleware/userMiddleware");

userRouter.post("/signup", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password || !firstName || !lastName) {
    res.json({
      message: "Please provide all the fields",
    },400);
    return;
  }
  const hasedPassword = await bcrypt.hash(password, 5);
  try {
    await userModel.create({
      email: email,
      password: hasedPassword,
      firstName: firstName,
      lastName: lastName,
    });
    res.json({
      message: "Signup successful",
    },201);
    console.log("Signup successful", email);
    return;
  } catch (err) {
    res.json({
      message: "Signup failed",
      error: err,
    },400);
  }
});


userRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please provide all fields" });
  }
  const user = await userModel.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    return res
      .status(401)
      .json({ message: "Signin failed, Invalid Credentials" });
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  res.cookie("token", token, cookieOptions);
  console.log("Signin successful", email);
  // res.header("token", token);
  return res.status(200).json({ message: "Signin successful" });
});

userRouter.get("/purchases", userMiddleware, async (req, res) => {
  try {
    const courses = await purchaseModel.find({ userId: req.userId }).populate("courseId");
    res.status(200).json({
      message: "Courses purchased",
      courses,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching purchases",
      error: err.message
    });
  }
});

module.exports = {
  userRouter: userRouter,
};
