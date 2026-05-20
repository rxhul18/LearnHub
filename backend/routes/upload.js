const { Router } = require("express");
const adminMiddleware = require("../middleware/adminMiddeware");
const {
  imageUpload,
  videoUpload,
  handleUploadError,
  resolveFileUrl,
} = require("../middleware/upload");

const uploadRouter = Router();

function runUpload(middleware) {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err) {
        const message = handleUploadError(err);
        const status =
          err?.code === "AccessDenied" || message.includes("Access Denied")
            ? 403
            : 400;
        return res.status(status).json({ success: false, message });
      }
      next();
    });
  };
}

/** POST /api/upload/image — thumbnail upload (admin only) */
uploadRouter.post(
  "/image",
  adminMiddleware,
  runUpload(imageUpload.single("file")),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided. Use field name 'file'.",
      });
    }

    const fileUrl = resolveFileUrl(req.file);
    if (!fileUrl) {
      return res.status(500).json({
        success: false,
        message: "Upload succeeded but file URL could not be resolved.",
      });
    }

    return res.status(200).json({ success: true, fileUrl });
  }
);

/** POST /api/upload/video — course video upload (admin only) */
uploadRouter.post(
  "/video",
  adminMiddleware,
  runUpload(videoUpload.single("file")),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file provided. Use field name 'file'.",
      });
    }

    const fileUrl = resolveFileUrl(req.file);
    if (!fileUrl) {
      return res.status(500).json({
        success: false,
        message: "Upload succeeded but file URL could not be resolved.",
      });
    }

    return res.status(200).json({ success: true, fileUrl });
  }
);

module.exports = { uploadRouter };
