const { Router } = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { courseModel } = require("../database/db");

const aiRouter = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn(
    "[ai] GEMINI_API_KEY is missing. Set it in backend/.env to enable the AI chatbot."
  );
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

function formatCoursesForPrompt(courses) {
  if (!courses || courses.length === 0) return "No courses available.";

  return courses
    .map((c, i) => {
      const title = c.title || "Untitled";
      const description = (c.description || "No description").slice(0, 220);
      const price = typeof c.price === "number" ? `₹${c.price}` : "N/A";
      const category = c.category || "General";
      return `${i + 1}. Title: ${title}
   Category: ${category}
   Price: ${price}
   Description: ${description}`;
    })
    .join("\n\n");
}

function buildPrompt(userMessage, coursesText) {
  return `You are "LearnBot", a friendly AI assistant for LearnHub, an online learning platform.

Your job is to recommend courses ONLY from the catalog below, based on the user's question.

=== AVAILABLE COURSES ===
${coursesText}
=== END OF COURSES ===

Rules:
- Recommend at most 3 courses, and only from the catalog above.
- If nothing matches, politely say so and suggest the closest alternative from the catalog.
- Never invent courses, prices, or details that are not in the catalog.
- Be concise, warm, and helpful (max ~120 words).
- Use light markdown: **bold** course titles, short bullet points, and mention the price.
- If the question is not about courses (e.g. greetings), reply briefly and invite them to ask about courses.

User question: "${userMessage}"

Answer:`;
}

aiRouter.post("/suggest", async (req, res) => {
  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "A non-empty 'message' is required.",
      });
    }

    if (!genAI) {
      return res.status(500).json({
        success: false,
        message:
          "AI service is not configured. Please set GEMINI_API_KEY on the server.",
      });
    }

    const courses = await courseModel
      .find({})
      .select("title description price image category")
      .sort({ _id: -1 })
      .lean();

    const coursesText = formatCoursesForPrompt(courses);
    const prompt = buildPrompt(message.trim(), coursesText);

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-flash-latest",
    });

    const result = await model.generateContent(prompt);
    const reply = result?.response?.text?.() || "";

    const recommended = pickRecommendedCourses(reply, courses);

    return res.status(200).json({
      success: true,
      reply: reply.trim() || "Sorry, I couldn't generate a response.",
      recommendations: recommended,
    });
  } catch (err) {
    const detail = err?.message || String(err);
    console.error("[ai/suggest] error:", detail);

    // Surface model/config issues clearly in the API response
    if (detail.includes("404") && detail.includes("models/")) {
      return res.status(500).json({
        success: false,
        message:
          "AI model not available. Set GEMINI_MODEL=gemini-flash-latest in backend/.env and restart the server.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while generating a response. Please try again.",
    });
  }
});

function pickRecommendedCourses(reply, courses) {
  if (!reply || !Array.isArray(courses) || courses.length === 0) return [];

  const lowerReply = reply.toLowerCase();
  const matches = courses
    .filter((c) => c.title && lowerReply.includes(c.title.toLowerCase()))
    .slice(0, 3)
    .map((c) => ({
      _id: c._id,
      title: c.title,
      description: c.description,
      price: c.price,
      image: c.image,
      category: c.category,
    }));

  return matches;
}

module.exports = { aiRouter };
