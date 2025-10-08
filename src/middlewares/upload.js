import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

// Factory function that returns an uploader for a given userId
function createUploader(pathToStore = "temp", referenceId = "temp") {
  // Base uploads directory
  const uploadsDir = path.join(
    __dirname,
    "..",
    "uploads",
    pathToStore,
    referenceId
  );

  // Ensure directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
      );
    },
  });

  // Allow all file types
  const fileFilter = (req, file, cb) => {
    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB per file
      files: 10, // Maximum 10 files
    },
  });
}

export default createUploader;
