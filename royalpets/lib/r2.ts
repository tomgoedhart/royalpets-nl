import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// R2 Client Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "royalpets-images";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

// Validate environment variables
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.warn(
    "R2 environment variables not configured. File uploads will not work."
  );
}

// Create S3 client configured for Cloudflare R2
export const r2Client = new S3Client({
  region: "auto",
  endpoint: R2_ACCOUNT_ID
    ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : undefined,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "",
    secretAccessKey: R2_SECRET_ACCESS_KEY || "",
  },
});

// 24 hours in seconds (for temporary file expiry)
export const TEMP_FILE_EXPIRY_SECONDS = 24 * 60 * 60;

export interface UploadResult {
  key: string;
  url: string;
  publicUrl: string;
  expiresAt?: Date;
}

export interface UploadOptions {
  folder?: string;
  metadata?: Record<string, string>;
  isTemporary?: boolean;
}

/**
 * Upload a file to R2 storage
 * @param file - The file buffer to upload
 * @param filename - The desired filename
 * @param contentType - MIME type of the file
 * @param options - Upload options
 * @returns UploadResult with key, url, and publicUrl
 */
export async function uploadFile(
  file: Buffer,
  filename: string,
  contentType: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { folder = "uploads", metadata = {}, isTemporary = true } = options;

  // Generate unique key with timestamp to prevent collisions
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `${folder}/${timestamp}-${sanitizedFilename}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    Metadata: {
      ...metadata,
      uploadedAt: new Date().toISOString(),
      ...(isTemporary && { expiresIn: TEMP_FILE_EXPIRY_SECONDS.toString() }),
    },
  });

  await r2Client.send(command);

  // Build URLs
  const url = R2_PUBLIC_URL
    ? `${R2_PUBLIC_URL}/${key}`
    : `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`;

  const publicUrl = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : url;

  // Calculate expiry date for temporary files
  const expiresAt = isTemporary
    ? new Date(Date.now() + TEMP_FILE_EXPIRY_SECONDS * 1000)
    : undefined;

  return {
    key,
    url,
    publicUrl,
    expiresAt,
  };
}

/**
 * Generate a pre-signed URL for temporary access to a private file
 * @param key - The object key in R2
 * @param expiresInSeconds - URL expiry time (default: 1 hour)
 * @returns Pre-signed URL string
 */
export async function getSignedUrlForFile(
  key: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Generate a pre-signed URL for uploading directly from client
 * @param key - The desired object key
 * @param contentType - MIME type of the file
 * @param expiresInSeconds - URL expiry time (default: 15 minutes)
 * @returns Pre-signed upload URL
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds: number = 900
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Generate a unique key for a file upload
 * @param originalFilename - Original filename
 * @param folder - Target folder
 * @returns Unique key string
 */
export function generateFileKey(
  originalFilename: string,
  folder: string = "uploads"
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const hasExtension = originalFilename.includes(".");
  const extension = hasExtension ? originalFilename.split(".").pop() : "jpg";
  const baseName = hasExtension
    ? originalFilename.substring(0, originalFilename.lastIndexOf("."))
    : originalFilename;
  const sanitizedName = baseName
    .replace(/[^a-zA-Z0-9]/g, "_")
    .substring(0, 50);

  return `${folder}/${timestamp}-${random}-${sanitizedName}.${extension}`;
}

/**
 * Delete a file from R2 storage
 * @param key - The object key to delete
 */
export async function deleteFile(key: string): Promise<void> {
  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * Check if R2 is properly configured
 * @returns boolean indicating if R2 is ready
 */
export function isR2Configured(): boolean {
  return !!(
    R2_ACCOUNT_ID &&
    R2_ACCESS_KEY_ID &&
    R2_SECRET_ACCESS_KEY &&
    R2_BUCKET_NAME
  );
}
