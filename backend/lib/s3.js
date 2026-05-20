const AWS = require("aws-sdk");

const required = [
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
  "AWS_BUCKET_NAME",
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.warn(
    `[s3] Missing env vars: ${missing.join(", ")}. Upload routes will fail until configured.`
  );
}

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID?.trim(),
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY?.trim(),
  region: process.env.AWS_REGION?.trim(),
  signatureVersion: "v4",
});

const BUCKET = process.env.AWS_BUCKET_NAME?.trim();

/** Build a public S3 object URL from a key */
function getPublicUrl(key) {
  const region = process.env.AWS_REGION;
  return `https://${BUCKET}.s3.${region}.amazonaws.com/${key}`;
}

module.exports = { s3, BUCKET, getPublicUrl };
