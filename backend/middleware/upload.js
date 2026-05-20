const path = require("path");
const multer = require("multer");
const { s3, BUCKET, getPublicUrl } = require("../lib/s3");

const IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const VIDEO_MIMES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

const IMAGE_MAX_SIZE = 5 * 1024 * 1024;
const VIDEO_MAX_SIZE = 500 * 1024 * 1024;

function uniqueKey(folder, originalname) {
  const ext = path.extname(originalname).toLowerCase();
  const safeName = path
    .basename(originalname, ext)
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 40);
  return `${folder}/${Date.now()}-${safeName}${ext}`;
}

/**
 * Custom multer storage — does NOT send ACL (multer-s3 defaults to ACL: private,
 * which causes "Access Denied" on buckets with ACLs disabled).
 */
function createS3Storage(folder) {
  return {
    _handleFile(req, file, cb) {
      const key = uniqueKey(folder, file.originalname);
      const params = {
        Bucket: BUCKET,
        Key: key,
        Body: file.stream,
        ContentType: file.mimetype,
      };

      s3.upload(params, (err, result) => {
        if (err) {
          console.error("[s3 upload]", err.code, err.message);
          return cb(err);
        }
        cb(null, {
          bucket: BUCKET,
          key: key,
          location: result.Location || getPublicUrl(key),
          mimetype: file.mimetype,
          size: file.size,
        });
      });
    },
    _removeFile(_req, file, cb) {
      s3.deleteObject({ Bucket: BUCKET, Key: file.key }, cb);
    },
  };
}

function imageFileFilter(_req, file, cb) {
  if (IMAGE_MIMES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed."));
  }
}

function videoFileFilter(_req, file, cb) {
  if (VIDEO_MIMES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only MP4, MOV, and WEBM videos are allowed."));
  }
}

const imageUpload = multer({
  storage: createS3Storage("thumbnails"),
  limits: { fileSize: IMAGE_MAX_SIZE },
  fileFilter: imageFileFilter,
});

const videoUpload = multer({
  storage: createS3Storage("videos"),
  limits: { fileSize: VIDEO_MAX_SIZE },
  fileFilter: videoFileFilter,
});

function handleUploadError(err) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return "File exceeds the maximum allowed size.";
    }
    return err.message;
  }

  const code = err?.code || err?.name;
  const msg = err?.message || "Upload failed.";

  if (code === "AccessDenied" || msg.includes("Access Denied")) {
    return (
      "S3 Access Denied. Ensure your IAM user has s3:PutObject on this bucket, " +
      "the bucket name/region in .env are correct, and ACLs are not required " +
      "(Object Ownership: Bucket owner enforced is supported)."
    );
  }

  if (code === "NoSuchBucket") {
    return "S3 bucket not found. Check AWS_BUCKET_NAME in backend/.env.";
  }

  if (code === "InvalidAccessKeyId" || code === "SignatureDoesNotMatch") {
    return "Invalid AWS credentials. Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.";
  }

  return msg;
}

function resolveFileUrl(file) {
  if (!file) return null;
  if (file.location) return file.location;
  if (file.key) return getPublicUrl(file.key);
  return null;
}

module.exports = {
  imageUpload,
  videoUpload,
  handleUploadError,
  resolveFileUrl,
};
